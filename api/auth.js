import crypto from 'crypto';

// Vercel serverless function for admin authentication
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
    const { username, password } = req.body;

    // Get credentials from environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || hashPassword('manila2024');

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check credentials
    const passwordHash = hashPassword(password);

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      // Generate session token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      return res.status(200).json({
        success: true,
        token,
        expiresAt,
        username: ADMIN_USERNAME
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Simple password hashing function
function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + (process.env.SALT || 'manila-watch-salt'))
    .digest('hex');
}
