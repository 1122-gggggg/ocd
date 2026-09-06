import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COMMON_TOPICS } from "@/lib/preference-topics";

export const metadata: Metadata = { title: "你的第一條路" };

// 該症狀對應的學習資源 slug（既有 slug；無對應則回 /learn）。
const LEARN_SLUG_MAP: Record<string, string> = {
  contamination: "contamination",
  health: "health-anxiety",
  false_memory: "checking",
};

// 該症狀對應的版區 slug（無對應則回 checking 版）。
const BOARD_SLUG_MAP: Record<string, string> = {
  contamination: "contamination",
  harm: "harm",
  rocd: "rocd",
  scrupulosity: "scrupulosity",
  sexual: "sexual-intrusions",
  health: "pure-o",
  existential: "pure-o",
  false_memory: "checking",
};

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const session = (await auth()) as unknown as {
    user?: { id: string };
  } | null;
  if (!session?.user?.id) redirect("/login");

  const { t } = await searchParams;
  const topic = COMMON_TOPICS.find((entry) => entry.id === t);

  const learnSlug = t ? LEARN_SLUG_MAP[t] : undefined;
  const learnHref = learnSlug ? `/learn/${learnSlug}` : "/learn";
  const boardSlug = (t && BOARD_SLUG_MAP[t]) || "checking";
  const boardHref = `/b/${boardSlug}?sort=solved`;

  return (
    <div className="container-narrow space-y-5">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">你的第一條路</h1>
        <p className="text-sm text-muted">
          {topic
            ? `最近卡住你的是「${topic.label}」。別擔心，和你一樣的人在這裡。`
            : "別擔心，和你一樣的人在這裡。"}
        </p>
      </header>

      <ol className="space-y-4">
        <li className="card card-pad space-y-2">
          <p className="text-xs text-muted">第一站 · 讀懂它</p>
          <h2 className="text-lg font-semibold">先認識這個困擾</h2>
          <p className="text-sm text-muted">
            慢慢來，先看看這是怎麼一回事。你不是一個人，也不是你的錯。
          </p>
          <Link href={learnHref} className="btn btn-secondary">
            去看看學習資源
          </Link>
        </li>

        <li className="card card-pad space-y-2">
          <p className="text-xs text-muted">第二站 · 看看走過來的人</p>
          <h2 className="text-lg font-semibold">聽聽和你一樣的人</h2>
          <p className="text-sm text-muted">
            這些是走過類似路的人留下的故事，先看看那些慢慢好起來的人。
          </p>
          <Link href={boardHref} className="btn btn-secondary">
            去看看大家的故事
          </Link>
        </li>

        <li className="card card-pad space-y-2">
          <p className="text-xs text-muted">第三站 · 今晚就能做的事</p>
          <h2 className="text-lg font-semibold">今晚，先照顧自己一點點</h2>
          <p className="text-sm text-muted">
            不用一次做好。挑一件小事開始，或者找個人說說話。
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/recovery" className="btn btn-primary">
              今晚的小練習
            </Link>
            <Link href="/chat" className="btn btn-secondary">
              找個人說說話
            </Link>
          </div>
        </li>
      </ol>
    </div>
  );
}
