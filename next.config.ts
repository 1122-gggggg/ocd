import type { NextConfig } from "next";

// TODO Sentry: to enable error monitoring, install @sentry/nextjs and replace
// the no-op wrapper below with the real Sentry wrapper:
//   import { withSentryConfig } from "@sentry/nextjs";
//   export default withSentryConfig(nextConfig, { silent: true });
// See instrumentation.ts for server-side Sentry.init() hook.
// Optional dep: @sentry/nextjs (see package.json optionalDependencies)
function withSentry(config: NextConfig): NextConfig {
  return config;
}

// Edge middleware inlines process.env.AUTH_URL at build time. Dashboard AUTH_URL
// has been stale (ocd.goodman.tw NXDOMAIN / unique deploy URLs). Empty + trustHost
// makes Auth.js use the request Host (production alias, unique URL, future CNAME).
const vercelAuthDefines = process.env.VERCEL === "1"
  ? {
      AUTH_URL: "",
      NEXTAUTH_URL: "",
      AUTH_TRUST_HOST: "true",
    }
  : {};

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  env: vercelAuthDefines,
  experimental: {
    optimizePackageImports: [
      "react-markdown",
      "remark-gfm",
      "rehype-sanitize",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const securityHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.live",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];
    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentry(nextConfig);
