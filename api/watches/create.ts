// POST /api/watches/create — thin wrapper over the shared createWatch handler.
import { setCorsHeaders } from '../_lib/cors.js';
import { toCtx, sendResult } from '../_lib/handlers/adapter.js';
import { createWatch } from '../_lib/handlers/watches.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const result = await createWatch(toCtx(req));
  return sendResult(res, result);
}
