// POST /api/watches/bulk-import — thin wrapper over the shared
// bulkImportWatches handler. Used by the admin CSV import flow.
import { setCorsHeaders } from '../_lib/cors.js';
import { toCtx, sendResult } from '../_lib/handlers/adapter.js';
import { bulkImportWatches } from '../_lib/handlers/watches.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const result = await bulkImportWatches(toCtx(req));
  return sendResult(res, result);
}
