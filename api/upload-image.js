import fs from 'fs/promises';
import path from 'path';
import { IncomingForm } from 'formidable';

// Vercel serverless function to handle image uploads
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'images', 'watches'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Ensure upload directory exists
    await fs.mkdir(path.join(process.cwd(), 'public', 'images', 'watches'), {
      recursive: true
    });

    // Parse the request
    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { files } = data;
    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];

    // Process uploaded files
    const imageUrls = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      const filename = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(process.cwd(), 'public', 'images', 'watches', filename);

      // Move file to final location
      await fs.rename(file.filepath, newPath);

      // Return URL path
      imageUrls.push(`/images/watches/${filename}`);
    }

    return res.status(200).json({
      success: true,
      urls: imageUrls
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return res.status(500).json({ error: 'Failed to upload images' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formidable
  },
};
