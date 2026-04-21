// Data layer — reads/writes the runtime store.
//
// Runtime source of truth is Vercel KV (Upstash Redis) when KV_REST_API_URL +
// KV_REST_API_TOKEN are present (Vercel auto-injects these when the project is
// linked to a KV store). Otherwise we fall back to src/data/inventory.json
// (and src/data/inquiries.json) — used for local dev without `vercel env pull`
// and as seed data for KV via scripts/seed-kv.ts.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Redis } from '@upstash/redis';

const INVENTORY_PATH = join(process.cwd(), 'src', 'data', 'inventory.json');
const INQUIRIES_PATH = join(process.cwd(), 'src', 'data', 'inquiries.json');

const WATCHES_KEY = 'watches:all';
const INQUIRIES_KEY = 'inquiries:all';

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const redis = hasKv ? Redis.fromEnv() : null;

let warnedNoKv = false;
function warnFallback(op: string): void {
  if (!warnedNoKv && process.env.NODE_ENV !== 'test') {
    warnedNoKv = true;
    console.warn(
      `[data] KV not configured (KV_REST_API_URL / KV_REST_API_TOKEN unset). Falling back to JSON files for ${op}. Run \`npm run seed:kv\` to move data into Vercel KV.`
    );
  }
}

export interface WatchData {
  id: string;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  name: string;
  nickname?: string;
  year?: number;
  price_php: number;
  pricePHP: number;
  retailPricePHP?: number | null;
  condition: string;
  box: boolean;
  papers: boolean;
  boxPapers: string;
  tier: string;
  availability: string;
  category: string;
  description: string;
  images: string[];
  video?: any;
  specifications: any;
  status: string;
  featured: boolean;
  viewCount: number;
  inquiryCount: number;
  marketTrend: string;
  annualAppreciation: number;
  caseDiameter?: number | null;
  caseMaterial?: string | null;
  dialColor?: string | null;
  movement?: string | null;
  caliber?: string | null;
  braceletType?: string | null;
  complications?: string[];
  created_at: string;
  updated_at: string;
}

function normalizeWatch(w: any): WatchData {
  return {
    ...w,
    pricePHP: w.pricePHP ?? w.price_php ?? 0,
    price_php: w.price_php ?? w.pricePHP ?? 0,
    boxPapers:
      w.boxPapers ||
      (w.box && w.papers
        ? 'Box & Papers'
        : w.box
          ? 'Box'
          : w.papers
            ? 'Papers'
            : 'None'),
    status: w.status || 'AVAILABLE',
    viewCount: w.viewCount || 0,
    inquiryCount: w.inquiryCount || 0,
    featured: w.featured || false,
    marketTrend: w.marketTrend || 'STABLE',
    annualAppreciation: w.annualAppreciation || 0,
    retailPricePHP: w.retailPricePHP || null,
  };
}

// ─── Watches ────────────────────────────────────────────────────────────
export async function getWatches(): Promise<WatchData[]> {
  if (redis) {
    const raw = await redis.get<any[]>(WATCHES_KEY);
    return (raw ?? []).map(normalizeWatch);
  }
  warnFallback('getWatches');
  const data = readFileSync(INVENTORY_PATH, 'utf-8');
  return (JSON.parse(data) as any[]).map(normalizeWatch);
}

export async function saveWatches(watches: any[]): Promise<void> {
  if (redis) {
    await redis.set(WATCHES_KEY, watches);
    return;
  }
  warnFallback('saveWatches');
  writeFileSync(INVENTORY_PATH, JSON.stringify(watches, null, 2), 'utf-8');
}

// ─── Inquiries ──────────────────────────────────────────────────────────
export async function getInquiries(): Promise<any[]> {
  if (redis) {
    const raw = await redis.get<any[]>(INQUIRIES_KEY);
    return raw ?? [];
  }
  warnFallback('getInquiries');
  try {
    if (!existsSync(INQUIRIES_PATH)) return [];
    const data = readFileSync(INQUIRIES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveInquiries(inquiries: any[]): Promise<void> {
  if (redis) {
    await redis.set(INQUIRIES_KEY, inquiries);
    return;
  }
  warnFallback('saveInquiries');
  writeFileSync(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2), 'utf-8');
}
