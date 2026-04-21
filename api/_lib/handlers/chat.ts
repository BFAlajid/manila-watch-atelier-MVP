import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import type { Handler } from './types.js';
import { getWatches } from '../data.js';
import { isRateLimited } from '../rate-limit.js';
import { buildSystemPrompt, chatTools, executeChatTool } from './chatTools.js';

// Stop issuing new tool-rounds before the Vercel function timeout burns us.
// Hobby tier = 10s hard limit; leave ~3s buffer for the final Anthropic call
// + JSON serialization. Override via CHAT_TIME_BUDGET_MS for Pro (up to ~25s).
const CHAT_TIME_BUDGET_MS = Number(process.env.CHAT_TIME_BUDGET_MS) || 7_000;
const MAX_TOOL_CALLS = Number(process.env.CHAT_MAX_TOOL_CALLS) || 3;
const MODEL = 'claude-sonnet-4-20250514';

// ── Shared validation ─────────────────────────────────────────────────────
type ValidationResult =
  | { ok: true; messages: any[]; sessionId?: string; status?: undefined; error?: undefined }
  | { ok: false; status: number; error: string; messages?: undefined; sessionId?: undefined };

function validateChatRequest(ctx: any): ValidationResult {
  if (ctx.method !== 'POST') return { ok: false, status: 405, error: 'Method not allowed' };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.includes('YOUR_KEY_HERE')) {
    return { ok: false, status: 503, error: 'AI chatbot is not configured. Please set ANTHROPIC_API_KEY.' };
  }

  const body = (ctx.body || {}) as { messages?: any[]; sessionId?: string };
  const { messages, sessionId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, error: 'Messages array is required' };
  }
  if (messages.length > 40) {
    return { ok: false, status: 400, error: 'Conversation too long. Please start a new chat.' };
  }

  let totalChars = 0;
  for (const msg of messages) {
    if (!msg || (msg.role !== 'user' && msg.role !== 'assistant')) {
      return { ok: false, status: 400, error: 'Each message must have role "user" or "assistant".' };
    }
    if (typeof msg.content !== 'string') {
      return { ok: false, status: 400, error: 'Message content must be a string.' };
    }
    if (msg.content.length > 5000) {
      return { ok: false, status: 400, error: 'Message too long. Maximum 5000 characters.' };
    }
    totalChars += msg.content.length;
  }
  if (totalChars > 50000) {
    return { ok: false, status: 400, error: 'Conversation too long. Please start a new chat.' };
  }

  if (isRateLimited(`chat:${ctx.clientIP}`, 30, 10 * 60 * 1000)) {
    return { ok: false, status: 429, error: "You're chatting too fast. Please wait a moment." };
  }
  if (isRateLimited(`chat-day:${ctx.clientIP}`, 200, 24 * 60 * 60 * 1000)) {
    return { ok: false, status: 429, error: 'Daily chat limit reached. Please try again tomorrow or contact Sherard directly.' };
  }

  return { ok: true, messages, sessionId };
}

// System prompt uses ephemeral prompt caching — Anthropic caches the 2-5k token
// system prompt for 5 minutes, cutting input tokens ~80% on follow-up messages.
function systemPromptBlocks(prompt: string): Anthropic.TextBlockParam[] {
  return [{ type: 'text', text: prompt, cache_control: { type: 'ephemeral' } }];
}

