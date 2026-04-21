import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IncomingForm } from 'formidable';
import { verifyAuth } from './_lib/auth.js';

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFilename(original) {
  // Extract only the basename (prevent path traversal via ../ or absolute paths)
  const base = path.basename(original || 'upload');
  // Strip everything except alphanumeric, dots, hyphens, underscores
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Ensure it has a valid extension
  const ext = path.extname(safe).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return null;
  return safe;
}

export default async function handler(req, res) {
  // CORS
  const allowedOrigin = process.env.APP_URL || 'https://manilawatch.com';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication required (shared verifier — picks up TOKEN_SECRET or legacy SALT+HASH).
  if (!verifyAuth(req).authenticated) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'watches');

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 10,
      filter: ({ mimetype }) => {
        // Reject files with disallowed MIME types at parse time
        return ALLOWED_MIME_TYPES.has(mimetype);
      },
    });

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { files } = data;
    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];

    const imageUrls = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      // Validate MIME type (double-check after parse)
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        // Clean up the temp file
        await fs.unlink(file.filepath).catch(() => {});
        continue;
      }

      // Validate and sanitize filename
      const safeName = sanitizeFilename(file.originalFilename);
      if (!safeName) {
        await fs.unlink(file.filepath).catch(() => {});
        continue;
      }

      // Generate unique filename with random prefix (unpredictable)
      const uniqueName = `${crypto.randomUUID()}-${safeName}`;
      const newPath = path.join(uploadDir, uniqueName);

      // Verify the resolved path is still within uploadDir (defense in depth)
      const resolved = path.resolve(newPath);
      if (!resolved.startsWith(path.resolve(uploadDir))) {
        await fs.unlink(file.filepath).catch(() => {});
        continue;
      }

      await fs.rename(file.filepath, newPath);
      imageUrls.push(`/images/watches/${uniqueName}`);
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({
        error: 'No valid images uploaded. Allowed types: JPEG, PNG, WebP, AVIF.',
      });
    }

    return res.status(200).json({ success: true, urls: imageUrls });
  } catch (error) {
    console.error('Upload error:', error.message);
    return res.status(500).json({ error: 'Failed to upload images' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
