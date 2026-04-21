// POST /api/inquiries — public submit inquiry (thin wrapper)
// GET  /api/inquiries — admin list inquiries (thin wrapper)
import { setCorsHeaders } from './_lib/cors.js';
import { toCtx, sendResult } from './_lib/handlers/adapter.js';
import { createInquiry, listInquiries } from './_lib/handlers/inquiries.js';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ctx = toCtx(req);
  if (req.method === 'POST') return sendResult(res, await createInquiry(ctx));
  if (req.method === 'GET') return sendResult(res, await listInquiries(ctx));
  return res.status(405).json({ error: 'Method not allowed' });
}
