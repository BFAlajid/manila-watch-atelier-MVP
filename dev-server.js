// Simple development API server for local testing
// In production, Vercel serverless functions + Prisma handle this
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'images', 'watches');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
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
app.put('/api/watches/:slug', async (req, res) => {
  try {
    const data = await fs.readFile(INVENTORY_PATH, 'utf-8');
    const inventory = JSON.parse(data);
    const index = inventory.findIndex(w => w.slug === req.params.slug);
    if (index === -1) return res.status(404).json({ error: 'Watch not found' });
    inventory[index] = { ...inventory[index], ...req.body, updated_at: new Date().toISOString() };
    await fs.writeFile(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8');
    res.json(inventory[index]);
  } catch (error) {
    console.error('Error updating watch:', error);
    res.status(500).json({ error: 'Failed to update watch' });
  }
});

// ─── POST /api/watches ──────────────────────────────────────────────
app.post('/api/watches', async (req, res) => {
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
app.delete('/api/watches/:slug', async (req, res) => {
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

app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await getInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error('Error reading inquiries:', error);
    res.status(500).json({ error: 'Failed to read inquiries' });
  }
});

// ─── PUT /api/inquiries/:id ──────────────────────────────────────────
app.put('/api/inquiries/:id', async (req, res) => {
  try {
    const inquiries = await getInquiries();
    const index = inquiries.findIndex(i => i.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Inquiry not found' });
    inquiries[index] = { ...inquiries[index], ...req.body };
    await saveInquiries(inquiries);
    res.json({ success: true, inquiry: inquiries[index] });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// ─── POST /api/upload-image ──────────────────────────────────────────
app.post('/api/upload-image', upload.array('images', 10), async (req, res) => {
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

// ─── POST /api/auth ──────────────────────────────────────────────────
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_PASSWORD_HASH) {
      // In dev mode, accept any password if hash not configured
      console.log('⚠️  ADMIN_PASSWORD_HASH not set — accepting any credentials for dev');
      const token = crypto.randomBytes(32).toString('hex');
      return res.json({ success: true, token, expiresAt: Date.now() + 86400000, username: ADMIN_USERNAME });
    }

    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    const salt = process.env.SALT || 'manila-watch-salt';
    const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      const token = crypto.randomBytes(32).toString('hex');
      console.log(`✅ Admin login successful: ${username}`);
      res.json({ success: true, token, expiresAt: Date.now() + 86400000, username: ADMIN_USERNAME });
    } else {
      console.log(`❌ Failed login attempt: ${username}`);
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
