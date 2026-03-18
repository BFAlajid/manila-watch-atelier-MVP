// GET /api/watches — List all watches with filtering
import { getWatches } from './_lib/data.js';
import { setCorsHeaders } from './_lib/cors.js';

export default function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let watches = getWatches();

    const {
      brand,
      minPrice,
      maxPrice,
      condition,
      sort,
      search,
      status,
      category,
      tier,
      featured,
    } = req.query;

    // Filter by status (default: AVAILABLE)
    const targetStatus = status || 'AVAILABLE';
    if (targetStatus !== 'ALL') {
      watches = watches.filter((w) => w.status === targetStatus);
    }

    if (brand && brand !== 'All') {
      watches = watches.filter(
        (w) => w.brand.toLowerCase() === brand.toString().toLowerCase()
      );
    }

    if (category && category !== 'All') {
      watches = watches.filter((w) => w.category === category);
    }

    if (tier && tier !== 'All') {
      watches = watches.filter((w) => w.tier === tier);
    }

    if (condition) {
      watches = watches.filter((w) => w.condition === condition);
    }

    if (minPrice) {
      watches = watches.filter((w) => w.price_php >= parseInt(minPrice));
    }
    if (maxPrice) {
      watches = watches.filter((w) => w.price_php <= parseInt(maxPrice));
    }

    if (search) {
      const q = search.toString().toLowerCase();
      watches = watches.filter(
        (w) =>
          w.brand.toLowerCase().includes(q) ||
          w.model.toLowerCase().includes(q) ||
          w.name.toLowerCase().includes(q) ||
          w.reference.toLowerCase().includes(q) ||
          (w.description && w.description.toLowerCase().includes(q))
      );
    }

    if (featured === 'true') {
      watches = watches.filter((w) => w.featured);
    }

    // Sort
    if (sort === 'price_asc') watches.sort((a, b) => a.price_php - b.price_php);
    else if (sort === 'price_desc')
      watches.sort((a, b) => b.price_php - a.price_php);
    else if (sort === 'popular')
      watches.sort((a, b) => b.viewCount - a.viewCount);
    else watches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json(watches);
  } catch (error) {
    console.error('Error fetching watches:', error);
    return res.status(500).json({ error: 'Failed to fetch watches' });
  }
}
