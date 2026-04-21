import crypto from 'crypto';
import { isRateLimited } from './_lib/rate-limit.js';

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

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    const SALT = process.env.SALT;

    // Fail hard if auth env vars are not configured — do not leak which ones
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SALT) {
      console.error('Auth env vars missing: ADMIN_USERNAME, ADMIN_PASSWORD_HASH, or SALT');
      return res.status(500).json({ error: 'Authentication service unavailable' });
    }

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Rate limit login attempts by IP: 5 attempts per 15 minutes
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
    if (isRateLimited(`login:${clientIP}`, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    }

    const passwordHash = hashPassword(password, SALT);

    // Timing-safe comparison for both username and password hash
    const usernameMatch = safeEqual(username, ADMIN_USERNAME);
    const passwordMatch = safeEqual(passwordHash, ADMIN_PASSWORD_HASH);

    if (usernameMatch && passwordMatch) {
      const { token, expiresAt } = createSignedToken(ADMIN_USERNAME, SALT, ADMIN_PASSWORD_HASH);

      return res.status(200).json({
        success: true,
        token,
        expiresAt,
        username: ADMIN_USERNAME,
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }
  } catch (error) {
    console.error('Authentication error');
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Compare against self to keep constant time, then return false
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function hashPassword(password, salt) {
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

function getSecret(salt, hash) {
  return `${salt}:${hash}`;
}

// 4-hour TTL limits the blast radius if a token is stolen (e.g. via XSS).
const ADMIN_TOKEN_TTL_MS = 4 * 60 * 60 * 1000;

function createSignedToken(username, salt, hash) {
  const now = Date.now();
  const expiresAt = now + ADMIN_TOKEN_TTL_MS;

  const payload = { sub: username, iat: now, exp: expiresAt };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret(salt, hash))
    .update(encoded)
    .digest('base64url');

  return { token: `${encoded}.${signature}`, expiresAt };
}
