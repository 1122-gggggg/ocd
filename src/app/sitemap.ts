import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { entries as learnSymptomsA } from "@/data/learn/symptoms-a";
import { entries as learnSymptomsB } from "@/data/learn/symptoms-b";
import { entries as learnSymptomsC } from "@/data/learn/symptoms-c";
import { entries as learnTreatmentsA } from "@/data/learn/treatments-a";
import { entries as learnTreatmentsB } from "@/data/learn/treatments-b";

export const revalidate = 3600;

function siteUrl(): string {
  const raw = process.env.AUTH_URL;
  return raw && raw.trim() !== "" ? raw : "https://ocd.goodman.tw";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/disclaimer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/learn`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/learn/clinics`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  for (const entry of [
    ...learnSymptomsA,
    ...learnSymptomsB,
    ...learnSymptomsC,
    ...learnTreatmentsA,
    ...learnTreatmentsB,
  ]) {
    entries.push({
      url: `${base}/learn/${entry.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  // DB 不可用時退回首頁＋免責聲明，確保 /sitemap.xml 仍可回應（建置期亦不中斷）。
  try {
    const boards = await prisma.board.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, createdAt: true },
      orderBy: { slug: "asc" },
    });
    for (const board of boards) {
      entries.push({
        url: `${base}/b/${board.slug}`,
        lastModified: board.createdAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    const posts = await prisma.post.findMany({
      where: { deletedAt: null, board: { status: "ACTIVE" } },
      select: {
        id: true,
        updatedAt: true,
        board: { select: { slug: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    for (const post of posts) {
      entries.push({
        url: `${base}/b/${post.board.slug}/p/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  } catch (err) {
    logger.warn("[sitemap] DB 不可用，僅回傳靜態項目", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return entries;
}
