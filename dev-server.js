// Development API server for local testing
// In production, Vercel serverless functions handle this
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
}));
app.use(express.json());

// Configure multer for image uploads
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'images', 'watches');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const original = path.basename(file.originalname || 'upload');
    const ext = path.extname(original).toLowerCase();
    const safeBase = original.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unpredictable = crypto.randomUUID().slice(0, 8);
    cb(null, `${Date.now()}-${unpredictable}-${safeBase}${ALLOWED_IMAGE_EXTS.has(ext) ? '' : ''}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype) || !ALLOWED_IMAGE_EXTS.has(ext)) {
      return cb(new Error('Only JPEG, PNG, WebP, or AVIF images are allowed (SVG explicitly rejected).'), false);
    }
    cb(null, true);
  }
});

const INVENTORY_PATH = path.join(__dirname, 'src', 'data', 'inventory.json');

// Helper: read inventory and normalize fields for the frontend
async function getWatches() {
  const data = await fs.readFile(INVENTORY_PATH, 'utf-8');
  const inventory = JSON.parse(data);
  return inventory.map((w) => ({
    ...w,
    // Ensure both field names exist for compatibility
    pricePHP: w.pricePHP ?? w.price_php ?? 0,
    price_php: w.price_php ?? w.pricePHP ?? 0,
    boxPapers: w.boxPapers || (w.box && w.papers ? 'Box & Papers' : w.box ? 'Box' : w.papers ? 'Papers' : 'None'),
    status: w.status || 'AVAILABLE',
    viewCount: w.viewCount || 0,
    inquiryCount: w.inquiryCount || 0,
    featured: w.featured || false,
    marketTrend: w.marketTrend || 'STABLE',
    annualAppreciation: w.annualAppreciation || 0,
    retailPricePHP: w.retailPricePHP || null,
  }));
}

// ─── GET /api/watches ────────────────────────────────────────────────
app.get('/api/watches', async (req, res) => {
  try {
    let watches = await getWatches();

    // Apply filters
    const { brand, status, search, minPrice, maxPrice, condition, category, tier, sort } = req.query;

    if (brand) watches = watches.filter(w => w.brand.toLowerCase() === brand.toString().toLowerCase());
    if (status && status !== 'ALL') watches = watches.filter(w => w.status === status);
    if (condition) watches = watches.filter(w => w.condition === condition);
    if (category) watches = watches.filter(w => w.category === category);
    if (tier) watches = watches.filter(w => w.tier === tier);
    if (minPrice) watches = watches.filter(w => w.price_php >= parseInt(minPrice.toString()));
    if (maxPrice) watches = watches.filter(w => w.price_php <= parseInt(maxPrice.toString()));
    if (search) {
      const q = search.toString().toLowerCase();
      watches = watches.filter(w =>
        w.brand.toLowerCase().includes(q) ||
        w.model.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.reference.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === 'price_asc') watches.sort((a, b) => a.price_php - b.price_php);
    else if (sort === 'price_desc') watches.sort((a, b) => b.price_php - a.price_php);

    res.json(watches);
  } catch (error) {
    console.error('Error reading watches:', error);
    res.status(500).json({ error: 'Failed to read inventory' });
  }
});

// ─── GET /api/watches/:slug ──────────────────────────────────────────
app.get('/api/watches/:slug', async (req, res) => {
  try {
    const watches = await getWatches();
    const watch = watches.find(w => w.slug === req.params.slug);
    if (!watch) return res.status(404).json({ error: 'Watch not found' });
    watch.viewCount = (watch.viewCount || 0) + 1;
    res.json(watch);
  } catch (error) {
    console.error('Error reading watch:', error);
    res.status(500).json({ error: 'Failed to read watch' });
  }
});

// ─── PUT /api/watches/:slug ──────────────────────────────────────────
app.put('/api/watches/:slug', requireAuth, async (req, res) => {
  try {
    const data = await fs.readFile(INVENTORY_PATH, 'utf-8');
    const inventory = JSON.parse(data);
    const index = inventory.findIndex(w => w.slug === req.params.slug);
    if (index === -1) return res.status(404).json({ error: 'Watch not found' });
    // Prevent overwriting server-controlled fields via raw body spread
    const { id, created_at, slug, viewCount, inquiryCount, ...safeFields } = req.body;
    inventory[index] = { ...inventory[index], ...safeFields, updated_at: new Date().toISOString() };
    await fs.writeFile(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8');
    res.json(inventory[index]);
  } catch (error) {
    console.error('Error updating watch:', error);
    res.status(500).json({ error: 'Failed to update watch' });
  }
});

// ─── POST /api/watches ──────────────────────────────────────────────
app.post('/api/watches', requireAuth, async (req, res) => {
  try {
    const data = await fs.readFile(INVENTORY_PATH, 'utf-8');
    const inventory = JSON.parse(data);
    const watch = {
      ...req.body,
      id: req.body.id || `watch-${Date.now()}`,
      slug: req.body.slug || `${req.body.brand}-${req.body.model}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      status: req.body.status || 'AVAILABLE',
      images: req.body.images || [],
      specifications: req.body.specifications || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.push(watch);
    await fs.writeFile(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8');
    console.log(`✅ New watch added: ${watch.brand} ${watch.name} (${watch.id})`);
    res.status(201).json(watch);
  } catch (error) {
    console.error('Error creating watch:', error);
    res.status(500).json({ error: 'Failed to create watch' });
  }
});

