// POST /api/watches/create — Admin: create new watch
import { getWatches, saveWatches } from '../_lib/data.js';
import { verifyAuth } from '../_lib/auth.js';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = req.body;

    if (!data.slug || !data.brand || !data.model || !data.pricePHP) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: slug, brand, model, pricePHP' });
    }

    const watches = getWatches();
    const existing = watches.find((w) => w.slug === data.slug);
    if (existing) {
      return res
        .status(409)
        .json({ error: 'A watch with this slug already exists' });
    }

    const watch = {
      id: data.id || `watch-${Date.now()}`,
      slug: data.slug,
      brand: data.brand,
      model: data.model,
      reference: data.reference || '',
      name: data.name || `${data.model}${data.nickname ? ` "${data.nickname}"` : ''}`,
      nickname: data.nickname || null,
      year: data.year ? parseInt(data.year) : null,
      price_php: parseInt(data.pricePHP),
      pricePHP: parseInt(data.pricePHP),
      retailPricePHP: data.retailPricePHP ? parseInt(data.retailPricePHP) : null,
      condition: data.condition || 'excellent',
      box: data.box ?? true,
      papers: data.papers ?? true,
      boxPapers: data.boxPapers || 'Full Set',
      tier: data.tier || 'A',
      availability: data.availability || 'in_stock',
      category: data.category || 'Sport',
      description: data.description || '',
      images: data.images || [],
      video: data.video || null,
      specifications: data.specifications || {},
      status: data.status || 'AVAILABLE',
      featured: data.featured || false,
      viewCount: 0,
      inquiryCount: 0,
      marketTrend: data.marketTrend || 'STABLE',
      annualAppreciation: data.annualAppreciation ? parseFloat(data.annualAppreciation) : 0,
      caseDiameter: data.caseDiameter ? parseFloat(data.caseDiameter) : null,
      caseMaterial: data.caseMaterial || null,
      dialColor: data.dialColor || null,
      movement: data.movement || null,
      caliber: data.caliber || null,
      braceletType: data.braceletType || null,
      complications: data.complications || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    watches.push(watch);

    try { saveWatches(watches); } catch { /* read-only on Vercel */ }

    return res.status(201).json({ success: true, watch });
  } catch (error) {
    console.error('Error creating watch:', error);
    return res.status(500).json({ error: 'Failed to create watch' });
  }
}
