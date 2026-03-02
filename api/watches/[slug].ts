// GET/PUT/DELETE /api/watches/:slug
import { getWatches, saveWatches } from '../_lib/data.js';
import { verifyAuth } from '../_lib/auth.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  // ── GET: public — fetch single watch ──
  if (req.method === 'GET') {
    try {
      const watches = getWatches();
      const watch = watches.find((w) => w.slug === slug);

      if (!watch) {
        return res.status(404).json({ error: 'Watch not found' });
      }

      // Increment view count (best-effort, won't persist on Vercel)
      watch.viewCount = (watch.viewCount || 0) + 1;

      return res.status(200).json(watch);
    } catch (error) {
      console.error('Error fetching watch:', error);
      return res.status(500).json({ error: 'Failed to fetch watch' });
    }
  }

  // ── PUT: admin — update watch ──
  if (req.method === 'PUT') {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const watches = getWatches();
      const index = watches.findIndex((w) => w.slug === slug);
      if (index === -1) {
        return res.status(404).json({ error: 'Watch not found' });
      }

      watches[index] = {
        ...watches[index],
        ...req.body,
        updated_at: new Date().toISOString(),
      };

      try { saveWatches(watches); } catch { /* read-only on Vercel */ }

      return res.status(200).json({ success: true, watch: watches[index] });
    } catch (error) {
      console.error('Error updating watch:', error);
      return res.status(500).json({ error: 'Failed to update watch' });
    }
  }

  // ── DELETE: admin — mark as SOLD ──
  if (req.method === 'DELETE') {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const watches = getWatches();
      const index = watches.findIndex((w) => w.slug === slug);
      if (index === -1) {
        return res.status(404).json({ error: 'Watch not found' });
      }

      watches[index].status = 'SOLD';

      try { saveWatches(watches); } catch { /* read-only on Vercel */ }

      return res.status(200).json({ success: true, status: 'SOLD' });
    } catch (error) {
      console.error('Error deleting watch:', error);
      return res.status(500).json({ error: 'Failed to delete watch' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