// ─── DELETE /api/watches/:slug ───────────────────────────────────────
app.delete('/api/watches/:slug', requireAuth, async (req, res) => {
  try {
    const data = await fs.readFile(INVENTORY_PATH, 'utf-8');
    const inventory = JSON.parse(data);
    const index = inventory.findIndex(w => w.slug === req.params.slug);
    if (index === -1) return res.status(404).json({ error: 'Watch not found' });
    const removed = inventory.splice(index, 1)[0];
    await fs.writeFile(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8');
    console.log(`🗑️  Deleted watch: ${removed.brand} ${removed.name || removed.model} (${removed.slug})`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting watch:', error);
    res.status(500).json({ error: 'Failed to delete watch' });
  }
});

// ─── POST /api/inquiries ─────────────────────────────────────────────
const inquiriesPath = path.join(__dirname, 'src', 'data', 'inquiries.json');

// ─── Simple rate limiter ────────────────────────────────────────────
const rateLimitWindows = new Map();
function isRateLimited(key, maxRequests, windowMs) {
  const now = Date.now();
  const timestamps = rateLimitWindows.get(key) || [];
  const valid = timestamps.filter(t => now - t < windowMs);
  if (valid.length >= maxRequests) { rateLimitWindows.set(key, valid); return true; }
  valid.push(now);
  rateLimitWindows.set(key, valid);
  return false;
}

async function getInquiries() {
  try {
    const data = await fs.readFile(inquiriesPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveInquiries(inquiries) {
  await fs.writeFile(inquiriesPath, JSON.stringify(inquiries, null, 2), 'utf-8');
}

// ─── Email notifications via Resend ─────────────────────────────────
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendInquiryNotification(inquiry) {
  if (!resend) {
    console.log('⚠️  RESEND_API_KEY not set — skipping email notification');
    return;
  }
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@manilawatch.com';
  const watchInfo = inquiry.watch
    ? `\n\nWatch: ${inquiry.watch.brand} ${inquiry.watch.model} (Ref. ${inquiry.watch.reference})\nPrice: ₱${inquiry.watch.pricePHP?.toLocaleString()}`
    : '';

  try {
    await resend.emails.send({
      from: 'Manila Watch Atelier <notifications@manilawatch.com>',
      to: adminEmail,
      subject: `New Inquiry from ${inquiry.name}`,
      text: `New inquiry received:\n\nName: ${inquiry.name}\nEmail: ${inquiry.email}\nPhone: ${inquiry.phone || 'N/A'}\nMessage: ${inquiry.message || 'No message'}${watchInfo}\n\nReceived: ${inquiry.createdAt}`,
    });
    console.log(`📧 Email notification sent to ${adminEmail}`);
  } catch (err) {
    console.error('📧 Failed to send email notification:', err.message);
  }
}

app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, phone, message, watchId } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

    // Rate limit: 3 per email per hour
    if (isRateLimited(`inquiry:${email}`, 3, 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many inquiries. Please try again later.' });
    }

    const inquiries = await getInquiries();
    const inquiry = {
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone || null,
      message: message || '',
      watchId: watchId || null,
      watch: null,
      source: 'FORM',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    // Attach watch info if watchId provided
    if (watchId) {
      const watches = await getWatches();
      const w = watches.find(w => w.id === watchId);
      if (w) {
        inquiry.watch = { id: w.id, slug: w.slug, brand: w.brand, model: w.model, reference: w.reference, pricePHP: w.pricePHP, images: w.images };
      }
    }

    inquiries.push(inquiry);
    await saveInquiries(inquiries);
    console.log(`✅ New inquiry from ${name} (${email})`);
    res.status(201).json({ success: true, id: inquiry.id });

    // Send email notification (non-blocking)
    sendInquiryNotification(inquiry).catch(() => {});
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

app.get('/api/inquiries', requireAuth, async (req, res) => {
  try {
    const inquiries = await getInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error('Error reading inquiries:', error);
    res.status(500).json({ error: 'Failed to read inquiries' });
  }
});

// ─── PUT /api/inquiries/:id ──────────────────────────────────────────
const ALLOWED_INQUIRY_STATUSES = new Set(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED']);

app.put('/api/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const inquiries = await getInquiries();
    const index = inquiries.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Inquiry not found' });
    // Only allow updating status + lastContactedAt — prevent arbitrary field injection
    const { status, lastContactedAt } = req.body;
    if (!status || !ALLOWED_INQUIRY_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be NEW, CONTACTED, FOLLOW_UP, or CLOSED.' });
    }
    if (lastContactedAt && isNaN(Date.parse(lastContactedAt))) {
      return res.status(400).json({ error: 'Invalid lastContactedAt timestamp.' });
    }
    const patch = { status };
    if (lastContactedAt) patch.lastContactedAt = lastContactedAt;
    inquiries[index] = { ...inquiries[index], ...patch };
    await saveInquiries(inquiries);
    res.json({ success: true, inquiry: inquiries[index] });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// ─── POST /api/chat — AI Chatbot ────────────────────────────────────
function buildChatSystemPrompt(watches) {
  const watchTable = watches
    .filter(w => (w.status || 'AVAILABLE') !== 'SOLD')
    .map(w => {
      const specs = w.specifications || {};
      return [
        `- **${w.brand} ${w.model}** (Ref. ${w.reference})`,
        `  Slug: ${w.slug} | ID: ${w.id}`,
        `  Price: PHP ${(w.pricePHP || w.price_php || 0).toLocaleString()}`,
        w.retailPricePHP ? `  Retail: PHP ${w.retailPricePHP.toLocaleString()}` : null,
        `  Condition: ${w.condition} | ${w.boxPapers || (w.box && w.papers ? 'Box & Papers' : w.box ? 'Box Only' : w.papers ? 'Papers Only' : 'None')}`,
        `  Category: ${w.category} | Tier: ${w.tier} | Status: ${w.status || 'AVAILABLE'}`,
        w.year ? `  Year: ${w.year}` : null,
        specs.diameter || w.caseDiameter ? `  Case: ${specs.diameter || w.caseDiameter + 'mm'} ${w.caseMaterial || specs.caseMaterial || ''}` : null,
        specs.movement || w.movement ? `  Movement: ${specs.movement || w.movement}` : null,
        `  Description: ${(w.description || 'N/A').slice(0, 200)}`,
      ].filter(Boolean).join('\n');
    })
    .join('\n\n');

  return `You are the AI concierge for Manila Watch Atelier (MWA), a premium grey market watch dealer in Manila, Philippines, owned and operated by Sherard W Ng.

## YOUR ROLE
You are a knowledgeable, warm, and professional luxury watch advisor. You represent MWA with the sophistication expected of a high-end watch dealer while being approachable and never condescending. Your primary goal is to help customers find their perfect timepiece and connect them with Sherard for purchase.

## BUSINESS CONTEXT
- MWA specializes in authenticated luxury watches: Rolex, Patek Philippe, Audemars Piguet, Omega, Cartier, Tudor
- All watches are personally authenticated and inspected by Sherard
- Grey market dealer — watches are sourced from the secondary/pre-owned market at competitive prices
- NO online checkout — all pricing discussions, negotiations, and payments happen directly with Sherard
- Location: Manila, Philippines
- Contact: WhatsApp (+63 912 345 6789), Email (sherard@manilawatch.com)
- Instagram: @manilawatchatelier | Facebook: sherard.ng

## VALUE PROPOSITIONS
- 3-Month Service Warranty on all purchases
- Buy-Back Guarantee program (investment protection)
- Professional authentication with documentation
- Expert guidance for new and seasoned collectors
- Watch sourcing service — can find specific models through dealer network
- In-person viewing appointments available in Manila

## CURRENT INVENTORY
${watchTable}

## LEAD QUALIFICATION
Naturally assess: intent level, budget signals, specific interest, timeline, contact willingness.

## BEHAVIOR RULES
1. NEVER quote exact negotiation prices — say "listed at PHP X" and suggest contacting Sherard for best pricing
2. NEVER make up watches or specs not in inventory
3. If a watch isn't in inventory, offer to submit a sourcing request
4. When customer shows strong buying intent, guide them toward sharing contact info
5. Keep responses concise — 2-4 sentences for simple queries
6. Use Filipino-English naturally if the customer does
7. For technical questions, be detailed and educational
8. NEVER reveal you are an AI. You are the MWA concierge
9. Stay neutral about competitors, redirect to MWA value
10. Currency is PHP by default

## HANDOFF TRIGGERS
When you detect HIGH INTENT, use create_inquiry tool and tell them Sherard will reach out within 24 hours. Frame as VIP treatment.`;
}

const chatTools = [
  {
    name: 'search_inventory',
    description: 'Search watch inventory by brand, price range, category, or keywords.',
    input_schema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'Brand name to filter by' },
        minPrice: { type: 'number', description: 'Minimum price in PHP' },
        maxPrice: { type: 'number', description: 'Maximum price in PHP' },
        category: { type: 'string', description: 'Watch category' },
        condition: { type: 'string', description: 'Condition filter' },
        query: { type: 'string', description: 'Free-text search' },
      },
      required: [],
    },
  },
  {
    name: 'get_watch_details',
    description: 'Get detailed info about a specific watch by slug or reference.',
    input_schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Watch slug' },
        reference: { type: 'string', description: 'Reference number' },
      },
      required: [],
    },
  },
  {
    name: 'create_inquiry',
    description: 'Create an inquiry/lead when customer shares contact info or shows buying intent.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Customer name' },
        email: { type: 'string', description: 'Customer email' },
        phone: { type: 'string', description: 'Customer phone' },
        message: { type: 'string', description: 'Interest summary with intent level' },
        watchId: { type: 'string', description: 'Specific watch ID' },
      },
      required: ['name', 'message'],
    },
  },
  {
    name: 'get_whatsapp_link',
    description: 'Generate WhatsApp link to message Sherard directly.',
    input_schema: {
      type: 'object',
      properties: {
        watchName: { type: 'string' },
        reference: { type: 'string' },
        price: { type: 'string' },
      },
      required: [],
    },
  },
];

