// PUT /api/inquiries/:id — Admin: update inquiry status
import { getInquiries, saveInquiries } from '../_lib/data.js';
import { verifyAuth } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { inquiryStatusSchema } from '../_lib/validation.js';

export default function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Inquiry ID is required' });
  }

  try {
    const parsed = inquiryStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const inquiries = getInquiries();
    const index = inquiries.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    inquiries[index] = { ...inquiries[index], ...parsed.data };

    try {
      saveInquiries(inquiries);
    } catch (err: any) {
      console.error('[inquiries/:id] saveInquiries failed (expected on Vercel read-only FS):', err?.message || err);
    }

    return res.status(200).json({ success: true, inquiry: inquiries[index] });
  } catch (error: any) {
    console.error('Error updating inquiry:', error?.message || error);
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
}
