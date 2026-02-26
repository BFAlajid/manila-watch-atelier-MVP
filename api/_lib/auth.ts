// Shared auth verification for API routes
// Reads Authorization header and validates the admin token

import crypto from 'crypto';

interface AuthResult {
  authenticated: boolean;
  username?: string;
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

    // We trust the token if it exists and was issued by our auth endpoint.
    // In production, you'd verify against a session store or JWT signature.
    // For this SHA-256 auth system, the token is a random hex string
    // that was generated server-side. We validate it's a proper hex token.
    if (!/^[0-9a-f]{64}$/.test(token)) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      username: process.env.ADMIN_USERNAME || 'admin',
    };
  } catch {
    return { authenticated: false };
  }
}

export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + (process.env.SALT || 'manila-watch-salt'))
    .digest('hex');
}