async function executeChatTool(name, input, watches) {
  switch (name) {
    case 'search_inventory': {
      let results = watches.filter(w => (w.status || 'AVAILABLE') !== 'SOLD');
      if (input.brand) results = results.filter(w => w.brand.toLowerCase().includes(input.brand.toLowerCase()));
      if (input.minPrice) results = results.filter(w => (w.pricePHP || w.price_php) >= input.minPrice);
      if (input.maxPrice) results = results.filter(w => (w.pricePHP || w.price_php) <= input.maxPrice);
      if (input.category) results = results.filter(w => w.category?.toLowerCase() === input.category.toLowerCase());
      if (input.condition) results = results.filter(w => w.condition?.toLowerCase() === input.condition.toLowerCase());
      if (input.query) {
        const q = input.query.toLowerCase();
        results = results.filter(w =>
          w.brand.toLowerCase().includes(q) || w.model.toLowerCase().includes(q) ||
          w.name?.toLowerCase().includes(q) || w.reference.toLowerCase().includes(q) ||
          w.description?.toLowerCase().includes(q)
        );
      }
      if (results.length === 0) return JSON.stringify({ found: 0, message: 'No matches. Suggest broader criteria or sourcing request.' });
      return JSON.stringify({
        found: results.length,
        watches: results.map(w => ({
          slug: w.slug, id: w.id, brand: w.brand, model: w.model, reference: w.reference,
          name: w.name, pricePHP: w.pricePHP || w.price_php, condition: w.condition,
          boxPapers: w.boxPapers || (w.box && w.papers ? 'Box & Papers' : 'None'),
          tier: w.tier, category: w.category, status: w.status || 'AVAILABLE', url: `/watch/${w.slug}`,
        })),
      });
    }
    case 'get_watch_details': {
      const watch = watches.find(w => (input.slug && w.slug === input.slug) || (input.reference && w.reference === input.reference));
      if (!watch) return JSON.stringify({ error: 'Watch not found.' });
      return JSON.stringify({
        slug: watch.slug, id: watch.id, brand: watch.brand, model: watch.model,
        reference: watch.reference, name: watch.name, pricePHP: watch.pricePHP || watch.price_php,
        retailPricePHP: watch.retailPricePHP || null, condition: watch.condition,
        boxPapers: watch.boxPapers || (watch.box && watch.papers ? 'Box & Papers' : 'None'),
        year: watch.year || null, tier: watch.tier, category: watch.category,
        description: watch.description, specifications: watch.specifications,
        marketTrend: watch.marketTrend || 'STABLE', status: watch.status || 'AVAILABLE',
        url: `/watch/${watch.slug}`, imageCount: watch.images?.length || 0, hasVideo: !!watch.video,
      });
    }
    case 'create_inquiry': {
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const rawName = String(input.name || 'Chat Customer').slice(0, 200).trim();
      const rawEmail = String(input.email || '').slice(0, 200).trim();
      const rawPhone = input.phone ? String(input.phone).slice(0, 30).replace(/[^\d+\s()-]/g, '').trim() : null;
      const rawMessage = String(input.message || '').slice(0, 2000);
      const validWatchId = input.watchId && watches.find(w => w.id === input.watchId) ? input.watchId : null;

      const inquiry = {
        id: crypto.randomUUID(),
        name: rawName || 'Chat Customer',
        email: emailRx.test(rawEmail) ? rawEmail : '',
        phone: rawPhone || null,
        message: `[AI CHATBOT LEAD] ${rawMessage}`,
        watchId: validWatchId,
        watch: null,
        source: 'AI_CHAT',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      if (validWatchId) {
        const w = watches.find(w => w.id === validWatchId);
        if (w) inquiry.watch = { id: w.id, slug: w.slug, brand: w.brand, model: w.model, reference: w.reference, pricePHP: w.pricePHP || w.price_php, images: w.images };
      }
      try {
        const inquiries = await getInquiries();
        inquiries.push(inquiry);
        await saveInquiries(inquiries);
        console.log(`✅ AI Chat lead created: ${inquiry.name} — ${rawMessage.slice(0, 80)}`);
      } catch (e) { console.error('Failed to save chat inquiry:', e?.message || e); }

      sendInquiryNotification(inquiry).catch((err) =>
        console.error('[email] chat-lead notification failed:', err?.message || err)
      );

      return JSON.stringify({ success: true, id: inquiry.id, message: `Inquiry created for ${inquiry.name}. Sherard will be notified.` });
    }
    case 'get_whatsapp_link': {
      const number = '639123456789';
      const parts = [input.watchName, input.reference ? `(Ref: ${input.reference})` : '', input.price ? `- ${input.price}` : ''].filter(Boolean).join(' ');
      const msg = parts ? `Hi Sherard! I'm interested in the ${parts}. I was chatting on your website.` : `Hi Sherard! I'm browsing Manila Watch Atelier.`;
      return JSON.stringify({ url: `https://wa.me/${number}?text=${encodeURIComponent(msg)}` });
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('YOUR_KEY_HERE')) {
    return res.status(503).json({ error: 'AI chatbot not configured. Set ANTHROPIC_API_KEY in .env' });
  }

  try {
    const { messages, sessionId } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    if (messages.length > 40) {
      return res.status(400).json({ error: 'Conversation too long. Please start a new chat.' });
    }
    let totalChars = 0;
    for (const msg of messages) {
      if (!msg || (msg.role !== 'user' && msg.role !== 'assistant')) {
        return res.status(400).json({ error: 'Each message must have role "user" or "assistant".' });
      }
      if (typeof msg.content !== 'string') {
        return res.status(400).json({ error: 'Message content must be a string.' });
      }
      if (msg.content.length > 5000) {
        return res.status(400).json({ error: 'Message too long. Maximum 5000 characters.' });
      }
      totalChars += msg.content.length;
    }
    if (totalChars > 50000) {
      return res.status(400).json({ error: 'Conversation too long. Please start a new chat.' });
    }

    // Rate limit by IP first (not client-controlled sessionId): 30 per 10 min + 200 per day hard ceiling.
    const clientIP = (req.ip || req.socket?.remoteAddress || 'unknown').toString();
    const rateLimitKey = `chat:${clientIP}`;
    if (isRateLimited(rateLimitKey, 30, 10 * 60 * 1000)) {
      return res.status(429).json({ error: "You're chatting too fast. Please wait a moment." });
    }
    if (isRateLimited(`chat-day:${clientIP}`, 200, 24 * 60 * 60 * 1000)) {
      return res.status(429).json({ error: 'Daily chat limit reached. Please try again tomorrow or contact Sherard directly.' });
    }

    const recentMessages = messages.slice(-20);
    const watches = await getWatches();
    const systemPrompt = buildChatSystemPrompt(watches);
    const client = new Anthropic({ apiKey });

    let currentMessages = recentMessages.map(m => ({ role: m.role, content: m.content }));
    let finalText = '';
    let toolCallCount = 0;

    while (toolCallCount < 5) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: chatTools,
        messages: currentMessages,
      });

      const textBlocks = response.content.filter(b => b.type === 'text');
      const toolBlocks = response.content.filter(b => b.type === 'tool_use');

      if (textBlocks.length > 0) finalText = textBlocks.map(b => b.text).join('');
      if (toolBlocks.length === 0 || response.stop_reason !== 'tool_use') break;

      const toolResults = [];
      for (const block of toolBlocks) {
        toolCallCount++;
        const result = await executeChatTool(block.name, block.input, watches);
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    console.log(`💬 Chat response generated (${toolCallCount} tool calls)`);
    res.json({ reply: finalText, sessionId: sessionId || crypto.randomUUID() });
  } catch (error) {
    console.error('Chat API error:', error.message || error);
    if (error?.status === 401) return res.status(503).json({ error: 'AI service auth failed. Check ANTHROPIC_API_KEY.' });
    if (error?.status === 429) return res.status(503).json({ error: 'AI service busy. Try again shortly.' });
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// ─── POST /api/upload-image ──────────────────────────────────────────
app.post('/api/upload-image', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = req.files.map(file => `/images/watches/${file.filename}`);
    console.log(`✅ Uploaded ${urls.length} image(s):`, urls);
    res.json({ success: true, urls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// ─── HMAC Token Helpers ─────────────────────────────────────────────
function getTokenSecret() {
  const salt = process.env.SALT;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!salt || !hash) throw new Error('SALT and ADMIN_PASSWORD_HASH env vars required');
  return `${salt}:${hash}`;
}

function createSignedToken(username) {
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;
  const payload = { sub: username, iat: now, exp: expiresAt };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', getTokenSecret()).update(encoded).digest('base64url');
  return { token: `${encoded}.${signature}`, expiresAt };
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', getTokenSecret()).update(encoded).digest('base64url');
  if (signature.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (!payload.sub || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch { return null; }
}

// ─── Auth Middleware for Admin Routes ────────────────────────────────
function requireAuth(req, res, next) {
  const payload = verifyToken(req.headers.authorization);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  req.adminUser = payload.sub;
  next();
}

// ─── POST /api/auth ──────────────────────────────────────────────────
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    const SALT = process.env.SALT;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SALT) {
      console.error('Auth env vars missing');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const passwordHash = crypto.createHash('sha256').update(password + SALT).digest('hex');

    // Timing-safe comparison
    const userBuf = Buffer.from(String(username));
    const adminBuf = Buffer.from(ADMIN_USERNAME);
    const hashBuf = Buffer.from(passwordHash);
    const expectedBuf = Buffer.from(ADMIN_PASSWORD_HASH);
    const usernameMatch = userBuf.length === adminBuf.length && crypto.timingSafeEqual(userBuf, adminBuf);
    const passwordMatch = hashBuf.length === expectedBuf.length && crypto.timingSafeEqual(hashBuf, expectedBuf);

    if (usernameMatch && passwordMatch) {
      const { token, expiresAt } = createSignedToken(ADMIN_USERNAME);
      console.log(`Admin login successful: ${username}`);
      res.json({ success: true, token, expiresAt, username: ADMIN_USERNAME });
    } else {
      console.log(`Failed login attempt: ${username}`);
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Manila Watch Atelier — Dev API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`📝 Watches: http://localhost:${PORT}/api/watches`);
  console.log(`📝 Inquiries: http://localhost:${PORT}/api/inquiries`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth\n`);
});
