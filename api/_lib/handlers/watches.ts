import crypto from 'crypto';
import type { Handler } from './types.js';
import { getWatches, saveWatches } from '../data.js';
import { watchCreateSchema, watchUpdateSchema } from '../validation.js';

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// ─── Public: GET /api/watches ─────────────────────────────────────────────
export const listWatches: Handler = async (ctx) => {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } };

  let watches = getWatches();

  const brand = pickString(ctx.query.brand);
  const minPrice = pickString(ctx.query.minPrice);
  const maxPrice = pickString(ctx.query.maxPrice);
  const condition = pickString(ctx.query.condition);
  const sort = pickString(ctx.query.sort);
  const search = pickString(ctx.query.search);
  const status = pickString(ctx.query.status);
  const category = pickString(ctx.query.category);
  const tier = pickString(ctx.query.tier);
  const featured = pickString(ctx.query.featured);

  const targetStatus = status || 'AVAILABLE';
  if (targetStatus !== 'ALL') {
    watches = watches.filter((w) => w.status === targetStatus);
  }
  if (brand && brand !== 'All') {
    watches = watches.filter((w) => w.brand.toLowerCase() === brand.toLowerCase());
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
    watches = watches.filter((w) => w.price_php >= parseInt(minPrice, 10));
  }
  if (maxPrice) {
    watches = watches.filter((w) => w.price_php <= parseInt(maxPrice, 10));
  }
  if (search) {
    const q = search.toLowerCase();
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

  if (sort === 'price_asc') watches.sort((a, b) => a.price_php - b.price_php);
  else if (sort === 'price_desc') watches.sort((a, b) => b.price_php - a.price_php);
  else if (sort === 'popular') watches.sort((a, b) => b.viewCount - a.viewCount);
  else watches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { status: 200, body: watches };
};

// ─── Public: GET /api/watches/:slug ───────────────────────────────────────
export const getWatchBySlug: Handler = async (ctx) => {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } };

  const slug = pickString(ctx.query.slug);
  if (!slug) return { status: 400, body: { error: 'Slug is required' } };

  const watches = getWatches();
  const watch = watches.find((w) => w.slug === slug);
  if (!watch) return { status: 404, body: { error: 'Watch not found' } };

  // Transient increment (the Vercel wrapper can't persist; intentional no-op on prod).
  watch.viewCount = (watch.viewCount || 0) + 1;
  return { status: 200, body: watch };
};

// ─── Admin: POST /api/watches/create ──────────────────────────────────────
export const createWatch: Handler = async (ctx) => {
  if (ctx.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const parsed = watchCreateSchema.safeParse(ctx.body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    };
  }

  const data = parsed.data;
  const watches = getWatches();
  if (watches.find((w) => w.slug === data.slug)) {
    return { status: 409, body: { error: 'A watch with this slug already exists' } };
  }

  const watch = {
    id: `watch-${crypto.randomUUID()}`,
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

  try {
    saveWatches(watches);
  } catch (err: any) {
    console.error('[watches/create] saveWatches failed (expected on Vercel read-only FS):', err?.message || err);
  }

  return { status: 201, body: { success: true, watch } };
};

// ─── Admin: PUT /api/watches/:slug ────────────────────────────────────────
export const updateWatch: Handler = async (ctx) => {
  if (ctx.method !== 'PUT') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const slug = pickString(ctx.query.slug);
  if (!slug) return { status: 400, body: { error: 'Slug is required' } };

  const parsed = watchUpdateSchema.safeParse(ctx.body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    };
  }

  const watches = getWatches();
  const index = watches.findIndex((w) => w.slug === slug);
  if (index === -1) return { status: 404, body: { error: 'Watch not found' } };

  watches[index] = {
    ...watches[index],
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  try {
    saveWatches(watches);
  } catch (err: any) {
    console.error('[watches PUT] saveWatches failed (expected on Vercel read-only FS):', err?.message || err);
  }

  return { status: 200, body: { success: true, watch: watches[index] } };
};

// ─── Admin: DELETE /api/watches/:slug — soft-delete (mark SOLD) ────────────
export const deleteWatch: Handler = async (ctx) => {
  if (ctx.method !== 'DELETE') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const slug = pickString(ctx.query.slug);
  if (!slug) return { status: 400, body: { error: 'Slug is required' } };

  const watches = getWatches();
  const index = watches.findIndex((w) => w.slug === slug);
  if (index === -1) return { status: 404, body: { error: 'Watch not found' } };

  watches[index].status = 'SOLD';

  try {
    saveWatches(watches);
  } catch (err: any) {
    console.error('[watches DELETE] saveWatches failed (expected on Vercel read-only FS):', err?.message || err);
  }

  return { status: 200, body: { success: true, status: 'SOLD' } };
};
