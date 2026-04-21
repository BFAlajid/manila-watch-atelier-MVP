// POST /api/auth — thin wrapper over the shared login handler.
import { setCorsHeaders } from './_lib/cors.js';
import { toCtx, sendResult } from './_lib/handlers/adapter.js';
import { login } from './_lib/handlers/auth.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const result = await login(toCtx(req));
  return sendResult(res, result);
}
