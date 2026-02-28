// Shared JSON-file data helpers for Vercel serverless functions
// Reads from src/data/*.json — same data source as dev-server.js
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const INVENTORY_PATH = join(process.cwd(), 'src', 'data', 'inventory.json');
const INQUIRIES_PATH = join(process.cwd(), 'src', 'data', 'inquiries.json');

interface WatchData {
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

export function getWatches(): WatchData[] {
  const data = readFileSync(INVENTORY_PATH, 'utf-8');
  const inventory = JSON.parse(data);
  return inventory.map((w: any) => ({
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
  }));
}

export function saveWatches(watches: any[]): void {
  writeFileSync(INVENTORY_PATH, JSON.stringify(watches, null, 2), 'utf-8');
}

export function getInquiries(): any[] {
  try {
    if (!existsSync(INQUIRIES_PATH)) return [];
    const data = readFileSync(INQUIRIES_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveInquiries(inquiries: any[]): void {
  writeFileSync(INQUIRIES_PATH, JSON.stringify(inquiries, null, 2), 'utf-8');
}
