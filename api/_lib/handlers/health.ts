import type { Handler } from './types.js';

const START_TIME = Date.now();

export const healthCheck: Handler = async (ctx) => {
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    return { status: 405, body: { error: 'Method not allowed' } };
  }
  return {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
    body: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - START_TIME,
      env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || null,
    },
  };
};
