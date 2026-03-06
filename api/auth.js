import crypto from 'crypto';

// Vercel serverless function for admin authentication
export default async function handler(req, res) {
  const allowedOrigin = process.env.APP_URL || 'https://manilawatch.com';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

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
      const { token, expiresAt } = createSignedToken(ADMIN_USERNAME);

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

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password + (process.env.SALT || 'manila-watch-salt'))
    .digest('hex');
}

function getSecret() {
  const salt = process.env.SALT || 'manila-watch-salt';
  const hash = process.env.ADMIN_PASSWORD_HASH || '';
  return `${salt}:${hash}`;
}

function createSignedToken(username) {
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;

  const payload = { sub: username, iat: now, exp: expiresAt };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(encoded)
    .digest('base64url');

  return { token: `${encoded}.${signature}`, expiresAt };
}
