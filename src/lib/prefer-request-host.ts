/**
 * Canonical-host helpers for Auth.js on Vercel.
 *
 * Pure reads only — this module MUST NEVER mutate process.env
 * (no `const env = process.env` alias, no `env.X =` writes, no
 * `delete env.X`). Next statically inlines `process.env.*` at build
 * time, so a write through an alias is compiled back to a literal and
 * fails deterministically (webpack: Assigning to rvalue; the same
 * pattern breaks Turbopack production builds on Vercel too).
 * Stale-AUTH_URL handling lives in next.config (vercelAuthDefines
 * inlines empty AUTH_URL/NEXTAUTH_URL + trustHost on Vercel) instead.
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
  // No canonical origin configured (Vercel build inlines AUTH_URL="" via
  // next.config vercelAuthDefines): nothing to verify against, so allow —
  // otherwise custom domains would be killed. trustHost stays true in
  // authConfig; Host poisoning is still rejected whenever a canonical is set.
  if (canonical === null) return true;
  if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
  if (h === canonical) return true;
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && h === (vercelUrl.trim().split(":")[0] ?? "").toLowerCase()) {
    return true;
  }
  if (h.endsWith(".vercel.app")) return true;
  return false;
}

/**
 * Pure host normalizer: first entry of a comma list, lowercased, port
 * stripped (::1 loopback preserved). Read-only and inline-safe — kept
 * as a shared helper so callers parse Host headers identically.
 */
export function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const first = (host.split(",")[0] ?? "").trim().toLowerCase();
  // IPv6 loopback has colons — return before the :port strip below.
  if (first === "::1" || first === "[::1]" || first.startsWith("[::1]:")) return "::1";
  const h = (first.split(":")[0] ?? "");
  return h || null;
}
