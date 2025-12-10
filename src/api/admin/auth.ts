// Admin Authentication API
// This is a client-side implementation. In production, move to server-side (Express/Next.js API routes)

import { validateCredentials, createSession, getSessionUser, deleteSession } from '../../lib/auth';

export async function handleLogin(email: string, password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = validateCredentials(email, password);

  if (!user) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }

  const token = createSession(user);

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

export async function handleVerify(token: string) {
  const user = getSessionUser(token);

  if (!user) {
    return {
      success: false,
      error: 'Invalid or expired session'
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

export async function handleLogout(token: string) {
  deleteSession(token);

  return {
    success: true
  };
}

// Mock API endpoints for client-side usage
export const authAPI = {
  login: async (email: string, password: string) => {
    return handleLogin(email, password);
  },

  verify: async (token: string) => {
    return handleVerify(token);
  },

  logout: async (token: string) => {
    return handleLogout(token);
  }
};
