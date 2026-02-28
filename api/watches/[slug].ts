// GET/PUT/DELETE /api/watches/:slug
import { prisma } from '../_lib/prisma.js';
import { verifyAuth } from '../_lib/auth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  // ── GET: public — fetch single watch, increment viewCount ──
  if (req.method === 'GET') {
    try {
      const watch = await prisma.watch.update({
        where: { slug: slug as string },
        data: { viewCount: { increment: 1 } },
        include: {
          _count: { select: { inquiries: true } },
        },
      });

      if (!watch) {
        return res.status(404).json({ error: 'Watch not found' });
      }

      const result = {
        id: watch.id,
        slug: watch.slug,
        brand: watch.brand,
        model: watch.model,
        reference: watch.reference,
        name: `${watch.model}${watch.nickname ? ` "${watch.nickname}"` : ''}`,
        nickname: watch.nickname,
        year: watch.year,
        caseDiameter: watch.caseDiameter,
        caseMaterial: watch.caseMaterial,
        dialColor: watch.dialColor,
        movement: watch.movement,
        caliber: watch.caliber,
        braceletType: watch.braceletType,
        complications: watch.complications,
        condition: watch.condition,
        boxPapers: watch.boxPapers,
        box: watch.boxPapers === 'Full Set' || watch.boxPapers === 'Box Only',
        papers: watch.boxPapers === 'Full Set' || watch.boxPapers === 'Papers Only',
        tier: watch.tier,
        price_php: watch.pricePHP,
        pricePHP: watch.pricePHP,
        retailPricePHP: watch.retailPricePHP,
        marketTrend: watch.marketTrend,
        annualAppreciation: watch.annualAppreciation,
        images: watch.images,
        video: watch.video ? JSON.parse(watch.video) : null,
        category: watch.category,
        availability: watch.availability,
        description: watch.description,
        specifications: watch.specifications,
        featured: watch.featured,
        status: watch.status,
        viewCount: watch.viewCount,
        inquiryCount: watch._count.inquiries,
        created_at: watch.createdAt.toISOString(),
        updated_at: watch.updatedAt.toISOString(),
      };

      return res.status(200).json(result);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return res.status(404).json({ error: 'Watch not found' });
      }
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
      const updates = req.body;
      const watch = await prisma.watch.update({
        where: { slug: slug as string },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ success: true, watch });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return res.status(404).json({ error: 'Watch not found' });
      }
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
      const watch = await prisma.watch.update({
        where: { slug: slug as string },
        data: { status: 'SOLD' },
      });

      return res.status(200).json({ success: true, status: 'SOLD' });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        return res.status(404).json({ error: 'Watch not found' });
      }
      console.error('Error deleting watch:', error);
      return res.status(500).json({ error: 'Failed to delete watch' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
