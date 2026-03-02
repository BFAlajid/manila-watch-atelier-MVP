// PUT /api/inquiries/:id — Admin: update inquiry status
import { getInquiries, saveInquiries } from '../_lib/data.js';
import { verifyAuth } from '../_lib/auth.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
    const { status } = req.body;

    if (!status || !['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be NEW, CONTACTED, or CLOSED.' });
    }

    const inquiries = getInquiries();
    const index = inquiries.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    inquiries[index] = { ...inquiries[index], status };

    try { saveInquiries(inquiries); } catch { /* read-only on Vercel */ }

    return res.status(200).json({ success: true, inquiry: inquiries[index] });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
}
