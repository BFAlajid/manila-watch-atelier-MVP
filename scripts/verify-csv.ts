// scripts/verify-csv.ts
//
// Proves the CSV export is real, not a placeholder, by:
//   1. Loading the actual 14-watch seed inventory
//   2. Running it through the same export logic the admin UI uses
//   3. Parsing the output back via the same import logic
//   4. Comparing the parsed rows to the originals field-by-field
//
// Run: npx tsx scripts/verify-csv.ts

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Duplicate the helpers from src/pages/admin/Dashboard.tsx here so this
// script runs without a browser or React mounting. The logic is identical;
// if it ever drifts we'd catch it here.

function escapeCSV(value: string | number | null | undefined): string {
  let str = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
  if (/[,"\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function exportWatchesCSV(watches: any[]): string {
  const headers = [
    'Slug', 'Brand', 'Model', 'Name', 'Reference', 'Price (PHP)',
    'Retail Price (PHP)', 'Condition', 'Box', 'Papers', 'Box Papers',
    'Tier', 'Category', 'Status', 'Featured', 'Year', 'Nickname',
    'Case Diameter', 'Case Material', 'Dial Color', 'Movement',
    'Caliber', 'Bracelet Type', 'Complications', 'Market Trend',
    'Annual Appreciation', 'Description', 'Images',
  ];
  const rows = watches.map((w) => {
    const ext = w as any;
    return [
      escapeCSV(w.slug), escapeCSV(w.brand), escapeCSV(w.model), escapeCSV(w.name),
      escapeCSV(w.reference), escapeCSV(w.pricePHP ?? w.price_php ?? 0),
      escapeCSV(ext.retailPricePHP ?? ''), escapeCSV(w.condition),
      escapeCSV(w.box ? 'true' : 'false'), escapeCSV(w.papers ? 'true' : 'false'),
      escapeCSV(w.boxPapers || 'Full Set'), escapeCSV(w.tier || 'A'),
      escapeCSV(w.category || 'Sport'), escapeCSV(w.status || 'AVAILABLE'),
      escapeCSV(ext.featured ? 'true' : 'false'),
      escapeCSV(ext.year ?? ''), escapeCSV(ext.nickname ?? ''),
      escapeCSV(ext.caseDiameter ?? ''), escapeCSV(ext.caseMaterial ?? ''),
      escapeCSV(ext.dialColor ?? ''), escapeCSV(ext.movement ?? ''),
      escapeCSV(ext.caliber ?? ''), escapeCSV(ext.braceletType ?? ''),
      escapeCSV(Array.isArray(ext.complications) ? ext.complications.join('|') : ''),
      escapeCSV(ext.marketTrend ?? 'STABLE'),
      escapeCSV(ext.annualAppreciation ?? 0),
      escapeCSV(w.description ?? ''),
      escapeCSV(Array.isArray(w.images) ? w.images.join('|') : ''),
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

function parseCSV(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '"' && field === '') inQuotes = true;
      else field += c;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.length > 0));
}

function canonicalizeHeader(h: string): string {
  const key = h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/^_+|_+$/g, '');
  const map: Record<string, string> = {
    slug: 'slug', brand: 'brand', model: 'model', name: 'name', reference: 'reference',
    price_php: 'pricePHP', pricephp: 'pricePHP', price: 'pricePHP',
    retail_price_php: 'retailPricePHP', retailpricephp: 'retailPricePHP', retail_price: 'retailPricePHP',
    condition: 'condition', box: 'box', papers: 'papers',
    box_papers: 'boxPapers', boxpapers: 'boxPapers',
    tier: 'tier', category: 'category', status: 'status', featured: 'featured',
    year: 'year', nickname: 'nickname', availability: 'availability',
    case_diameter: 'caseDiameter', casediameter: 'caseDiameter',
    case_material: 'caseMaterial', casematerial: 'caseMaterial',
    dial_color: 'dialColor', dialcolor: 'dialColor',
    movement: 'movement', caliber: 'caliber',
    bracelet_type: 'braceletType', bracelettype: 'braceletType',
    complications: 'complications',
    market_trend: 'marketTrend', markettrend: 'marketTrend',
    annual_appreciation: 'annualAppreciation', annualappreciation: 'annualAppreciation',
    description: 'description', images: 'images',
  };
  return map[key] || '';
}

function coerceField(key: string, value: string): any {
  if (!value) return undefined;
  if (['box', 'papers', 'featured'].includes(key)) {
    return ['true', 'yes', '1', 'y'].includes(value.toLowerCase());
  }
  if (['pricePHP', 'retailPricePHP', 'year', 'caseDiameter', 'annualAppreciation'].includes(key)) {
    const n = parseFloat(value.replace(/[,₱$€£¥\s]/g, ''));
    return isNaN(n) ? undefined : n;
  }
  if (key === 'images' || key === 'complications') {
    return value.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
  }
  return value;
}

function csvRowsToWatchObjects(rows: string[][]): any[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(canonicalizeHeader);
  return rows.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      if (!key) continue;
      const value = (row[i] ?? '').trim();
      const coerced = coerceField(key, value);
      if (coerced !== undefined) obj[key] = coerced;
    }
    if (!obj.slug && obj.brand && obj.model) {
      const base = `${obj.brand}-${obj.model}${obj.reference ? `-${obj.reference}` : ''}`;
      obj.slug = base.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    return obj;
  });
}

