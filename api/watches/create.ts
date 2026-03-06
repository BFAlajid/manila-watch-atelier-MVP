// POST /api/watches/create — Admin: create new watch
import { getWatches, saveWatches } from '../_lib/data.js';
import { verifyAuth } from '../_lib/auth.js';
import { setCorsHeaders } from '../_lib/cors.js';
import { watchCreateSchema } from '../_lib/validation.js';

export default function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = verifyAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const parsed = watchCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    const watches = getWatches();
    const existing = watches.find((w) => w.slug === data.slug);
    if (existing) {
      return res
        .status(409)
        .json({ error: 'A watch with this slug already exists' });
    }

    const watch = {
      id: `watch-${Date.now()}`,
      slug: data.slug,
      brand: data.brand,
      model: data.model,
      reference: data.reference || '',
      name: data.name || `${data.model}${data.nickname ? ` "${data.nickname}"` : ''}`,
      nickname: data.nickname || null,
      year: data.year || null,
      price_php: data.pricePHP,
      pricePHP: data.pricePHP,
      retailPricePHP: data.retailPricePHP || null,
      condition: data.condition,
      box: data.box,
      papers: data.papers,
      boxPapers: data.boxPapers,
      tier: data.tier,
      availability: data.availability,
      category: data.category,
      description: data.description,
      images: data.images,
      video: data.video || null,
      specifications: data.specifications,
      status: data.status,
      featured: data.featured,
      viewCount: 0,
      inquiryCount: 0,
      marketTrend: data.marketTrend,
      annualAppreciation: data.annualAppreciation,
      caseDiameter: data.caseDiameter || null,
      caseMaterial: data.caseMaterial || null,
      dialColor: data.dialColor || null,
      movement: data.movement || null,
      caliber: data.caliber || null,
      braceletType: data.braceletType || null,
      complications: data.complications,
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
