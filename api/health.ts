// GET /api/health — thin wrapper over the shared healthCheck handler.
import { setCorsHeaders } from './_lib/cors.js';
import { toCtx, sendResult } from './_lib/handlers/adapter.js';
import { healthCheck } from './_lib/handlers/health.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const result = await healthCheck(toCtx(req));
  return sendResult(res, result);
}
