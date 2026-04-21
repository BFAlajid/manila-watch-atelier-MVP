// PUT /api/inquiries/:id — thin wrapper over updateInquiryStatus handler.
import { setCorsHeaders } from '../_lib/cors.js';
import { toCtx, sendResult } from '../_lib/handlers/adapter.js';
import { updateInquiryStatus } from '../_lib/handlers/inquiries.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = req.query?.id;
  const ctx = toCtx(req, typeof id === 'string' ? { id } : undefined);
  return sendResult(res, await updateInquiryStatus(ctx));
}
