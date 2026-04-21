// Central API base and fetch helpers for frontend consumers.
// In prod Vercel serves /api/* from serverless functions.
// In dev the Express dev-server.js runs on port 3001.
export const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

export async function fetchWatches(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/watches`);
  if (!response.ok) {
    throw new Error(`Failed to fetch watches (${response.status})`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
