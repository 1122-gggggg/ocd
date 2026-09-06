import Link from "next/link";
import { auth } from "@/auth";
import { getVictories } from "@/app/actions/recovery";
import { getCachedHomeBoards } from "@/lib/cache";
import { formatRelative } from "@/lib/format";
import { EmptyState, GROUP_LABELS, GROUP_ORDER } from "@/components/ui";
import { REDDIT_CASES } from "@/data/reddit-cases";

const GROUP_BLURB: Record<string, string> = {
  SYMPTOM: "依症狀樣態分區，找到和你經歷相近的人。",
  TREATMENT: "ERP、CBT、藥物等治療經驗交流。內容不是處方，請與醫師討論。",
  COMMUNITY: "日常、家屬視角與臨床工作者的交流空間。",
};

export default async function HomePage() {
  const [boards, session, victories] = await Promise.all([getCachedHomeBoards(), auth(), getVictories(3)]);
  const signedIn = !!(session as { user?: unknown } | null)?.user;
  const totalPosts = boards.reduce((n, b) => n + b._count.posts, 0);

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <section className="card card-pad relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
          style={{ background: "var(--accent-soft)", opacity: 0.75 }}
        />
        <div className="relative space-y-4 max-w-2xl">
          <span className="badge badge-accent">OCD-aware Peer Support Platform</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            一個可以慢慢說的地方
          </h1>
          <p className="text-muted leading-relaxed">
            這裡是強迫症病友、家屬與臨床工作者互相支持、分享經驗的空間。
            我們陪伴彼此面對不確定性，不提供「不會怎樣啦」等短暫保證。
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {signedIn ? (
              <Link href="/settings" className="btn btn-primary btn-lg">
                我的帳號設定
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary btn-lg">
                  加入互助坊
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">
                  登入
                </Link>
              </>
            )}
            <Link href="/disclaimer" className="btn btn-ghost btn-lg">
              閱讀免責聲明
            </Link>
          </div>
          <p className="hint">
            本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。
          </p>
        </div>
      </section>

      {/* 1. Priority: Support — 「你現在需要什麼？」 */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-fg flex items-center gap-2">
            <span>🧭 你現在需要什麼？</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
              支持 ≠ 保證
            </span>
          </h2>
          <p className="text-xs text-muted">
            我們不回答「我這樣到底有沒有事」，但我們會在這裡陪伴你面對不確定性。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Entrance 1: 我想被理解 */}
          <div className="card card-pad border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h3 className="font-bold text-fg">1. 我想被理解</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                純抒發心情，不尋求解答。在這裡所有的脆弱與侵入性恐懼都會被溫柔傾聽與接納，不被批判或給予廉價保證。
              </p>
            </div>
            <Link href="/chat" className="btn btn-secondary btn-sm w-full">
              進入互助陪伴大廳
            </Link>
          </div>

          {/* Entrance 2: 我現在卡住了 */}
          <div className="card card-pad border-accent/30 bg-accent-soft/30 hover:border-accent/60 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <h3 className="font-bold text-fg">2. 我現在卡住了</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                大腦正逼你尋找 100% 確定的答案？進入陪伴大廳進行 2 分鐘「衝動衝浪練習」，讓焦慮浪潮自然消退。
              </p>
            </div>
            <Link href="/chat" className="btn btn-primary btn-sm w-full">
              開始衝動衝浪練習
            </Link>
          </div>

          {/* Entrance 3: 我正在復原 */}
          <div className="card card-pad border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <h3 className="font-bold text-fg">3. 我正在復原</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                記錄今天的非強迫日記、設定復原目標，把時間與生活從強迫警報中一點一滴奪回來。
              </p>
            </div>
            <Link href="/recovery" className="btn btn-secondary btn-sm w-full">
              記錄今日復原微步
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Priority: Community — 社群討論版區 */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-fg flex items-center gap-2">
            <span>👥 互助社群版區 (Community)</span>
          </h2>
          <p className="text-xs text-muted">
            依症狀樣態與治療經驗分區交流。你可以具名，也可以匿名分享。
          </p>
        </div>

        <div className="space-y-6">
          {GROUP_ORDER.map((g) => {
            const list = boards.filter((b) => b.group === g);
            if (list.length === 0) return null;
            return (
              <div key={g} className="space-y-3">
                <div className="space-y-0.5 border-b border-line pb-1.5">
                  <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                    <span>{GROUP_LABELS[g]}</span>
                    <span className="text-xs font-normal text-subtle">{list.length} 個版區</span>
                  </h3>
                  <p className="text-xs text-muted">{GROUP_BLURB[g]}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {list.map((b) => {
                    const last = b.posts[0];
                    return (
                      <Link
                        key={b.slug}
                        href={`/b/${b.slug}`}
                        className="card card-link p-3.5 space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-sm text-fg group-hover:text-accent transition-colors">
                            {b.name}
                          </span>
                          <span className="badge shrink-0 text-xs">{b._count.posts} 篇</span>
                        </div>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">
                          {b.description}
                        </p>
                        <div className="text-[0.7rem] text-subtle border-t border-line mt-1.5 pt-1.5 truncate">
                          {last
                            ? `最新：${last.title}・${formatRelative(last.createdAt)}`
                            : "尚無討論，登入後可發第一篇。"}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Priority: Recovery — 今日抵抗強迫勝利牆 */}
      <section id="victory-wall" className="card card-pad bg-surface-2/40 border border-line space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-fg flex items-center gap-2">
              <span>🛡️ 今日抵抗強迫勝利牆 (Victory Wall)</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              每一次忍住沒有去確認、沒有洗第 4 次手、沒有 Google 症狀，都是大腦神經迴路的一次重生。
            </p>
          </div>
          <Link href="/recovery" className="btn btn-secondary btn-xs shrink-0">
            前往復原專區分享我的勝利
          </Link>
        </div>

        {victories.length === 0 ? (
          <EmptyState
            title="成為第一個分享勝利的人"
            description="尚無勝利分享，記錄你今天抵抗強迫的小勝利，鼓勵正在努力的病友。"
            action={
              <Link href="/recovery" className="btn btn-secondary btn-sm">
                前往復原專區分享
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {victories.map((v) => (
              <div
                key={v.id}
                className="card p-3 bg-surface border border-line space-y-1"
              >
                <div className="flex items-center justify-between text-muted">
                  <span className="font-medium text-fg">{v.user.nickname}</span>
                  <span>{formatRelative(v.createdAt)}</span>
                </div>
                <p className="text-fg leading-relaxed line-clamp-4">
                  {v.content.length > 120 ? `${v.content.slice(0, 120)}……` : v.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Priority: Learn — 學習資源與 Reddit 康復實錄 */}
      <section id="learn" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-fg flex items-center gap-2">
              <span>📚 學習資源：走過風暴的具體解方 (Learn & Guides)</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              海外 r/OCD 與 r/OCDRecovery 社群實踐 ERP、RF-ERP 與 ACT 成功的真實個案經驗整理。
            </p>
          </div>
          <Link href="/learn" className="text-xs text-accent hover:underline">
            查看更多強迫症百科 →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REDDIT_CASES.slice(0, 4).map((c) => (
            <Link
              key={c.boardSlug}
              href={`/b/${c.boardSlug}`}
              className="card p-3.5 hover:border-accent/60 transition-colors group flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-surface-3 text-accent font-medium">
                    {c.boardSlug}
                  </span>
                  <span className="text-xs text-muted truncate max-w-[200px]">
                    具體解決步驟・ERP階梯
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-fg group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>
              </div>
              <div className="text-xs text-muted flex items-center justify-between pt-1 border-t border-line/50">
                <span>前往該版區閱讀全文</span>
                <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="開放版區" value={boards.length} />
        <Stat label="累積討論" value={totalPosts} />
        <Stat
          label="安心專線"
          value="1925"
          hint="24 小時免費"
          className="col-span-2 sm:col-span-1"
        />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`card p-4 ${className}`}>
      <div className="text-xs text-subtle">{label}</div>
      <div className="text-2xl font-bold tabular-nums mt-0.5">{value}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}
