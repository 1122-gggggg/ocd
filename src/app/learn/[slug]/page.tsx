import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import type {
  EvidenceLevel,
  LearnEntry,
  ResourceKind,
} from "@/data/learn/types";
import { entries as symptomsA } from "@/data/learn/symptoms-a";
import { LEARN_EVIDENCE } from "@/data/learn-evidence";
import { entries as symptomsB } from "@/data/learn/symptoms-b";
import { entries as symptomsC } from "@/data/learn/symptoms-c";
import { entries as treatmentsA } from "@/data/learn/treatments-a";
import { entries as treatmentsB } from "@/data/learn/treatments-b";
import { entries as treatmentsC } from "@/data/learn/treatments-c";
import { PATHWAY } from "@/data/pathways";

const allEntries: LearnEntry[] = [
  ...symptomsA,
  ...symptomsB,
  ...symptomsC,
  ...treatmentsA,
  ...treatmentsB,
  ...treatmentsC,
];

export function generateStaticParams(): { slug: string }[] {
  return allEntries.map((e) => ({ slug: e.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = allEntries.find((e) => e.slug === slug);
  if (!entry) return { title: "找不到學習資源" };
  return {
    title: entry.condition,
    description: entry.overview.slice(0, 120),
  };
}

const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  strong: "實證充足",
  moderate: "中等",
  emerging: "新興",
};

const EVIDENCE_BADGE: Record<EvidenceLevel, string> = {
  strong: "badge badge-success",
  moderate: "badge badge-warning",
  emerging: "badge",
};

const KIND_LABEL: Record<ResourceKind, string> = {
  guideline: "指引",
  org: "機構",
  book: "書籍",
  paper: "論文",
  course: "課程",
  video: "影片",
  tool: "工具",
};

const SOURCE_LABEL: Record<string, string> = {
  reddit: "Reddit",
  zhihu: "知乎",
  other: "其他來源",
};

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = allEntries.find((e) => e.slug === slug);
  if (!entry) notFound();

  const twResources = entry.resources.filter((r) => r.region === "TW");
  const intlResources = entry.resources.filter((r) => r.region === "INTL");
  const pathway = PATHWAY[slug];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "學習資源區", href: "/learn" },
          { label: entry.condition },
        ]}
      />
      <PageHeader
        title={entry.condition}
        description={
          entry.group === "SYMPTOM" ? "症狀認識" : "治療解法"
        }
      />

      <p role="note" className="alert alert-info">
        <span aria-hidden="true">☎</span>
        <span>
          若你或身邊的人有立即危險，請立即撥打{" "}
          <a
            href="tel:1925"
            className="underline underline-offset-2 font-medium"
          >
            安心專線 1925
          </a>
          （24 小時免費），或撥打{" "}
          <a href="tel:119" className="underline underline-offset-2">
            119
          </a>
          。
        </span>
      </p>

      <section aria-labelledby="learn-overview" className="card card-pad space-y-2">
        <h2 id="learn-overview" className="section-title">
          認識
        </h2>
        <p className="text-sm text-fg leading-relaxed">{entry.overview}</p>
      </section>

      <section aria-labelledby="learn-solutions" className="space-y-3">
        <h2 id="learn-solutions" className="section-title">
          對應解法
        </h2>
        <ul className="space-y-3">
          {entry.solutions.map((solution) => (
            <li key={solution.name} className="card card-pad space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-fg">{solution.name}</h3>
                <span className={EVIDENCE_BADGE[solution.evidence]}>
                  {EVIDENCE_LABEL[solution.evidence]}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {solution.summary}
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted leading-relaxed">
                {solution.steps.map((step, i) => (
                  // Steps are author-ordered; position is a stable key.
                  <li key={`${i}-${step.slice(0, 12)}`}>{step}</li>
                ))}
              </ol>
              {solution.linkSlug && (
                <p>
                  <Link
                    href={`/learn/${solution.linkSlug}`}
                    className="text-sm text-accent underline underline-offset-2"
                  >
                    深入了解相關解法 →
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learn-cases" className="space-y-3">
        <h2 id="learn-cases" className="section-title">
          案例
          <span className="text-xs font-normal text-subtle">
            綜合改寫的匿名短例，僅供示意
          </span>
        </h2>
        <ul className="space-y-3">
          {entry.cases.map((c) => (
            <li key={c.title} className="card card-pad space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium text-fg">{c.title}</h3>
                <span className="badge">示意改寫</span>
              </div>
              <div className="space-y-1 text-sm leading-relaxed">
                <p className="text-muted">
                  <span className="font-medium text-fg">病情：</span>
                  {c.condition}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-fg">嘗試過</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted leading-relaxed">
                    {c.tried.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-fg">覺得有用</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted leading-relaxed">
                    {c.worked.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm text-fg leading-relaxed">{c.vignette}</p>
              <p className="text-sm text-muted leading-relaxed">
                <span className="font-medium text-fg">給你的提醒：</span>
                {c.takeaway}
              </p>
              <p className="text-xs text-subtle">
                <a
                  href={c.sourceUrl}
                  target="_blank"
                  rel="noopener"
                  className="underline underline-offset-2 break-all"
                >
                  原文出處（{SOURCE_LABEL[c.source] ?? "其他來源"}）
                </a>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learn-resources" className="space-y-3">
        <h2 id="learn-resources" className="section-title">
          延伸資源
        </h2>
        {[
          { label: "台灣資源", items: twResources },
          { label: "國際資源", items: intlResources },
        ].map((group) => (
          <div key={group.label} className="space-y-2">
            <h3 className="text-sm font-medium text-fg">{group.label}</h3>
            <ul className="space-y-2">
              {group.items.map((r) => (
                <li key={r.url} className="card card-pad space-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener"
                      className="font-medium text-accent underline underline-offset-2 break-all"
                    >
                      {r.title}
                    </a>
                    <span className="badge">{KIND_LABEL[r.kind]}</span>
                  </p>
                  <p className="text-xs text-subtle">
                    {r.org}・{r.blurb}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      {pathway && (
        <section aria-labelledby="learn-pathway" className="space-y-3">
          <h2 id="learn-pathway" className="section-title">
            新手路徑
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            不知道從哪裡開始也沒關係，慢慢來，這裡有三站陪你走。
          </p>
          <ol className="space-y-2">
            <li className="card card-pad space-y-1">
              <p className="text-xs text-subtle">① 讀懂</p>
              <Link
                href={pathway.read.href}
                className="text-sm font-medium text-accent underline underline-offset-2"
              >
                {pathway.read.label} →
              </Link>
            </li>
            <li className="card card-pad space-y-1">
              <p className="text-xs text-subtle">② 看看走過來的人</p>
              <Link
                href={pathway.peers.href}
                className="text-sm font-medium text-accent underline underline-offset-2"
              >
                {pathway.peers.label} →
              </Link>
            </li>
            <li className="card card-pad space-y-1">
              <p className="text-xs text-subtle">③ 今晚就能做</p>
              <Link
                href={pathway.practice.href}
                className="text-sm font-medium text-accent underline underline-offset-2"
              >
                {pathway.practice.label} →
              </Link>
            </li>
          </ol>
        </section>
      )}
      {/* 經嚴格文獻查核驗證之有效解方 */}
      {LEARN_EVIDENCE[slug] && LEARN_EVIDENCE[slug].length > 0 && (
        <section aria-labelledby="learn-evidence-section" className="space-y-4 pt-4 border-t border-line">
          <div>
            <h2 id="learn-evidence-section" className="section-title flex items-center gap-2">
              <span>🔬 經研究驗證有效的方法（實證指引）</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              依大型隨機對照試驗（RCT）、統合分析與國際指引（APA / NICE / IOCDF）整理，附原始研究出處。
            </p>
          </div>

          <div className="space-y-3">
            {LEARN_EVIDENCE[slug].map((method, mIdx) => (
              <div key={mIdx} className="card card-pad space-y-2 border border-line bg-surface">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-fg flex items-center gap-2">
                    <span>{method.name}</span>
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    method.grade === "實證充足"
                      ? "bg-accent-soft text-accent"
                      : method.grade === "中等"
                      ? "bg-surface-3 text-fg"
                      : "bg-surface-2 text-subtle"
                  }`}>
                    {method.grade}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {method.summaryZh}
                </p>
                {method.sources && method.sources.length > 0 && (
                  <div className="pt-1.5 border-t border-line/50 text-[0.72rem] text-subtle space-y-0.5">
                    <span className="font-semibold block text-fg/80">參考文獻與臨床來源：</span>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {method.sources.map((s, sIdx) => (
                        <li key={sIdx}>
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            {s.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={`/b/${entry.boardSlug}`} className="btn btn-primary">
          回討論區聊聊 →
        </Link>
        <Link href="/learn" className="btn btn-secondary">
          回學習資源區
        </Link>
      </div>
    </div>
  );
}
