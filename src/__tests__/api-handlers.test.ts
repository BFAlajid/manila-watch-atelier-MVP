// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HandlerContext } from '../../api/_lib/handlers/types';

const saveInquiries = vi.fn((..._args: unknown[]) => undefined);
const sendInquiryNotification = vi.fn((..._args: unknown[]) => Promise.resolve());

vi.mock('../../api/_lib/data.js', () => ({
  getWatches: vi.fn(async () => [
    { id: '1', status: 'AVAILABLE', brand: 'Rolex', model: 'A', name: 'A', reference: '1', price_php: 1, created_at: '2024-01-01' },
    { id: '2', status: 'SOLD', brand: 'Omega', model: 'B', name: 'B', reference: '2', price_php: 2, created_at: '2024-01-02' },
    { id: '3', status: 'RESERVED', brand: 'Seiko', model: 'C', name: 'C', reference: '3', price_php: 3, created_at: '2024-01-03' },
    { id: '4', status: 'ARCHIVED', brand: 'Tudor', model: 'D', name: 'D', reference: '4', price_php: 4, created_at: '2024-01-04' },
  ]),
  saveWatches: vi.fn(),
  getInquiries: vi.fn(async () => []),
  saveInquiries: (...args: unknown[]) => saveInquiries(...args),
}));
vi.mock('../../api/_lib/rate-limit.js', () => ({ isRateLimited: () => false }));
vi.mock('../../api/_lib/audit.js', () => ({ auditAdminAction: vi.fn() }));
vi.mock('../../api/_lib/email.js', () => ({
  sendInquiryNotification: (...args: unknown[]) => sendInquiryNotification(...args),
}));

const { listWatches } = await import('../../api/_lib/handlers/watches');
const { createInquiry } = await import('../../api/_lib/handlers/inquiries');

function ctx(over: Partial<HandlerContext> = {}): HandlerContext {
  return {
    method: 'GET',
    query: {},
    body: undefined,
    headers: {},
    auth: { authenticated: false },
    clientIP: '127.0.0.1',
    ...over,
  };
}

describe('GET /api/watches', () => {
  it('returns 401 for status=ALL without auth', async () => {
    const res = await listWatches(ctx({ query: { status: 'ALL' } }));
    expect(res.status).toBe(401);
  });

  it('returns every watch for status=ALL with auth', async () => {
    const res = await listWatches(
      ctx({ query: { status: 'ALL' }, auth: { authenticated: true, username: 'admin' } })
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
  });

  it.each(['RESERVED', 'ARCHIVED'])('returns 401 for status=%s without auth', async (status) => {
    const res = await listWatches(ctx({ query: { status } }));
    expect(res.status).toBe(401);
  });

  it('public listing defaults to AVAILABLE only', async () => {
    const res = await listWatches(ctx());
    expect(res.status).toBe(200);
    const statuses = (res.body as { status: string }[]).map((w) => w.status);
    expect(statuses).toEqual(['AVAILABLE']);
  });

  it('public listing allows SOLD but never RESERVED or ARCHIVED', async () => {
    const res = await listWatches(ctx({ query: { status: 'SOLD' } }));
    expect(res.status).toBe(200);
    const statuses = (res.body as { status: string }[]).map((w) => w.status);
    expect(statuses).toEqual(['SOLD']);
  });
});

describe('POST /api/inquiries honeypot', () => {
  beforeEach(() => {
    saveInquiries.mockClear();
    sendInquiryNotification.mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const valid = { name: 'Ann', email: 'ann@example.com', message: 'hi' };

  it('discards a submission with the honeypot filled, persisting and emailing nothing', async () => {
    const res = await createInquiry(
      ctx({ method: 'POST', body: { ...valid, website: 'http://spam.example' } })
    );
    // The honeypot is checked before validation; bots get a silent fake success and nothing is stored.
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, id: 'discarded' });
    expect(saveInquiries).not.toHaveBeenCalled();
    expect(sendInquiryNotification).not.toHaveBeenCalled();
  });

  it('accepts a submission with an empty honeypot', async () => {
    const res = await createInquiry(ctx({ method: 'POST', body: { ...valid, website: '' } }));
    expect(res.status).toBe(201);
    expect(saveInquiries).toHaveBeenCalledTimes(1);
  });
});
