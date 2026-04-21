import crypto from 'crypto';
import type { Handler } from './types.js';
import { isRateLimited } from '../rate-limit.js';
import { createToken } from '../auth.js';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // keep constant-time on length mismatch
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export const login: Handler = async (ctx) => {
  if (ctx.method !== 'POST') return { status: 405, body: { error: 'Method not allowed' } };

  const body = (ctx.body || {}) as { username?: string; password?: string };
  const { username, password } = body;

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
  const SALT = process.env.SALT;

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD_HASH || !SALT) {
    console.error('[auth] auth config incomplete');
    return { status: 500, body: { error: 'Authentication service unavailable' } };
  }

  if (!username || !password) {
    return { status: 400, body: { error: 'Username and password are required' } };
  }

  // 5 attempts per 15 minutes per IP.
  if (isRateLimited(`login:${ctx.clientIP}`, 5, 15 * 60 * 1000)) {
    return { status: 429, body: { error: 'Too many login attempts. Please try again later.' } };
  }

  const passwordHash = hashPassword(password, SALT);
  const usernameMatch = safeEqual(username, ADMIN_USERNAME);
  const passwordMatch = safeEqual(passwordHash, ADMIN_PASSWORD_HASH);

  if (!(usernameMatch && passwordMatch)) {
    return { status: 401, body: { success: false, error: 'Invalid credentials' } };
  }

  const { token, expiresAt } = createToken(ADMIN_USERNAME);
  return {
    status: 200,
    body: { success: true, token, expiresAt, username: ADMIN_USERNAME },
  };
};
