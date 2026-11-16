// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HandlerContext } from '../../api/_lib/handlers/types';

const saveInquiries = vi.fn((..._args: unknown[]) => undefined);
const sendInquiryNotification = vi.fn((..._args: unknown[]) => Promise.resolve());
const auditAdminAction = vi.fn();

vi.mock('../../api/_lib/data.js', () => ({
  getWatches: vi.fn(async () => []),
  saveWatches: vi.fn(),
  getInquiries: vi.fn(async () => []),
  saveInquiries: (...args: unknown[]) => saveInquiries(...args),
}));
vi.mock('../../api/_lib/rate-limit.js', () => ({ isRateLimited: () => false }));
vi.mock('../../api/_lib/audit.js', () => ({
  auditAdminAction: (...args: unknown[]) => auditAdminAction(...args),
}));
vi.mock('../../api/_lib/email.js', () => ({
  sendInquiryNotification: (...args: unknown[]) => sendInquiryNotification(...args),
}));

const { createInquiry } = await import('../../api/_lib/handlers/inquiries');

function ctx(body: unknown): HandlerContext {
  return {
    method: 'POST',
    query: {},
    body,
    headers: {},
    auth: { authenticated: false },
    clientIP: '127.0.0.1',
  };
}

const valid = { name: 'Ann', email: 'ann@example.com', message: 'hi' };
const invalid = { name: '', email: 'not-an-email' };
const spam = 'http://spam.example';

describe('POST /api/inquiries honeypot ordering', () => {
  beforeEach(() => {
    saveInquiries.mockClear();
    sendInquiryNotification.mockClear();
    auditAdminAction.mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('filled honeypot + invalid body returns fake success, nothing persisted or sent', async () => {
    const res = await createInquiry(ctx({ ...invalid, website: spam }));
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, id: 'discarded' });
    expect(saveInquiries).not.toHaveBeenCalled();
    expect(sendInquiryNotification).not.toHaveBeenCalled();
    expect(auditAdminAction).not.toHaveBeenCalled();
  });

  it('filled honeypot + valid body returns fake success, nothing persisted or sent', async () => {
    const res = await createInquiry(ctx({ ...valid, website: spam }));
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, id: 'discarded' });
    expect(saveInquiries).not.toHaveBeenCalled();
    expect(sendInquiryNotification).not.toHaveBeenCalled();
    expect(auditAdminAction).not.toHaveBeenCalled();
  });

  it('empty honeypot + invalid body still returns 400', async () => {
    const res = await createInquiry(ctx({ ...invalid, website: '' }));
    expect(res.status).toBe(400);
    expect(saveInquiries).not.toHaveBeenCalled();
    expect(sendInquiryNotification).not.toHaveBeenCalled();
  });

  it('empty honeypot + valid body takes the real path', async () => {
    const res = await createInquiry(ctx({ ...valid, website: '' }));
    expect(res.status).toBe(201);
    expect((res.body as { id: string }).id).not.toBe('discarded');
    expect(saveInquiries).toHaveBeenCalledTimes(1);
    expect(sendInquiryNotification).toHaveBeenCalledTimes(1);
  });
});
