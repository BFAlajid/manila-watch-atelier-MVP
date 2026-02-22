// Simple development API server for local testing
// In production, Vercel serverless functions handle this
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    // Ensure directory exists
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

const INVENTORY_PATHS = [
  path.join(__dirname, 'src', 'data', 'inventory.json'),
  path.join(__dirname, 'public', 'data', 'inventory.json'),
];

// GET /api/inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await fs.readFile(INVENTORY_PATHS[0], 'utf-8');
    const inventory = JSON.parse(data);
    res.json(inventory);
  } catch (error) {
    console.error('❌ Error reading inventory:', error);
    res.status(500).json({ error: 'Failed to read inventory' });
  }
});

// POST /api/inventory
app.post('/api/inventory', async (req, res) => {
  try {
    const watches = req.body;

    if (!Array.isArray(watches)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    const jsonData = JSON.stringify(watches, null, 2);

    // Save to both files
    await Promise.all(
      INVENTORY_PATHS.map(filePath => fs.writeFile(filePath, jsonData, 'utf-8'))
    );

    console.log(`✅ Saved ${watches.length} watches to inventory.json files`);
    res.json({
      success: true,
      message: `Saved ${watches.length} watches`,
      count: watches.length
    });
  } catch (error) {
    console.error('❌ Error saving inventory:', error);
    res.status(500).json({ error: 'Failed to save inventory' });
  }
});

// POST /api/upload-image - Upload watch images
app.post('/api/upload-image', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    // Return URLs for uploaded images
    const urls = req.files.map(file => `/images/watches/${file.filename}`);

    console.log(`✅ Uploaded ${urls.length} image(s):`, urls);
    res.json({
      success: true,
      urls
    });
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// POST /api/auth - Admin authentication
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get credentials from environment or use defaults
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_PASSWORD_HASH) {
      return res.status(500).json({ error: 'ADMIN_PASSWORD_HASH not configured in environment' });
    }

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const passwordHash = hashPassword(password);

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      console.log(`✅ Admin login successful: ${username}`);
      res.json({
        success: true,
        token,
        expiresAt,
        username: ADMIN_USERNAME
      });
    } else {
      console.log(`❌ Failed login attempt: ${username}`);
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Hash password helper
function hashPassword(password) {
  const salt = process.env.SALT || 'manila-watch-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

app.listen(PORT, () => {
  console.log(`\n🚀 Manila Watch Atelier - Dev API Server`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api/inventory\n`);
  console.log(`💡 This server saves watches to JSON files.`);
  console.log(`   Changes persist across app restarts.\n`);
});
