import { headers } from "next/headers";

/**
 * Absolute base URL for links that leave the app (email bodies, webhooks).
 *
 * Order matters. `AUTH_URL` is deliberately *not* consulted: prefer-request-host
 * blanks it on Vercel because the dashboard value has been stuck on stale
 * unique-deploy hostnames, and an email link that 404s is worse than none.
 *
 * 1. PUBLIC_SITE_URL — explicit operator override, always wins.
 * 2. The live request's forwarded host — correct on Vercel and behind proxies.
 * 3. VERCEL_PROJECT_PRODUCTION_URL — the stable production alias.
 * 4. http://localhost:3000 — development fallback.
 */
export const CONFIGURED_SITE_URL = normalize(process.env.PUBLIC_SITE_URL);

function normalize(raw: string | undefined): string | null {
  if (!raw) return null;
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

/** Synchronous best guess — safe in contexts without a request (cron, scripts). */
export function siteUrlFromEnv(): string {
  return (
    CONFIGURED_SITE_URL ??
    normalize(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalize(process.env.VERCEL_URL) ??
    "http://localhost:3000"
  );
}

/** Preferred form inside a request: uses the real Host the visitor typed. */
export async function siteUrl(): Promise<string> {
  if (CONFIGURED_SITE_URL) return CONFIGURED_SITE_URL;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto") ??
        (host.startsWith("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      const origin = normalize(`${proto}://${host}`);
      if (origin) return origin;
    }
  } catch {
    // headers() is unavailable outside a request scope; fall through.
  }
  return siteUrlFromEnv();
}

/** Join a path onto the resolved site origin. */
export async function absoluteUrl(path: string): Promise<string> {
  const base = await siteUrl();
  return new URL(path, base).toString();
}
