// GET /api/health — liveness check for uptime monitoring (UptimeRobot, Pingdom, etc.)
// Intentionally cheap: no DB/FS reads. Confirms the serverless function runtime + env
// is up and responsive. Does not verify downstream services; use /api/watches for that.

import { setCorsHeaders } from './_lib/cors.js';

const START_TIME = Date.now();

export default function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeMs: Date.now() - START_TIME,
    env: process.env.VERCEL_ENV || (process.env.NODE_ENV ?? 'unknown'),
    region: process.env.VERCEL_REGION || null,
  });
}
