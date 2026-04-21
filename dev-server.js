// Development API server — thin Express wrapper around the shared handlers.
// In production, Vercel serverless functions in api/ handle these same routes.
// All business logic lives in api/_lib/handlers/*.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Shared handlers (compiled on the fly by tsx when this server runs).
import { healthCheck } from './api/_lib/handlers/health.ts';
import {
  listWatches,
  getWatchBySlug,
  createWatch,
  updateWatch,
  deleteWatch,
} from './api/_lib/handlers/watches.ts';
import {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} from './api/_lib/handlers/inquiries.ts';
import { login } from './api/_lib/handlers/auth.ts';
import { handleChat } from './api/_lib/handlers/chat.ts';
import { verifyAuth } from './api/_lib/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors({ origin: process.env.APP_URL || 'http://localhost:3000' }));
app.use(express.json());

// ─── Express adapter: req/res ↔ HandlerContext/HandlerResult ──────────────
function lowercaseHeaders(h) {
  const out = {};
  for (const [k, v] of Object.entries(h || {})) {
    if (v === undefined) continue;
    out[k.toLowerCase()] = Array.isArray(v) ? v[0] : String(v);
  }
  return out;
}

function toCtx(req, extraQuery) {
  return {
    method: (req.method || 'GET').toUpperCase(),
    query: { ...(req.query || {}), ...(extraQuery || {}) },
    body: req.body ?? null,
    headers: lowercaseHeaders(req.headers || {}),
    auth: verifyAuth(req),
    clientIP: req.ip || req.socket?.remoteAddress || 'unknown',
  };
}

function sendResult(res, result) {
  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
  }
  if (result.body === undefined) return res.status(result.status).end();
  return res.status(result.status).json(result.body);
}

function route(handler, getExtraQuery) {
  return async (req, res) => {
    try {
      const extra = typeof getExtraQuery === 'function' ? getExtraQuery(req) : undefined;
      const result = await handler(toCtx(req, extra));
      sendResult(res, result);
    } catch (err) {
      console.error(`[dev-server] ${req.method} ${req.path} error:`, err?.message || err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/api/health', route(healthCheck));

app.get('/api/watches', route(listWatches));
app.get('/api/watches/:slug', route(getWatchBySlug, (req) => ({ slug: req.params.slug })));
app.post('/api/watches', route(createWatch));
app.post('/api/watches/create', route(createWatch));
app.put('/api/watches/:slug', route(updateWatch, (req) => ({ slug: req.params.slug })));
app.delete('/api/watches/:slug', route(deleteWatch, (req) => ({ slug: req.params.slug })));

app.post('/api/inquiries', route(createInquiry));
app.get('/api/inquiries', route(listInquiries));
app.put('/api/inquiries/:id', route(updateInquiryStatus, (req) => ({ id: req.params.id })));

app.post('/api/auth', route(login));
app.post('/api/chat', route(handleChat));

// ─── Upload (kept wrapper-owned — multipart parsing differs Express vs Vercel) ──
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
    const safeBase = original.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unpredictable = crypto.randomUUID().slice(0, 8);
    cb(null, `${Date.now()}-${unpredictable}-${safeBase}`);
  },
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
  },
});

function requireAdmin(req, res, next) {
  const auth = verifyAuth(req);
  if (!auth.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  req.adminUser = auth.username;
  next();
}

app.post('/api/upload-image', requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }
    const urls = req.files.map((f) => `/images/watches/${f.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// ─── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nManila Watch Atelier — Dev API Server`);
  console.log(`Running on http://localhost:${PORT}`);
  console.log(`Watches: http://localhost:${PORT}/api/watches`);
  console.log(`Inquiries: http://localhost:${PORT}/api/inquiries`);
  console.log(`Chat: http://localhost:${PORT}/api/chat`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Health: http://localhost:${PORT}/api/health\n`);
});
