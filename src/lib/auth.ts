// Simple but secure admin authentication
// In production, use bcrypt for password hashing

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'dealer';
}

// In production, store in database with hashed passwords
const ADMIN_USERS = {
  'sherard@manilawatch.com': {
    id: 'admin-001',
    email: 'sherard@manilawatch.com',
    password: 'WatchDealer2025!', // In production: use bcrypt.hash()
    name: 'Sherard W Ng',
    role: 'admin' as const
  }
};

export function validateCredentials(email: string, password: string): AdminUser | null {
  const user = ADMIN_USERS[email as keyof typeof ADMIN_USERS];

  if (!user || user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

// Store active sessions in memory (in production: use Redis or database)
const activeSessions = new Map<string, { user: AdminUser; expiresAt: number }>();

export function createSession(user: AdminUser): string {
  const token = generateSessionToken();
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

  activeSessions.set(token, { user, expiresAt });

  return token;
}

export function getSessionUser(token: string): AdminUser | null {
  const session = activeSessions.get(token);

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session.user;
}

export function deleteSession(token: string): void {
  activeSessions.delete(token);
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // Every hour
