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

export const handleChat: Handler = async (ctx) => {
  if (ctx.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('YOUR_KEY_HERE')) {
    return { status: 503, body: { error: 'AI chatbot is not configured. Please set ANTHROPIC_API_KEY.' } };
  }

  const body = (ctx.body || {}) as { messages?: any[]; sessionId?: string };
  const { messages, sessionId } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { status: 400, body: { error: 'Messages array is required' } };
  }
  if (messages.length > 40) {
    return { status: 400, body: { error: 'Conversation too long. Please start a new chat.' } };
  }

  // Force string content and cap sizes — blocks cost-DoS via array content.
  let totalChars = 0;
  for (const msg of messages) {
    if (!msg || (msg.role !== 'user' && msg.role !== 'assistant')) {
      return { status: 400, body: { error: 'Each message must have role "user" or "assistant".' } };
    }
    if (typeof msg.content !== 'string') {
      return { status: 400, body: { error: 'Message content must be a string.' } };
    }
    if (msg.content.length > 5000) {
      return { status: 400, body: { error: 'Message too long. Maximum 5000 characters.' } };
    }
    totalChars += msg.content.length;
  }
  if (totalChars > 50000) {
    return { status: 400, body: { error: 'Conversation too long. Please start a new chat.' } };
  }

  // Rate limit by client IP (not client-controlled sessionId) — sliding window + daily ceiling.
  if (isRateLimited(`chat:${ctx.clientIP}`, 30, 10 * 60 * 1000)) {
    return { status: 429, body: { error: "You're chatting too fast. Please wait a moment." } };
  }
  if (isRateLimited(`chat-day:${ctx.clientIP}`, 200, 24 * 60 * 60 * 1000)) {
    return { status: 429, body: { error: 'Daily chat limit reached. Please try again tomorrow or contact Sherard directly.' } };
  }

  const recentMessages = messages.slice(-20);
  const watches = getWatches();
  const systemPrompt = buildSystemPrompt(watches);
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

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
        // Gracefully stop rather than 502ing past the function timeout.
        finalText = finalText
          ? `${finalText}\n\n(Pausing here — would you like me to continue, or shall I have Sherard reach out directly?)`
          : "I need a moment — would you like me to continue, or shall I have Sherard reach out directly?";
        break;
      }

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
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
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: result,
        });
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    return {
      status: 200,
      body: {
        reply: finalText,
        sessionId: sessionId || crypto.randomUUID(),
      },
    };
  } catch (error: any) {
    console.error('[chat] Anthropic API error:', error?.message || error);
    if (error?.status === 401) {
      return { status: 503, body: { error: 'AI service authentication failed. Please check API key.' } };
    }
    if (error?.status === 429) {
      return { status: 503, body: { error: 'AI service is busy. Please try again in a moment.' } };
    }
    return { status: 500, body: { error: 'Failed to process chat message' } };
  }
};
