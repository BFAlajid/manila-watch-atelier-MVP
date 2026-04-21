// GET/PUT/DELETE /api/watches/:slug — thin wrapper dispatching by method.
import { setCorsHeaders } from '../_lib/cors.js';
import { toCtx, sendResult } from '../_lib/handlers/adapter.js';
import { getWatchBySlug, updateWatch, deleteWatch } from '../_lib/handlers/watches.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const slug = req.query?.slug;
  const ctx = toCtx(req, typeof slug === 'string' ? { slug } : undefined);

  if (req.method === 'GET') return sendResult(res, await getWatchBySlug(ctx));
  if (req.method === 'PUT') return sendResult(res, await updateWatch(ctx));
  if (req.method === 'DELETE') return sendResult(res, await deleteWatch(ctx));

  return res.status(405).json({ error: 'Method not allowed' });
}
