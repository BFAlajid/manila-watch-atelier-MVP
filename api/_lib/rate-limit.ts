// In-memory sliding window rate limiter
// Note: resets on cold starts (acceptable for serverless MVP)

const windows = new Map<string, number[]>();

export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = windows.get(key) || [];

  // Remove expired entries
  const valid = timestamps.filter(t => now - t < windowMs);

  if (valid.length >= maxRequests) {
    windows.set(key, valid);
    return true;
  }

  valid.push(now);
  windows.set(key, valid);
  return false;
}
