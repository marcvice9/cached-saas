const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory rate limiter. Resets daily.
 * Returns { success, remaining } or throws nothing — caller decides.
 */
export function checkRateLimit(
  key: string,
  limit: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    // Start new window (24h)
    rateLimitMap.set(key, { count: 1, resetAt: now + 86_400_000 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
