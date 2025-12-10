// Authentication Utilities

import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminSession | null> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return null;
  }
}

/**
 * Hash password for storage
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create default admin user if none exists
 */
export async function ensureDefaultAdmin() {
  try {
    const adminCount = await prisma.adminUser.count();

    if (adminCount === 0) {
      // Create default admin
      const hashedPassword = await hashPassword('WatchDealer2025!');

      await prisma.adminUser.create({
        data: {
          email: 'sherard@manilawatch.com',
          password: hashedPassword,
          name: 'Sherard W Ng',
          role: 'ADMIN',
        },
      });

      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
  }
}

/**
 * Simplified session management for Next.js
 * In production, you might want to use NextAuth.js
 */
export function createSessionToken(admin: AdminSession): string {
  // Simple JWT-like token (in production, use proper JWT library)
  const payload = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifySessionToken(token: string): AdminSession | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    if (payload.exp < Date.now()) {
      return null; // Expired
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
