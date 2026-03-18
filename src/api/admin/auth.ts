// Admin Authentication API — calls Vercel serverless /api/auth

const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      // Store expiry alongside token
      localStorage.setItem('admin_token_expires', String(data.expiresAt));
      localStorage.setItem('admin_username', data.username || email);

      return {
        success: true,
        token: data.token,
        user: {
          id: 'admin-001',
          email: email,
          name: data.username || 'Admin',
          role: 'admin' as const,
        },
      };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  },

  verify: async (token: string) => {
    try {
      // Server-side verification — do not trust localStorage expiry alone
      const response = await fetch(`${API_BASE_URL}/watches`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // The watches endpoint is public, but we use an authenticated admin
      // endpoint to truly verify. Use inquiries GET which requires auth.
      const authCheck = await fetch(`${API_BASE_URL}/inquiries?limit=1`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!authCheck.ok) {
        // Token is invalid or expired server-side — clean up
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token_expires');
        localStorage.removeItem('admin_username');
        return { success: false, error: 'Session expired' };
      }

      const username = localStorage.getItem('admin_username');
      return {
        success: true,
        user: {
          id: 'admin-001',
          email: username || 'admin',
          name: username || 'Admin',
          role: 'admin' as const,
        },
      };
    } catch (error) {
      return { success: false, error: 'Invalid session' };
    }
  },

  logout: async (_token: string) => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expires');
    localStorage.removeItem('admin_username');
    return { success: true };
  },
};
