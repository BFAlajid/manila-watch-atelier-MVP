// GET /api/watches — thin wrapper over the shared listWatches handler.
import { setCorsHeaders } from './_lib/cors.js';
import { toCtx, sendResult } from './_lib/handlers/adapter.js';
import { listWatches } from './_lib/handlers/watches.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const result = await listWatches(toCtx(req));
  return sendResult(res, result);
}