// ── Non-streaming handler (still used by tests, audit tools, and anything
//    that doesn't consume SSE). Wire-compatible with the old response shape. ──
export const handleChat: Handler = async (ctx) => {
  const check = validateChatRequest(ctx);
  if (!check.ok) return { status: check.status, body: { error: check.error } };
  const { messages, sessionId } = check as { ok: true; messages: any[]; sessionId?: string };

  const recentMessages = messages.slice(-20);
  const watches = await getWatches();
  const systemPrompt = buildSystemPrompt(watches);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  let currentMessages: Anthropic.MessageParam[] = recentMessages.map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
  let finalText = '';
  let toolCallCount = 0;
  const deadline = Date.now() + CHAT_TIME_BUDGET_MS;

  try {
    while (toolCallCount < MAX_TOOL_CALLS) {
      if (Date.now() > deadline) {
        finalText = finalText
          ? `${finalText}\n\n(Pausing here — would you like me to continue, or shall I have Sherard reach out directly?)`
          : "I need a moment — would you like me to continue, or shall I have Sherard reach out directly?";
        break;
      }

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemPromptBlocks(systemPrompt),
        tools: chatTools,
        messages: currentMessages,
      });

      const textBlocks = response.content.filter((b) => b.type === 'text');
      const toolBlocks = response.content.filter((b) => b.type === 'tool_use');
      if (textBlocks.length > 0) {
        finalText = textBlocks.map((b) => (b as any).text).join('');
      }
      if (toolBlocks.length === 0 || response.stop_reason !== 'tool_use') break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolBlocks) {
        const toolBlock = block as Anthropic.ToolUseBlock;
        toolCallCount++;
        const result = await executeChatTool(toolBlock.name, toolBlock.input, watches);
        toolResults.push({ type: 'tool_result', tool_use_id: toolBlock.id, content: result });
      }
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    return {
      status: 200,
      body: { reply: finalText, sessionId: sessionId || crypto.randomUUID() },
    };
  } catch (error: any) {
    console.error('[chat] Anthropic API error:', error?.message || error);
    if (error?.status === 401) return { status: 503, body: { error: 'AI service authentication failed.' } };
    if (error?.status === 429) return { status: 503, body: { error: 'AI service is busy. Please try again in a moment.' } };
    return { status: 500, body: { error: 'Failed to process chat message' } };
  }
};

// ── Streaming handler — writes SSE directly to res for a live token feed.
//    Used by the /api/chat endpoint (both Vercel and Express wrappers). ──
type Emit = (event: string, data: unknown) => void;

export async function streamChat(ctx: any, res: any): Promise<void> {
  const check = validateChatRequest(ctx);
  if (!check.ok) {
    res.status(check.status).json({ error: check.error });
    return;
  }
  const { messages, sessionId } = check as { ok: true; messages: any[]; sessionId?: string };

  // SSE headers. `X-Accel-Buffering: no` prevents reverse proxies (nginx,
  // Vercel's edge) from buffering the stream.
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const emit: Emit = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const recentMessages = messages.slice(-20);
  const watches = await getWatches();
  const systemPrompt = buildSystemPrompt(watches);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  let currentMessages: Anthropic.MessageParam[] = recentMessages.map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
  let toolCallCount = 0;
  const deadline = Date.now() + CHAT_TIME_BUDGET_MS;
  const finalSessionId = sessionId || crypto.randomUUID();

  try {
    while (toolCallCount < MAX_TOOL_CALLS) {
      if (Date.now() > deadline) {
        emit('text', {
          chunk:
            '\n\n(Pausing here — would you like me to continue, or shall I have Sherard reach out directly?)',
        });
        break;
      }

      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 1024,
        system: systemPromptBlocks(systemPrompt),
        tools: chatTools,
        messages: currentMessages,
      });

      // Stream text deltas to the client as they arrive.
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && (event.delta as any)?.type === 'text_delta') {
          const text = (event.delta as any).text as string;
          if (text) emit('text', { chunk: text });
        }
      }

      const finalResponse = await stream.finalMessage();
      const toolBlocks = finalResponse.content.filter((b) => b.type === 'tool_use');
      if (toolBlocks.length === 0 || finalResponse.stop_reason !== 'tool_use') break;

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolBlocks) {
        const toolBlock = block as Anthropic.ToolUseBlock;
        toolCallCount++;
        emit('tool', { name: toolBlock.name, status: 'executing' });
        const result = await executeChatTool(toolBlock.name, toolBlock.input, watches);
        toolResults.push({ type: 'tool_result', tool_use_id: toolBlock.id, content: result });
      }
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: finalResponse.content },
        { role: 'user', content: toolResults },
      ];
    }

    emit('done', { sessionId: finalSessionId });
  } catch (error: any) {
    console.error('[chat/stream] Anthropic API error:', error?.message || error);
    const msg =
      error?.status === 401
        ? 'AI service authentication failed.'
        : error?.status === 429
          ? 'AI service is busy. Please try again in a moment.'
          : 'Failed to process chat message';
    emit('error', { error: msg });
  } finally {
    try {
      res.end();
    } catch {
      // connection already closed
    }
  }
}
