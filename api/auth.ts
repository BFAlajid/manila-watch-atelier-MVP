// POST /api/auth — Admin login
import crypto from 'crypto';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_PASSWORD_HASH) {
      // Dev mode: accept any credentials if hash not configured
      const token = crypto.randomBytes(32).toString('hex');
      return res.json({
        success: true,
        token,
        expiresAt: Date.now() + 86400000,
        username: ADMIN_USERNAME,
      });
    }

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Username and password are required' });
    }

    const salt = process.env.SALT || 'manila-watch-salt';
    const passwordHash = crypto
      .createHash('sha256')
      .update(password + salt)
      .digest('hex');

    if (username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH) {
      const token = crypto.randomBytes(32).toString('hex');
      return res.json({
        success: true,
        token,
        expiresAt: Date.now() + 86400000,
        username: ADMIN_USERNAME,
      });
    } else {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}
