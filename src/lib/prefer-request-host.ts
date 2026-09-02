/**
 * On Vercel, drop AUTH_URL so Auth.js uses the request Host.
 * Dashboard AUTH_URL has been stuck on NXDOMAIN / unique-deploy URLs.
 */
export function preferRequestHost(): void {
  if (process.env.VERCEL !== "1") return;
  const env = process.env as Record<string, string | undefined>;
  env.AUTH_URL = "";
  env.NEXTAUTH_URL = "";
  env.AUTH_TRUST_HOST = "true";
}

preferRequestHost();
