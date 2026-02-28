// GET /api/watches — List all watches with filtering
import { prisma } from './_lib/prisma.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      brand,
      minPrice,
      maxPrice,
      condition,
      caseMaterial,
      sort,
      search,
      status,
      category,
      tier,
      featured,
    } = req.query;

    // Build where clause
    const where: any = {
      status: status || 'AVAILABLE',
    };

    if (brand && brand !== 'All') {
      where.brand = brand;
    }

    if (category && category !== 'All') {
      where.category = category;
    }

    if (tier && tier !== 'All') {
      where.tier = tier;
    }

    if (condition) {
      where.condition = condition;
    }

    if (caseMaterial) {
      where.caseMaterial = { contains: caseMaterial, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.pricePHP = {};
      if (minPrice) where.pricePHP.gte = parseInt(minPrice);
      if (maxPrice) where.pricePHP.lte = parseInt(maxPrice);
    }

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { nickname: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { pricePHP: 'asc' };
    else if (sort === 'price_desc') orderBy = { pricePHP: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'popular') orderBy = { viewCount: 'desc' };

    const watches = await prisma.watch.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { inquiries: true },
        },
      },
    });

    // Map to frontend-compatible format
    const result = watches.map((w) => ({
      id: w.id,
      slug: w.slug,
      brand: w.brand,
      model: w.model,
      reference: w.reference,
      name: `${w.model}${w.nickname ? ` "${w.nickname}"` : ''}`,
      nickname: w.nickname,
      year: w.year,
      caseDiameter: w.caseDiameter,
      caseMaterial: w.caseMaterial,
      dialColor: w.dialColor,
      movement: w.movement,
      caliber: w.caliber,
      braceletType: w.braceletType,
      complications: w.complications,
      condition: w.condition,
      boxPapers: w.boxPapers,
      box: w.boxPapers === 'Full Set' || w.boxPapers === 'Box Only',
      papers: w.boxPapers === 'Full Set' || w.boxPapers === 'Papers Only',
      tier: w.tier,
      price_php: w.pricePHP,
      pricePHP: w.pricePHP,
      retailPricePHP: w.retailPricePHP,
      marketTrend: w.marketTrend,
      annualAppreciation: w.annualAppreciation,
      images: w.images,
      video: w.video ? JSON.parse(w.video) : null,
      category: w.category,
      availability: w.availability,
      description: w.description,
      specifications: w.specifications,
      featured: w.featured,
      status: w.status,
      viewCount: w.viewCount,
      inquiryCount: w._count.inquiries,
      created_at: w.createdAt.toISOString(),
      updated_at: w.updatedAt.toISOString(),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching watches:', error);
    return res.status(500).json({ error: 'Failed to fetch watches' });
  }
}
