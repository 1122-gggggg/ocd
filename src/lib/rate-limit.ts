/**
 * In-memory sliding window rate limiter.
 *
 * Uses a Map<string, number[]> where each key maps to sorted timestamps (ms).
 * On each check, old timestamps outside the window are pruned, then length
 * is compared against the limit. If under limit, current timestamp is pushed.
 *
 * No external dependencies.
 *
 * ## Serverless limitation (documented)
 * This is per-instance best-effort. On Vercel / serverless / edge, each
 * function instance (and each edge region) has its own isolated Map. Limits
 * are NOT globally consistent across instances. For strict distributed
 * enforcement use a shared store (Redis / Upstash / etc.). For abuse
 * mitigation the local window is still effective because a single user
 * typically hits the same warm instance for bursty traffic, and the 429
 * still protects DB from thundering herds.
 *
 * The store is bounded lazily: empty buckets are removed, and a periodic
 * sweep caps total keys to avoid unbounded growth if keys are unbounded
 * (e.g. per-IP). This is intentionally simple; no timers are used so it
 * works in edge / serverless where setInterval is unreliable.
 */

const store = new Map<string, number[]>();

// Sweep when store grows large to evict stale buckets
const MAX_KEYS = 10_000;
let opsSinceSweep = 0;

function sweepIfNeeded(now: number, windowMsMax: number) {
  opsSinceSweep++;
  if (store.size < MAX_KEYS && opsSinceSweep < 1000) return;
  opsSinceSweep = 0;
  const cutoff = now - windowMsMax;
  for (const [k, arr] of store) {
    if (arr.length === 0) {
      store.delete(k);
      continue;
    }
    const last = arr[arr.length - 1]!;
    if (last <= cutoff) {
      store.delete(k);
    }
  }
}

/**
 * Sliding window check.
 * @param key  bucket key (e.g. `createPost:<userId>` or `ip:<ip>`)
 * @param limit max requests allowed within windowMs
 * @param windowMs window size in milliseconds
 * @returns true if allowed (and counted), false if rate-limited
 *
 * Default window for most callers is 60_000 (60s). Caller chooses limit.
 * Example: checkRateLimit(`createPost:${userId}`, 5, 60_000)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const start = now - windowMs;

  let arr = store.get(key);
  if (!arr) {
    arr = [];
    store.set(key, arr);
  }

  // prune timestamps <= start (outside window)
  // timestamps are appended in order, so find first > start
  let idx = 0;
  while (idx < arr.length && arr[idx]! <= start) idx++;
  if (idx > 0) arr.splice(0, idx);

  if (arr.length >= limit) {
    sweepIfNeeded(now, windowMs);
    return false;
  }

  arr.push(now);
  sweepIfNeeded(now, windowMs);
  return true;
}

/**
 * Weight the previous window by how much of it is still inside the trailing
 * window, and add the current one. Exported so the arithmetic can be tested
 * without a database.
 */
export function estimateSlidingWindow(
  previousCount: number,
  currentCount: number,
  elapsedMs: number,
  windowMs: number,
): number {
  const carry = previousCount * ((windowMs - elapsedMs) / windowMs);
  return Math.round(carry + currentCount);
}

/**
 * Detailed check with remaining / reset info. Useful for middleware
 * 429 responses and for testing without re-implementing window logic.
 */
export function checkRateLimitInfo(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const allowed = checkRateLimit(key, limit, windowMs);
  // if checkRateLimit just pushed, remaining is limit - currentCount
  // we need to recompute remaining / reset without double-counting.
  // So we peek the stored array (already updated if allowed, untouched if denied).
  const arr = store.get(key) ?? [];
  const remaining = Math.max(0, limit - arr.length);
  const oldest = arr[0];
  const resetMs =
    arr.length === 0 || oldest === undefined
      ? 0
      : Math.max(0, oldest + windowMs - Date.now());
  return { allowed, remaining, resetMs };
}

// ---------------------------------------------------------------------------
// IP / Request helpers
// ---------------------------------------------------------------------------

/**
 * Extract client IP from Headers. Checks common proxy headers in order:
 * x-forwarded-for (first entry), x-real-ip, cf-connecting-ip,
 * x-vercel-forwarded-for, fallback to "unknown".
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  const cf = headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const vercelFwd = headers.get("x-vercel-forwarded-for");
  if (vercelFwd?.trim()) return vercelFwd.trim();
  const forwarded = headers.get("forwarded");
  if (forwarded) {
    // RFC 7239: Forwarded: for=1.2.3.4;proto=https
    const m = forwarded.match(/for=([^;,]+)/i);
    if (m?.[1]) return m[1].replace(/"/g, "").trim();
  }
  return "unknown";
}

/** Alias for symmetry / discoverability */
export const getClientIpFromHeaders = getClientIp;

/**
 * Rate limit by IP address.
 * @param ip client IP (as returned by getClientIp)
 * @param limit max requests in window
 * @param windowMs window in ms (default 60_000 = 60s)
 * @returns true if allowed, false if rate-limited
 */
export function rateLimitByIp(
  ip: string,
  limit: number,
  windowMs = 60_000
): boolean {
  return checkRateLimit(`ip:${ip}`, limit, windowMs);
}

/**
 * Rate limit by Request / NextRequest (extracts IP from headers).
 * @param req object with `.headers` (Request, NextRequest, or { headers: Headers })
 * @param limit max requests in window
 * @param windowMs window in ms (default 60_000 = 60s)
 * @returns true if allowed, false if rate-limited
 */
export function rateLimitByRequest(
  req: { headers: Headers },
  limit: number,
  windowMs = 60_000
): boolean {
  const ip = getClientIp(req.headers as Headers);
  return rateLimitByIp(ip, limit, windowMs);
}

/** Alias: `rateLimitRequest` for callers expecting that name */
export const rateLimitRequest = rateLimitByRequest;

/**
 * Helper for Next.js server actions / route handlers where `headers()` is available.
 * Usage:
 *   const hdrs = await headers();
 *   if (!rateLimitByIpHeaders(hdrs, 5, 60_000)) return { ok:false, code:"RATE_LIMITED" }
 */
export function rateLimitByIpHeaders(
  headersObj: Headers,
  limit: number,
  windowMs = 60_000
): boolean {
  const ip = getClientIp(headersObj);
  return rateLimitByIp(ip, limit, windowMs);
}

// ---------------------------------------------------------------------------
// Testing / maintenance helpers (not required but useful)
// ---------------------------------------------------------------------------

/** Remove a single bucket (for tests) */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/** Clear all buckets (for tests) */
export function clearRateLimitStore(): void {
  store.clear();
  opsSinceSweep = 0;
}

/** Expose store size for diagnostics (not for production branching) */
export function rateLimitStoreSize(): number {
  return store.size;
}
