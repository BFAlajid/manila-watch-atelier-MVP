// Admin audit log — records every state-changing admin action to a Redis list
// (mwa:audit-log) with a 90-day TTL. If a token is ever stolen, we have a
// forensic trail of what was done with it. Fire-and-forget on write so it
// never blocks the response.
//
// Entries look like:
//   { ts, actor, action, resource, ip, ok, details? }
//
// Read from the admin dashboard later via a simple /api/audit endpoint (not
// built yet — follow-up).

import { Redis } from '@upstash/redis';

const AUDIT_KEY = `${process.env.REDIS_KEY_PREFIX || 'mwa'}:audit-log`;
const AUDIT_TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days
const AUDIT_MAX_ENTRIES = 5000; // trim after this many to keep memory bounded

const hasKv = Boolean(
  (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
);
const redis = hasKv ? Redis.fromEnv() : null;

export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  resource: string;
  ip: string;
  ok: boolean;
  details?: Record<string, unknown>;
}

export async function auditAdminAction(entry: Omit<AuditEntry, 'ts'>): Promise<void> {
  const record: AuditEntry = { ts: new Date().toISOString(), ...entry };
  if (!redis) {
    // In local dev without KV, just log to the console so developers can see it.
    console.log('[audit]', record);
    return;
  }
  try {
    // LPUSH + LTRIM keeps the list bounded at AUDIT_MAX_ENTRIES.
    await redis.lpush(AUDIT_KEY, JSON.stringify(record));
    await redis.ltrim(AUDIT_KEY, 0, AUDIT_MAX_ENTRIES - 1);
    // Sliding expire — 90 days from the most recent write.
    await redis.expire(AUDIT_KEY, AUDIT_TTL_SECONDS);
  } catch (err: any) {
    // Never let audit-log failure break an admin action. Log + move on.
    console.error('[audit] failed to record entry:', err?.message || err, record);
  }
}