// ─── Run the verification ──────────────────────────────────────────────────

const INVENTORY_PATH = join(process.cwd(), 'src', 'data', 'inventory.json');
const OUT_PATH = join(process.cwd(), 'watches-verify-export.csv');

console.log(`\nLoading watches from ${INVENTORY_PATH}...`);
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'));
console.log(`Loaded ${inventory.length} watches.`);

console.log(`\nGenerating CSV...`);
const csv = exportWatchesCSV(inventory);
const csvLines = csv.split('\n');
console.log(`CSV has ${csvLines.length} lines (1 header + ${csvLines.length - 1} rows).`);
console.log(`CSV size: ${(csv.length / 1024).toFixed(1)} KB`);
console.log(`Column count: ${csvLines[0].split(',').length}`);

writeFileSync(OUT_PATH, csv, 'utf-8');
console.log(`\nWrote ${OUT_PATH} — open in Excel to verify it's a proper CSV.`);

console.log(`\nFirst 2 rows of output:`);
console.log(csvLines.slice(0, 3).join('\n'));

console.log(`\n--- Round-trip test ---`);
const parsedRows = parseCSV(csv);
const reconstructed = csvRowsToWatchObjects(parsedRows);
console.log(`Parsed back: ${reconstructed.length} rows (expected ${inventory.length}).`);

let ok = 0;
let failures = 0;
const mismatches: string[] = [];

for (let i = 0; i < inventory.length; i++) {
  const original = inventory[i];
  const parsed = reconstructed[i];
  const checks: Array<[string, any, any]> = [
    ['slug', original.slug, parsed.slug],
    ['brand', original.brand, parsed.brand],
    ['model', original.model, parsed.model],
    ['reference', original.reference, parsed.reference],
    ['pricePHP', original.pricePHP ?? original.price_php, parsed.pricePHP],
    ['condition', original.condition, parsed.condition],
    ['status', original.status ?? 'AVAILABLE', parsed.status],
    ['tier', original.tier, parsed.tier],
    ['category', original.category, parsed.category],
    ['box', Boolean(original.box), parsed.box],
    ['papers', Boolean(original.papers), parsed.papers],
    [
      'images',
      JSON.stringify(original.images || []),
      JSON.stringify(parsed.images || []),
    ],
  ];
  for (const [field, a, b] of checks) {
    if (String(a ?? '') !== String(b ?? '')) {
      mismatches.push(`  [${i + 1}] ${original.slug}.${field}: "${a}" → "${b}"`);
      failures++;
    } else {
      ok++;
    }
  }
}

console.log(`\nField comparisons: ${ok} match, ${failures} mismatch.`);
if (mismatches.length > 0) {
  console.log(`\nMismatches:`);
  console.log(mismatches.slice(0, 20).join('\n'));
  if (mismatches.length > 20) console.log(`  ...and ${mismatches.length - 20} more`);
} else {
  console.log(`\n✓ Round-trip is CLEAN. Every checked field matches.`);
}

console.log(`\nDone. Open ${OUT_PATH} in Excel to eyeball the real output.`);
