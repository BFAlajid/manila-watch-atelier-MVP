import crypto from 'crypto';
import type { Handler } from './types.js';
import { getWatches, saveWatches } from '../data.js';
import { watchCreateSchema, watchUpdateSchema } from '../validation.js';
import { isRateLimited } from '../rate-limit.js';
import { auditAdminAction } from '../audit.js';

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// ─── Public: GET /api/watches ─────────────────────────────────────────────
export const listWatches: Handler = async (ctx) => {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } };

  let watches = await getWatches();

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

  return {
    status: 200,
    body: watches,
    // Edge-cache the public catalog for 60s and serve stale for up to 5min
    // while the cache revalidates. Drops origin load ~60x during traffic bursts.
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300',
    },
  };
};

// ─── Public: GET /api/watches/:slug ───────────────────────────────────────
export const getWatchBySlug: Handler = async (ctx) => {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } };

  const slug = pickString(ctx.query.slug);
  if (!slug) return { status: 400, body: { error: 'Slug is required' } };

  const watches = await getWatches();
  const watch = watches.find((w) => w.slug === slug);
  if (!watch) return { status: 404, body: { error: 'Watch not found' } };

  // Transient increment (not persisted back — avoids a round-trip write on every
  // view. If we want real view counts later, do a batched async increment.)
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
  const watches = await getWatches();
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

  let saveOk = true;
  try {
    await saveWatches(watches);
  } catch (err: any) {
    saveOk = false;
    console.error('[watches/create] saveWatches failed:', err?.message || err);
  }

  auditAdminAction({
    actor: ctx.auth.username || 'admin',
    action: 'watch.create',
    resource: `watch:${watch.slug}`,
    ip: ctx.clientIP,
    ok: saveOk,
    details: { id: watch.id, brand: watch.brand, model: watch.model, pricePHP: watch.pricePHP },
  });

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

  const watches = await getWatches();
  const index = watches.findIndex((w) => w.slug === slug);
  if (index === -1) return { status: 404, body: { error: 'Watch not found' } };

  watches[index] = {
    ...watches[index],
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  let saveOk = true;
  try {
    await saveWatches(watches);
  } catch (err: any) {
    saveOk = false;
    console.error('[watches PUT] saveWatches failed:', err?.message || err);
  }

  auditAdminAction({
    actor: ctx.auth.username || 'admin',
    action: 'watch.update',
    resource: `watch:${slug}`,
    ip: ctx.clientIP,
    ok: saveOk,
    details: { changedFields: Object.keys(parsed.data) },
  });

  return { status: 200, body: { success: true, watch: watches[index] } };
};

// ─── Admin: POST /api/watches/bulk-import — CSV round-trip ────────────────
// Upserts a batch of watches by slug. Each row validated via watchCreateSchema.
// Existing watches (same slug) are updated; new slugs create fresh records.
// Returns per-row error details so the admin UI can surface what failed.
export const bulkImportWatches: Handler = async (ctx) => {
  if (ctx.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const body = (ctx.body || {}) as { watches?: any[] };
  if (!body.watches || !Array.isArray(body.watches)) {
    return { status: 400, body: { error: 'Missing `watches` array in body' } };
  }
  if (body.watches.length === 0) {
    return { status: 400, body: { error: 'No rows to import' } };
  }
  if (body.watches.length > 500) {
    return { status: 400, body: { error: 'Too many rows at once — max 500 per import' } };
  }

  const watches = await getWatches();
  const errors: Array<{ row: number; slug?: string; error: string }> = [];
  let created = 0;
  let updated = 0;

  for (let i = 0; i < body.watches.length; i++) {
    const raw = body.watches[i];
    const parsed = watchCreateSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const msg = Object.entries(fieldErrors)
        .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join('; ') : 'invalid'}`)
        .join('; ');
      errors.push({ row: i + 1, slug: raw?.slug, error: msg || 'validation failed' });
      continue;
    }
    const data = parsed.data;
    const existingIdx = watches.findIndex((w) => w.slug === data.slug);
    if (existingIdx !== -1) {
      watches[existingIdx] = {
        ...watches[existingIdx],
        ...data,
        pricePHP: data.pricePHP,
        price_php: data.pricePHP,
        updated_at: new Date().toISOString(),
      };
      updated++;
    } else {
      const watch: any = {
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
      created++;
    }
  }

  let saveOk = true;
  try {
    await saveWatches(watches);
  } catch (err: any) {
    saveOk = false;
    console.error('[watches/bulk-import] saveWatches failed:', err?.message || err);
  }

  auditAdminAction({
    actor: ctx.auth.username || 'admin',
    action: 'watch.bulkImport',
    resource: 'watches',
    ip: ctx.clientIP,
    ok: saveOk,
    details: {
      total: body.watches.length,
      created,
      updated,
      errorCount: errors.length,
    },
  });

  return {
    status: 200,
    body: {
      success: saveOk,
      total: body.watches.length,
      created,
      updated,
      errors,
    },
  };
};

// ─── Admin: DELETE /api/watches/:slug — soft-delete (mark SOLD) ────────────
export const deleteWatch: Handler = async (ctx) => {
  if (ctx.method !== 'DELETE') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const slug = pickString(ctx.query.slug);
  if (!slug) return { status: 400, body: { error: 'Slug is required' } };

  const watches = await getWatches();
  const index = watches.findIndex((w) => w.slug === slug);
  if (index === -1) return { status: 404, body: { error: 'Watch not found' } };

  watches[index].status = 'SOLD';

  let saveOk = true;
  try {
    await saveWatches(watches);
  } catch (err: any) {
    saveOk = false;
    console.error('[watches DELETE] saveWatches failed:', err?.message || err);
  }

  auditAdminAction({
    actor: ctx.auth.username || 'admin',
    action: 'watch.softDelete',
    resource: `watch:${slug}`,
    ip: ctx.clientIP,
    ok: saveOk,
  });

  return { status: 200, body: { success: true, status: 'SOLD' } };
};
