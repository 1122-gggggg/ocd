import Link from "next/link";
import { auth } from "@/auth";
import { getCachedHomeBoards } from "@/lib/cache";
import { formatRelative } from "@/lib/format";
import { GROUP_LABELS, GROUP_ORDER } from "@/components/ui";

const GROUP_BLURB: Record<string, string> = {
  SYMPTOM: "依症狀樣態分區，找到和你經歷相近的人。",
  TREATMENT: "ERP、CBT、藥物等治療經驗交流。內容不是處方，請與醫師討論。",
  COMMUNITY: "日常、家屬視角與臨床工作者的交流空間。",
};

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
