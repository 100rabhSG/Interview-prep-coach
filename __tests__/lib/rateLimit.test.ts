import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock next/server before importing rateLimit
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
        body,
        status: init?.status ?? 200,
        headers: new Map(Object.entries(init?.headers ?? {})),
      }),
    },
  };
});

// Factory to create a fake NextRequest
function createRequest(ip: string, pathname: string) {
  return {
    headers: new Map([['x-forwarded-for', ip]]) as unknown as Headers & { get: (key: string) => string | null },
    nextUrl: { pathname },
  } as never;
}

// Dynamic import so the mock is applied first
const { rateLimit } = await import('@/lib/rateLimit');

describe('rateLimit()', () => {
  beforeEach(() => {
    // Reset the internal buckets map between tests by advancing time
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests within the limit', () => {
    const request = createRequest('1.1.1.1', '/api/test');
    const opts = { maxRequests: 3, windowMs: 60_000 };

    expect(rateLimit(request, opts)).toBeNull();
    expect(rateLimit(request, opts)).toBeNull();
    expect(rateLimit(request, opts)).toBeNull();
  });

  it('blocks requests exceeding the limit', () => {
    const request = createRequest('2.2.2.2', '/api/test');
    const opts = { maxRequests: 2, windowMs: 60_000 };

    rateLimit(request, opts);
    rateLimit(request, opts);

    const result = rateLimit(request, opts) as { body: { error: string }; status: number };
    expect(result).not.toBeNull();
    expect(result.status).toBe(429);
    expect(result.body.error).toMatch(/too many requests/i);
  });

  it('resets after the time window expires', () => {
    const request = createRequest('3.3.3.3', '/api/test');
    const opts = { maxRequests: 1, windowMs: 10_000 };

    rateLimit(request, opts);

    // Blocked
    const blocked = rateLimit(request, opts);
    expect(blocked).not.toBeNull();

    // Advance past the window
    vi.advanceTimersByTime(10_001);

    // Allowed again
    expect(rateLimit(request, opts)).toBeNull();
  });

  it('tracks different IPs separately', () => {
    const reqA = createRequest('4.4.4.4', '/api/test');
    const reqB = createRequest('5.5.5.5', '/api/test');
    const opts = { maxRequests: 1, windowMs: 60_000 };

    rateLimit(reqA, opts);
    // Different IP should still be allowed
    expect(rateLimit(reqB, opts)).toBeNull();
  });

  it('tracks different endpoints separately', () => {
    const reqA = createRequest('6.6.6.6', '/api/generate');
    const reqB = createRequest('6.6.6.6', '/api/review');
    const opts = { maxRequests: 1, windowMs: 60_000 };

    rateLimit(reqA, opts);
    // Same IP but different endpoint should still be allowed
    expect(rateLimit(reqB, opts)).toBeNull();
  });

  it('includes Retry-After header in 429 response', () => {
    const request = createRequest('7.7.7.7', '/api/test');
    const opts = { maxRequests: 1, windowMs: 60_000 };

    rateLimit(request, opts);
    const result = rateLimit(request, opts) as { headers: Map<string, string> };
    expect(result).not.toBeNull();
    expect(result.headers.get('Retry-After')).toBeDefined();
  });
});
