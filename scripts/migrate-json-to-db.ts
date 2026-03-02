/**
 * Migration script: Read inventory.json and insert watches into PostgreSQL via Prisma
 * Run with: npx tsx scripts/migrate-json-to-db.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface JsonWatch {
  id: string;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  name: string;
  price_php: number;
  year?: number;
  condition: string;
  box: boolean;
  papers: boolean;
  tier: string;
  availability: string;
  eta?: string;
  category: string;
  description: string;
  images: string[];
  video?: {
    type: string;
    url: string;
    thumbnail?: string;
  };
  specifications: {
    movement?: string;
    caseMaterial?: string;
    diameter?: string;
    waterResistance?: string;
  };
  created_at: string;
  updated_at: string;
}

function mapBoxPapers(box: boolean, papers: boolean): string {
  if (box && papers) return 'Full Set';
  if (box) return 'Box Only';
  if (papers) return 'Papers Only';
  return 'Watch Only';
}

function parseDiameter(diameter?: string): number | null {
  if (!diameter) return null;
  const match = diameter.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

async function main() {
  console.log('Reading inventory.json...');

  const inventoryPath = join(process.cwd(), 'src', 'data', 'inventory.json');
  const raw = readFileSync(inventoryPath, 'utf-8');
  const watches: JsonWatch[] = JSON.parse(raw);

  console.log(`Found ${watches.length} watches to migrate.`);

  for (const w of watches) {
    // Ensure unique slugs by appending reference if needed
    const slug = `${w.slug}-${w.reference}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const existing = await prisma.watch.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  Skipping "${w.name}" (slug "${slug}" already exists)`);
      continue;
    }

    await prisma.watch.create({
      data: {
        slug,
        brand: w.brand,
        model: w.model,
        reference: w.reference,
        year: w.year || null,
        caseDiameter: parseDiameter(w.specifications?.diameter),
        caseMaterial: w.specifications?.caseMaterial || null,
        movement: w.specifications?.movement || null,
        complications: [],
        condition: w.condition,
        boxPapers: mapBoxPapers(w.box, w.papers),
        tier: w.tier,
        pricePHP: w.price_php,
        images: w.images,
        video: w.video ? JSON.stringify(w.video) : null,
        category: w.category,
        availability: w.availability,
        description: w.description,
        specifications: w.specifications as any,
        status: w.availability === 'sold' ? 'SOLD' : w.availability === 'reserved' ? 'RESERVED' : 'AVAILABLE',
        createdAt: new Date(w.created_at),
      },
    });

    console.log(`  Migrated: ${w.brand} ${w.model} (${w.reference})`);
  }

  console.log('\nMigration complete!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
