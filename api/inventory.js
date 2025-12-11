import fs from 'fs/promises';
import path from 'path';

// Vercel serverless function to handle inventory GET and POST
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const inventoryPath = path.join(process.cwd(), 'src', 'data', 'inventory.json');
  const publicInventoryPath = path.join(process.cwd(), 'public', 'data', 'inventory.json');

  try {
    if (req.method === 'GET') {
      // Read inventory
      const data = await fs.readFile(inventoryPath, 'utf-8');
      const inventory = JSON.parse(data);
      return res.status(200).json(inventory);
    }

    if (req.method === 'POST') {
      // Save inventory
      const watches = req.body;

      // Validate data
      if (!Array.isArray(watches)) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of watches.' });
      }

      // Save to both inventory files
      const jsonData = JSON.stringify(watches, null, 2);

      await Promise.all([
        fs.writeFile(inventoryPath, jsonData, 'utf-8'),
        fs.writeFile(publicInventoryPath, jsonData, 'utf-8'),
      ]);

      console.log(`✅ Saved ${watches.length} watches to inventory files`);
      return res.status(200).json({
        success: true,
        message: `Saved ${watches.length} watches`,
        count: watches.length
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling inventory:', error);
    return res.status(500).json({ error: 'Failed to process inventory request' });
  }
}
