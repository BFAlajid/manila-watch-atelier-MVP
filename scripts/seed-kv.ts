// scripts/seed-kv.ts — One-time seed of Vercel KV from src/data/inventory.json.
//
// Usage (local, with `vercel env pull .env.local` already run):
//   npm run seed:kv
// Force overwrite:
//   FORCE=1 npm run seed:kv
//
// Required env vars (auto-injected when Vercel KV is linked to the project,
// or pulled via `vercel env pull .env.local`):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Redis } from '@upstash/redis';

const KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'mwa';
const WATCHES_KEY = `${KEY_PREFIX}:watches:all`;
const INQUIRIES_KEY = `${KEY_PREFIX}:inquiries:all`;

const INVENTORY_PATH = join(process.cwd(), 'src', 'data', 'inventory.json');

function bail(msg: string): never {
  console.error(`[seed:kv] ${msg}`);
  process.exit(1);
}

const hasKvVars = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const hasUpstashVars = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
if (!hasKvVars && !hasUpstashVars) {
  bail(
    'Redis env vars missing. Expected either:\n' +
      '  KV_REST_API_URL + KV_REST_API_TOKEN  (legacy Vercel KV naming), or\n' +
      '  UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (current Vercel marketplace Redis / Upstash naming)\n\n' +
      '  For prod:   Link the Redis store in the Vercel dashboard, then run `vercel env pull .env.local` locally.\n' +
      '  For local:  Paste the REST credentials from the Upstash dashboard into .env.local.'
  );
}

if (!existsSync(INVENTORY_PATH)) {
  bail(`Inventory seed file not found at ${INVENTORY_PATH}`);
}

const redis = Redis.fromEnv();

async function main() {
  const raw = readFileSync(INVENTORY_PATH, 'utf-8');
  const inventory = JSON.parse(raw);
  if (!Array.isArray(inventory)) bail('inventory.json must be a JSON array.');

  const existingWatches = await redis.get(WATCHES_KEY);
  const force = process.env.FORCE === '1' || process.env.FORCE === 'true';

  if (existingWatches && !force) {
    console.error(
      `[seed:kv] '${WATCHES_KEY}' already exists in KV (${(existingWatches as any[]).length} items).\n` +
        '          Re-run with FORCE=1 to overwrite. Admin-edited data will be lost.'
    );
    process.exit(1);
  }

  await redis.set(WATCHES_KEY, inventory);
  console.log(`[seed:kv] Seeded ${inventory.length} watches → ${WATCHES_KEY}`);

  const existingInquiries = await redis.get(INQUIRIES_KEY);
  if (!existingInquiries) {
    await redis.set(INQUIRIES_KEY, []);
    console.log(`[seed:kv] Initialized empty '${INQUIRIES_KEY}'`);
  } else {
    console.log(
      `[seed:kv] '${INQUIRIES_KEY}' already has ${(existingInquiries as any[]).length} entries — left untouched.`
    );
  }

  console.log('[seed:kv] Done.');
}

main().catch((err) => {
  console.error('[seed:kv] Failed:', err?.message || err);
  process.exit(1);
});
