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
  // Prefer a dedicated TOKEN_SECRET so rotating the admin password doesn't
  // invalidate every token-signing key, and so an ADMIN_PASSWORD_HASH leak
  // doesn't give an attacker the ability to forge tokens. Fall back to the
  // legacy SALT:ADMIN_PASSWORD_HASH derivation for backwards compatibility
  // with existing deployments — tokens issued under either scheme remain
  // verifiable as long as the same scheme is active.
  const secret = process.env.TOKEN_SECRET;
  if (secret) {
    if (secret.length < 32) {
      throw new Error('TOKEN_SECRET must be at least 32 characters');
    }
    return secret;
  }
  const salt = process.env.SALT;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!salt || !hash) {
    throw new Error('Auth config incomplete: set TOKEN_SECRET (preferred) or SALT + ADMIN_PASSWORD_HASH');
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

// 4-hour TTL limits the blast radius if a token is stolen (e.g. via XSS).
// Admin will need to re-log at the start of each working session.
const ADMIN_TOKEN_TTL_MS = 4 * 60 * 60 * 1000;

export function createToken(username: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + ADMIN_TOKEN_TTL_MS;

  const payload: TokenPayload = {
    sub: username,
    iat: now,
    exp: expiresAt,
  };

  return { token: sign(payload), expiresAt };
}

// Password hashing — scrypt with explicit parameters baked into the hash so we
// can rotate cost factors later without breaking old hashes. The output format
// is `scrypt$N$r$p$salt$derived` (base64url-encoded parts). SHA-256 remains
// supported via verifyPassword for backwards compatibility during transition;
// see docs/auth-migration.md for the re-set admin password flow.
const SCRYPT_N = 16384; // 2^14 — recommended for interactive login
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;

function scryptHashSync(password: string, salt: Buffer): Buffer {
  return crypto.scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
}

export function hashPasswordScrypt(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = scryptHashSync(password, salt);
  const parts = [
    'scrypt',
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    salt.toString('base64url'),
    derived.toString('base64url'),
  ];
  return parts.join('$');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  // New-format scrypt hashes start with "scrypt$".
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 6) return false;
    const [, nStr, rStr, pStr, saltB64, derivedB64] = parts;
    try {
      const salt = Buffer.from(saltB64, 'base64url');
      const stored = Buffer.from(derivedB64, 'base64url');
      const derived = crypto.scryptSync(password, salt, stored.length, {
        N: Number(nStr),
        r: Number(rStr),
        p: Number(pStr),
      });
      return derived.length === stored.length && crypto.timingSafeEqual(derived, stored);
    } catch {
      return false;
    }
  }

  // Legacy SHA-256+salt hash (hex). Supported for backwards compat only.
  const salt = process.env.SALT;
  if (!salt) return false;
  const computed = crypto
    .createHash('sha256')
    .update(password + salt)
    .digest('hex');
  if (computed.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

// Retained for the legacy `npm run` helper in docs; emits SHA-256 so callers
// who generated hashes with the old snippet still work. New hashes should use
// hashPasswordScrypt() instead.
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
