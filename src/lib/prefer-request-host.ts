/**
 * Canonical-host helpers for Auth.js on Vercel.
 *
 * Dashboard AUTH_URL has been stuck on stale (NXDOMAIN / unique-deploy) URLs,
 * so when a request arrives on a *different* host we drop the stale AUTH_URL
 * and let Auth.js fall back to the request Host. When they agree we keep the
 * canonical AUTH_URL so callbacks/links stay on the canonical origin.
 * Off Vercel (local dev) env is left untouched.
 */

/** Hostname of the canonical origin, from AUTH_URL (or AUTH_URL fallback). */
export function getCanonicalHost(): string | null {
  const raw = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Host allowlist: canonical AUTH_URL hostname, VERCEL_URL hostname,
 * *.vercel.app preview/production suffixes, and loopback for local dev.
 * Rejects Host-poisoned values (arbitrary external domains).
 */
export function isAllowedHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const first = (host.split(",")[0] ?? "").trim().toLowerCase();
  // IPv6 loopback has colons — check before the :port strip below.
  if (first === "::1" || first === "[::1]" || first.startsWith("[::1]:")) return true;
  const h = (first.split(":")[0] ?? "");
  if (!h) return false;
  const canonical = getCanonicalHost();
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  if (canonical && h === canonical) return true;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && h === (vercelUrl.trim().split(":")[0] ?? "").toLowerCase()) {
    return true;
  }
  if (h.endsWith(".vercel.app")) return true;
  return false;
}

function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const first = (host.split(",")[0] ?? "").trim().toLowerCase();
  // IPv6 loopback has colons — return before the :port strip below.
  if (first === "::1" || first === "[::1]" || first.startsWith("[::1]:")) return "::1";
  const h = (first.split(":")[0] ?? "");
  return h || null;
}
/**
 * Drop a stale AUTH_URL only when it disagrees with the request host
 * (and we run on Vercel). Called with no host at import time — a no-op
 * then, since there is no request to compare against. Eviction additionally
 * requires the request host to pass {@link isAllowedHost}, so a poisoned
 * Host header can never evict the canonical origin.
 */
export function preferRequestHost(requestHost?: string | null): void {
  if (process.env.VERCEL !== "1") return;
  if (requestHost === undefined) return;
  try {
    const env = process.env as Record<string, string | undefined>;
    env.AUTH_TRUST_HOST = "true";
    const configured = env.AUTH_URL || env.NEXTAUTH_URL;
    if (!configured) return;
    const reqHost = normalizeHost(requestHost);
    if (!reqHost || !isAllowedHost(reqHost)) return;
    let canonical: string | null = null;
    try {
      canonical = new URL(configured).hostname.toLowerCase();
    } catch {
      return;
    }
    if (canonical && reqHost !== canonical) {
      // Stale AUTH_URL (e.g. previous deploy URL): let Auth.js use request Host.
      delete env.AUTH_URL;
      delete env.NEXTAUTH_URL;
    }
  } catch {
    // Edge process.env may be read-only; trustHost above still applies.
  }
}

preferRequestHost();
