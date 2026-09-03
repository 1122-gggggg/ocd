import type { MetadataRoute } from "next";

function siteUrl(): string {
  const raw = process.env.AUTH_URL;
  return raw && raw.trim() !== "" ? raw : "https://ocd.goodman.tw";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/b/*", "/disclaimer", "/learn/*"],
        disallow: [
          "/admin/",
          "/settings",
          "/login",
          "/register",
          "/onboarding",
          "/clinician/apply",
          "/boards/apply",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
