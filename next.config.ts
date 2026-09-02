import type { NextConfig } from "next";

// Edge middleware inlines process.env.AUTH_URL at build time. Dashboard AUTH_URL
// has been stale (ocd.goodman.tw NXDOMAIN / unique deploy URLs). Empty + trustHost
// makes Auth.js use the request Host (production alias, unique URL, future CNAME).
const vercelAuthDefines = process.env.VERCEL
  ? {
      AUTH_URL: "",
      NEXTAUTH_URL: "",
      AUTH_TRUST_HOST: "true",
    }
  : {};

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  env: vercelAuthDefines,
};

export default nextConfig;
