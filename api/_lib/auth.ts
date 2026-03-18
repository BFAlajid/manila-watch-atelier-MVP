// Shared auth verification for API routes
// Uses HMAC-signed tokens so the server can verify tokens it issued
// without needing a session store.

import crypto from 'crypto';

interface AuthResult {
  authenticated: boolean;
  username?: string;
}

interface TokenPayload {
  sub: string;    // username
  iat: number;    // issued at (ms)
  exp: number;    // expires at (ms)
}

function getSecret(): string {
  const salt = process.env.SALT;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!salt || !hash) {
    throw new Error('SALT and ADMIN_PASSWORD_HASH environment variables are required');
  }
  return `${salt}:${hash}`;
}

function sign(payload: TokenPayload): string {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verify(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;

  let expectedSig: string;
  try {
    expectedSig = crypto
      .createHmac('sha256', getSecret())
      .update(encoded)
      .digest('base64url');
  } catch {
    return null; // env vars missing
  }

  // Timing-safe comparison to prevent timing attacks
  if (signature.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (!data.sub || !data.iat || !data.exp) return null;
    return data as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyAuth(req: any): AuthResult {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false };
    }

    const token = authHeader.slice(7);
    if (!token) {
      return { authenticated: false };
    }

    const payload = verify(token);
    if (!payload) {
      return { authenticated: false };
    }

    // Check expiry
    if (Date.now() > payload.exp) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      username: payload.sub,
    };
  } catch {
    return { authenticated: false };
  }
}

export function createToken(username: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  const payload: TokenPayload = {
    sub: username,
    iat: now,
    exp: expiresAt,
  };

  return { token: sign(payload), expiresAt };
}

export function hashPassword(password: string): string {
  const salt = process.env.SALT;
  if (!salt) {
    throw new Error('SALT environment variable is required');
  }
  return crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
}
