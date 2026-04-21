// Zod schemas for API request validation
import { z } from 'zod';

export const inquirySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional().nullable(),
  message: z.string().max(2000).optional().default(''),
  watchId: z.string().max(100).optional().nullable(),
  // Honeypot: must be empty. Humans never fill it (it's hidden via CSS +
  // aria-hidden + tabindex=-1); bots that scrape forms and fill every
  // field will get caught. Server silently accepts the 200 response but
  // drops the payload without writing anywhere.
  website: z.string().max(0).optional().default(''),
});

export const watchCreateSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(200),
  pricePHP: z.coerce.number().positive().max(100_000_000),
  reference: z.string().max(100).optional().default(''),
  name: z.string().max(300).optional(),
  nickname: z.string().max(100).optional().nullable(),
  year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  retailPricePHP: z.coerce.number().positive().optional().nullable(),
  condition: z.string().max(50).optional().default('excellent'),
  box: z.boolean().optional().default(true),
  papers: z.boolean().optional().default(true),
  boxPapers: z.string().max(50).optional().default('Full Set'),
  tier: z.enum(['A', 'B', 'C']).optional().default('A'),
  availability: z.string().max(50).optional().default('in_stock'),
  category: z.string().max(50).optional().default('Sport'),
  description: z.string().max(5000).optional().default(''),
  images: z.array(z.string().max(500)).max(20).optional().default([]),
  video: z.object({
    type: z.enum(['youtube', 'facebook', 'upload', 'url']),
    url: z.string().url().max(500),
    thumbnail: z.string().max(500).optional(),
  }).optional().nullable(),
  specifications: z.record(z.string().max(100), z.union([z.string().max(500), z.number(), z.boolean()])).optional().default({}),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).optional().default('AVAILABLE'),
  featured: z.boolean().optional().default(false),
  marketTrend: z.enum(['RISING', 'STABLE', 'DECLINING']).optional().default('STABLE'),
  annualAppreciation: z.coerce.number().optional().default(0),
  caseDiameter: z.coerce.number().positive().optional().nullable(),
  caseMaterial: z.string().max(100).optional().nullable(),
  dialColor: z.string().max(100).optional().nullable(),
  movement: z.string().max(100).optional().nullable(),
  caliber: z.string().max(100).optional().nullable(),
  braceletType: z.string().max(100).optional().nullable(),
  complications: z.array(z.string().max(100)).max(20).optional().default([]),
});

export const watchUpdateSchema = watchCreateSchema.partial();

export const inquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED']).optional(),
  lastContactedAt: z.string().datetime().optional(),
  notes: z.string().max(5000).optional(),
}).refine((v) => v.status !== undefined || v.lastContactedAt !== undefined || v.notes !== undefined, {
  message: 'At least one field (status, lastContactedAt, or notes) is required',
});
