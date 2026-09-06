import Link from "next/link";
import { searchPosts } from "@/app/actions/search";
import { Breadcrumbs, EmptyState } from "@/components/ui";
import { formatRelative } from "@/lib/format";

export const metadata = {
  title: "搜尋解方 | 強迫症互助坊",
  description: "搜尋站內 solved 解方與討論串",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp?.q) ? sp.q[0] : sp?.q;
  const q = (raw ?? "").trim();
  const results = q ? await searchPosts(q) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "搜尋解方" },
        ]}
      />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-fg tracking-tight">🔍 搜尋解方</h1>
        <p className="text-sm text-muted">
          從已解決的討論串找方法，例如門鎖檢查、洗手、ERP 練習。
        </p>
      </div>

      <form action="/search" method="get" role="search" className="flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="搜解方…（如：門鎖 ERP）"
          aria-label="搜尋解方"
          className="input flex-1"
        />
        <button type="submit" className="btn btn-primary shrink-0">
          搜尋
        </button>
      </form>

      {!q ? (
        <EmptyState
          title="輸入關鍵字開始搜尋"
          description="試試「門鎖」「洗手」「ERP」等詞，或去發問讓大家幫你。"
          action={
            <Link href="/boards/apply" className="btn btn-secondary btn-sm">
              去發問
            </Link>
          }
        />
      ) : results.length === 0 ? (
        <EmptyState
          title={`找不到「${q}」相關解方`}
          description="換個關鍵字或去發問，讓有經驗的人幫你。"
          action={
            <Link href="/" className="btn btn-secondary btn-sm">
              回首頁逛逛
            </Link>
          }
        />
      ) : (
        <section className="space-y-3">
          <p className="text-sm text-muted">
            找到 {results.length} 篇與「{q}」相關的討論
          </p>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/b/${r.boardSlug}/p/${r.id}`}
                  className="card card-link p-4 group flex items-start gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-medium text-fg group-hover:text-accent transition-colors name-clip">
                      {r.title}
                    </div>
                    <div className="text-xs text-subtle">
                      /b/{r.boardSlug} · {formatRelative(r.createdAt)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
