import Link from "next/link";
import { auth } from "@/auth";
import { getCachedHomeBoards } from "@/lib/cache";
import { formatRelative } from "@/lib/format";
import { GROUP_LABELS, GROUP_ORDER } from "@/components/ui";
import { REDDIT_CASES } from "@/data/reddit-cases";

const GROUP_BLURB: Record<string, string> = {
  SYMPTOM: "依症狀樣態分區，找到和你經歷相近的人。",
  TREATMENT: "ERP、CBT、藥物等治療經驗交流。內容不是處方，請與醫師討論。",
  COMMUNITY: "日常、家屬視角與臨床工作者的交流空間。",
};

// 首頁版區列表經 getCachedHomeBoards 快取 30s（tag: boards-home，見 src/lib/cache.ts）；
// 最新文章僅取 createdAt + title，且 _count 已排除軟刪除（deletedAt: null）。
export default async function HomePage() {
  const [boards, session] = await Promise.all([getCachedHomeBoards(), auth()]);
  const signedIn = !!(session as { user?: unknown } | null)?.user;

  const totalPosts = boards.reduce((n, b) => n + b._count.posts, 0);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="card card-pad relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
          style={{ background: "var(--accent-soft)", opacity: 0.75 }}
        />
        <div className="relative space-y-4 max-w-2xl">
          <span className="badge badge-accent">病友・家屬・臨床工作者</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            一個可以慢慢說的地方
          </h1>
          <p className="text-muted leading-relaxed">
            這裡是強迫症病友、家屬與臨床工作者互相支持、分享經驗的空間。
            你可以具名，也可以匿名；請友善交流，尊重每一種不同的經驗。
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {signedIn ? (
              <Link href="/settings" className="btn btn-primary btn-lg">
                我的帳號
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

      {/* Three Core Guided Entrances: "你現在需要什麼？" */}
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
          {/* Entrance 1: 我現在卡住了 */}
          <div className="card card-pad border-accent/30 bg-accent-soft/30 hover:border-accent/60 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                <h3 className="font-bold text-fg">我現在卡住了</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                大腦正逼你尋找 100% 確定的答案？進入陪伴大廳進行 2 分鐘「衝動衝浪練習」，讓焦慮浪潮自然消退。
              </p>
            </div>
            <Link href="/chat" className="btn btn-primary btn-sm w-full">
              進入互助陪伴大廳
            </Link>
          </div>

          {/* Entrance 2: 我想被理解 */}
          <div className="card card-pad border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="font-bold text-fg">我想被理解</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                「我也曾經因為這個荒謬念頭困住好幾年。」閱讀 8 大強迫症主題的 Reddit 康復實錄與 ERP 步驟。
              </p>
            </div>
            <a href="#reddit-cases" className="btn btn-secondary btn-sm w-full">
              閱讀 Reddit 康復案例
            </a>
          </div>

          {/* Entrance 3: 抵抗強迫勝利牆 */}
          <div className="card card-pad border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-bold text-fg">今日抵抗勝利牆</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                不比誰的症狀更嚴重，而是看「今天誰多拿回了一點生活」。看大家今天成功忍住了什麼強迫行為。
              </p>
            </div>
            <a href="#victory-wall" className="btn btn-secondary btn-sm w-full">
              看今日抵抗成果
            </a>
          </div>
        </div>
      </section>

      {/* Reddit Recovery Cases Showcase */}
      <section id="reddit-cases" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-fg flex items-center gap-2">
              <span>🌟 Reddit 經典康復實錄：走過風暴的具體解方</span>
            </h2>
            <p className="text-xs text-muted mt-0.5">
              海外 r/OCD 與 r/OCDRecovery 社群實踐 ERP、RF-ERP 與 ACT 成功的真實個案經驗整理。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REDDIT_CASES.map((c) => (
            <Link
              key={c.boardSlug}
              href={`/b/${c.boardSlug}`}
              className="card p-4 hover:border-accent/60 transition-colors group flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
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
                <span>點擊前往該版區閱讀全文</span>
                <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Victory Wall (今日抵抗強迫勝利牆) */}
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
          <Link href="/chat" className="btn btn-secondary btn-xs shrink-0">
            到陪伴大廳分享我的勝利
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="card p-3 bg-surface border border-line space-y-1">
            <div className="flex items-center justify-between text-muted">
              <span className="font-medium text-fg">匿名病友</span>
              <span>今天</span>
            </div>
            <p className="text-fg leading-relaxed">
              「出門後腦袋瘋狂大叫門沒鎖，我深呼吸了 2 分鐘，握著拳頭走去搭捷運，<strong>沒有回頭看第 2 次</strong>！」
            </p>
            <span className="inline-block text-[0.7rem] text-accent bg-accent-soft px-1.5 py-0.5 rounded">
              #檢查型強迫
            </span>
          </div>

          <div className="card p-3 bg-surface border border-line space-y-1">
            <div className="flex items-center justify-between text-muted">
              <span className="font-medium text-fg">小安</span>
              <span>今天</span>
            </div>
            <p className="text-fg leading-relaxed">
              「胸口微悶又想拿出 Apple Watch 查心跳，我把手錶放進抽屜，<strong>忍了 30 分鐘後焦慮自然退下去了</strong>。」
            </p>
            <span className="inline-block text-[0.7rem] text-accent bg-accent-soft px-1.5 py-0.5 rounded">
              #健康焦慮
            </span>
          </div>

          <div className="card p-3 bg-surface border border-line space-y-1">
            <div className="flex items-center justify-between text-muted">
              <span className="font-medium text-fg">阿偉</span>
              <span>昨天</span>
            </div>
            <p className="text-fg leading-relaxed">
              「大腦跳出可怕的傷害念頭，我沒有躲進房間，我對自己說『隨便啦』，<strong>繼續陪家人把這部電影看完</strong>。」
            </p>
            <span className="inline-block text-[0.7rem] text-accent bg-accent-soft px-1.5 py-0.5 rounded">
              #傷害型強迫
            </span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="開放版區" value={boards.length} />
        <Stat label="累積討論" value={totalPosts} />
        <Stat
          label="安心專線"
          value="1925"
          hint="24 小時"
          className="col-span-2 sm:col-span-1"
        />
      </section>

      {/* Boards by group */}
      {GROUP_ORDER.map((g) => {
        const list = boards.filter((b) => b.group === g);
        if (list.length === 0) return null;
        return (
          <section key={g} className="space-y-4">
            <div className="space-y-1">
              <h2 className="section-title">
                {GROUP_LABELS[g]}
                <span className="text-xs font-normal text-subtle">{list.length} 個版區</span>
              </h2>
              <p className="text-sm text-muted">{GROUP_BLURB[g]}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((b) => {
                const last = b.posts[0];
                return (
                  <Link
                    key={b.slug}
                    href={`/b/${b.slug}`}
                    className="card card-link p-4 space-y-2 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-fg group-hover:text-accent transition-colors">
                        {b.name}
                      </span>
                      <span className="badge shrink-0">{b._count.posts} 篇</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed line-clamp-2">
                      {b.description}
                    </p>
                    <div className="text-xs text-subtle border-t border-line mt-2 pt-2 truncate">
                      {last
                        ? `最新：${last.title}・${formatRelative(last.createdAt)}`
                        : "尚無討論，登入後可發第一篇。"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {boards.length === 0 && (
        <div className="card card-pad text-center text-muted">
          目前沒有開放中的版區。
        </div>
      )}
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
