// Request/response adapters for the Vercel serverless runtime.
// dev-server.js has its own Express adapter (can't import from here because it's ESM-JS).

import { verifyAuth } from '../auth.js';
import type { HandlerContext, HandlerResult } from './types.js';

function lowercaseHeaders(h: Record<string, any>): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(h || {})) {
    if (v === undefined) continue;
    out[k.toLowerCase()] = Array.isArray(v) ? v[0] : String(v);
  }
  return out;
}

function resolveClientIP(req: any): string {
  const xff = req.headers?.['x-forwarded-for'];
  const firstHop = typeof xff === 'string' ? xff.split(',')[0]?.trim() : Array.isArray(xff) ? xff[0] : undefined;
  return firstHop || req.socket?.remoteAddress || 'unknown';
}

export function toCtx(req: any, extraQuery?: Record<string, string>): HandlerContext {
  return {
    method: (req.method || 'GET').toUpperCase(),
    query: { ...(req.query || {}), ...(extraQuery || {}) },
    body: req.body ?? null,
    headers: lowercaseHeaders(req.headers || {}),
    auth: verifyAuth(req),
    clientIP: resolveClientIP(req),
  };
}

export function sendResult(res: any, result: HandlerResult): void {
  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }
  if (result.body === undefined) return res.status(result.status).end();
  return res.status(result.status).json(result.body);
}
