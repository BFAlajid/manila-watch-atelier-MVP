// POST /api/inquiries — public: submit inquiry
// GET  /api/inquiries — admin: list all inquiries
import crypto from 'crypto';
import { getWatches, getInquiries, saveInquiries } from './_lib/data.js';
import { verifyAuth } from './_lib/auth.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: public — submit inquiry ──
  if (req.method === 'POST') {
    try {
      const { name, email, phone, message, watchId } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      // Attach watch info if watchId provided
      let watch = null;
      if (watchId) {
        const watches = getWatches();
        const w = watches.find((w) => w.id === watchId);
        if (w) {
          watch = {
            id: w.id,
            slug: w.slug,
            brand: w.brand,
            model: w.model,
            reference: w.reference,
            pricePHP: w.pricePHP,
            images: w.images,
          };
        }
      }

      const inquiry = {
        id: crypto.randomUUID(),
        name,
        email,
        phone: phone || null,
        message: message || '',
        watchId: watchId || null,
        watch,
        source: 'FORM',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };

      const inquiries = getInquiries();
      inquiries.push(inquiry);

      try { saveInquiries(inquiries); } catch { /* read-only on Vercel */ }

      return res.status(201).json({ success: true, id: inquiry.id });
    } catch (error) {
      console.error('Error creating inquiry:', error);
      return res.status(500).json({ error: 'Failed to submit inquiry' });
    }
  }

  // ── GET: admin — list inquiries ──
  if (req.method === 'GET') {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const inquiries = getInquiries();
      const { status, limit } = req.query;

      let filtered = inquiries;
      if (status && status !== 'ALL') {
        filtered = filtered.filter((i: any) => i.status === status);
      }

      // Sort newest first
      filtered.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (limit) {
        filtered = filtered.slice(0, parseInt(limit));
      }

      return res.status(200).json(filtered);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
