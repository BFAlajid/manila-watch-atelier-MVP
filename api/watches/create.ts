// POST /api/watches/create — Admin: create new watch
import { prisma } from '../_lib/prisma';
import { verifyAuth } from '../_lib/auth';

export default async function handler(req: any, res: any) {
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
      return res.status(400).json({ error: 'Missing required fields: slug, brand, model, pricePHP' });
    }

    const existing = await prisma.watch.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return res.status(409).json({ error: 'A watch with this slug already exists' });
    }

    const watch = await prisma.watch.create({
      data: {
        slug: data.slug,
        brand: data.brand,
        model: data.model,
        reference: data.reference || '',
        nickname: data.nickname || null,
        year: data.year ? parseInt(data.year) : null,
        caseDiameter: data.caseDiameter ? parseFloat(data.caseDiameter) : null,
        caseMaterial: data.caseMaterial || null,
        dialColor: data.dialColor || null,
        movement: data.movement || null,
        caliber: data.caliber || null,
        braceletType: data.braceletType || null,
        complications: data.complications || [],
        condition: data.condition || 'excellent',
        boxPapers: data.boxPapers || 'Full Set',
        tier: data.tier || 'A',
        pricePHP: parseInt(data.pricePHP),
        retailPricePHP: data.retailPricePHP ? parseInt(data.retailPricePHP) : null,
        marketTrend: data.marketTrend || null,
        annualAppreciation: data.annualAppreciation ? parseFloat(data.annualAppreciation) : null,
        images: data.images || [],
        video: data.video || null,
        category: data.category || 'Sport',
        availability: data.availability || 'in_stock',
        description: data.description || '',
        specifications: data.specifications || {},
        featured: data.featured || false,
        status: data.status || 'AVAILABLE',
      },
    });

    return res.status(201).json({ success: true, watch });
  } catch (error) {
    console.error('Error creating watch:', error);
    return res.status(500).json({ error: 'Failed to create watch' });
  }
}
