import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of buckets) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) buckets.delete(key);
  }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check rate limit for a request. Returns null if allowed,
 * or a 429 NextResponse if the limit is exceeded.
 */
export function rateLimit(
  request: NextRequest,
  { maxRequests, windowMs }: RateLimitOptions
): NextResponse | null {
  cleanup(windowMs);

  const ip = getClientIp(request);
  // Include pathname so each route has its own bucket
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();

  const entry = buckets.get(key) || { timestamps: [] };
  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil(
      (entry.timestamps[0] + windowMs - now) / 1000
    );
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);
  return null;
}
