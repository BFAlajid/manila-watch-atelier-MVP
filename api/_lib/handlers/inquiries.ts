import crypto from 'crypto';
import type { Handler } from './types.js';
import { getWatches, getInquiries, saveInquiries } from '../data.js';
import { inquirySchema, inquiryStatusSchema } from '../validation.js';
import { isRateLimited } from '../rate-limit.js';
import { sendInquiryNotification } from '../email.js';
import { auditAdminAction } from '../audit.js';

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

// ─── Public: POST /api/inquiries ──────────────────────────────────────────
export const createInquiry: Handler = async (ctx) => {
  if (ctx.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };

  const parsed = inquirySchema.safeParse(ctx.body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    };
  }

  const { name, email, phone, message, watchId, website } = parsed.data;

  // Honeypot tripped — return a fake success so the bot thinks it worked,
  // but don't persist, email, or rate-limit against the real user pool.
  if (website && website.length > 0) {
    console.warn('[inquiries] honeypot triggered by', ctx.clientIP, '— silently discarded');
    return { status: 201, body: { success: true, id: 'discarded' } };
  }

  if (isRateLimited(`inquiry:${email}`, 3, 60 * 60 * 1000)) {
    return { status: 429, body: { error: 'Too many inquiries. Please try again later.' } };
  }
  // Second layer: per-IP ceiling so a single bot can't spray many distinct
  // emails to bypass the per-email limit.
  if (isRateLimited(`inquiry-ip:${ctx.clientIP}`, 10, 60 * 60 * 1000)) {
    return { status: 429, body: { error: 'Too many inquiries. Please try again later.' } };
  }

  let watch: any = null;
  if (watchId) {
    const watches = await getWatches();
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

  const inquiries = await getInquiries();
  inquiries.push(inquiry);
  try {
    await saveInquiries(inquiries);
  } catch (err: any) {
    console.error('[inquiries] saveInquiries failed:', err?.message || err);
  }

  // Durable path — email fires in background regardless of FS write result.
  sendInquiryNotification(inquiry).catch((err: any) =>
    console.error('[inquiries] email notification failed:', err?.message || err)
  );

  return { status: 201, body: { success: true, id: inquiry.id } };
};

// ─── Admin: GET /api/inquiries ────────────────────────────────────────────
export const listInquiries: Handler = async (ctx) => {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const inquiries = await getInquiries();
  const status = pickString(ctx.query.status);
  const limit = pickString(ctx.query.limit);

  let filtered: any[] = inquiries;
  if (status && status !== 'ALL') {
    filtered = filtered.filter((i: any) => i.status === status);
  }
  filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (limit) {
    filtered = filtered.slice(0, parseInt(limit, 10));
  }

  return { status: 200, body: filtered };
};

// ─── Admin: PUT /api/inquiries/:id ────────────────────────────────────────
export const updateInquiryStatus: Handler = async (ctx) => {
  if (ctx.method !== 'PUT') return { status: 405, body: { error: 'Method not allowed' } };
  if (!ctx.auth.authenticated) return { status: 401, body: { error: 'Unauthorized' } };

  const id = pickString(ctx.query.id);
  if (!id) return { status: 400, body: { error: 'Inquiry ID is required' } };

  const parsed = inquiryStatusSchema.safeParse(ctx.body);
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
    };
  }

  const inquiries = await getInquiries();
  const index = inquiries.findIndex((i: any) => i.id === id);
  if (index === -1) return { status: 404, body: { error: 'Inquiry not found' } };

  inquiries[index] = { ...inquiries[index], ...parsed.data };
  let saveOk = true;
  try {
    await saveInquiries(inquiries);
  } catch (err: any) {
    saveOk = false;
    console.error('[inquiries/:id] saveInquiries failed:', err?.message || err);
  }

  auditAdminAction({
    actor: ctx.auth.username || 'admin',
    action: 'inquiry.updateStatus',
    resource: `inquiry:${id}`,
    ip: ctx.clientIP,
    ok: saveOk,
    details: { newStatus: parsed.data.status },
  });

  return { status: 200, body: { success: true, inquiry: inquiries[index] } };
};
