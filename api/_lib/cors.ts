// Shared CORS helper for Vercel serverless functions

export function setCorsHeaders(res: any): void {
  const allowedOrigin = process.env.APP_URL || 'https://manilawatch.com';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
