import Link from "next/link";
import type { Metadata } from "next";
import { updateOfficialMd } from "@/app/actions/boards";
import { EmptyState, PageHeader } from "@/components/ui";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "編輯官方說明" };

const ERR_MESSAGE: Record<string, string> = {
  TOO_LONG: "官方說明超過 20000 字的上限，請刪減後再試一次。",
  NOT_FOUND: "找不到這個版區。",
  FORBIDDEN: "權限不足，只有管理員可以編輯官方說明。",
};

export default async function AdminBoardEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const board = await prisma.board.findUnique({
    where: { slug },
    select: { slug: true, name: true, officialMd: true },
  });

  if (!board) {
    return (
      <div className="space-y-4">
        <PageHeader title="編輯官方說明" eyebrow="版區管理" />
        <EmptyState
          title="找不到版區"
          description={`沒有 slug 為「${slug}」的版區。`}
          action={
            <Link href="/admin/boards" className="btn btn-secondary">
              返回版區管理
            </Link>
          }
        />
      </div>
    );
  }

  const errMessage = query.err
    ? (ERR_MESSAGE[query.err] ?? "儲存失敗，請再試一次。")
    : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={board.name}
        description="編輯此版區的官方說明（Markdown），儲存後會同步更新版區頁。"
        eyebrow={`版區管理 / ${board.slug}`}
        actions={
          <Link href="/admin/boards" className="btn btn-secondary">
            返回版區管理
          </Link>
        }
      />

      {query.ok && (
        <p role="status" className="alert alert-success">
          已儲存官方說明。
        </p>
      )}
      {errMessage && (
        <p role="alert" className="alert alert-error">
          {errMessage}
        </p>
      )}

      <form action={async (fd: FormData) => { "use server"; await updateOfficialMd(fd); }} className="card card-pad space-y-4">
        <input type="hidden" name="slug" value={board.slug} />
        <div>
          <label className="label" htmlFor="officialMd">
            官方說明（Markdown）
          </label>
          <textarea
            id="officialMd"
            name="officialMd"
            rows={20}
            maxLength={20000}
            defaultValue={board.officialMd}
            className="textarea mono"
            placeholder="在此編輯官方說明（≤20000 字）"
          />
          <p className="hint">支援 Markdown，最多 20000 字。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            儲存官方說明
          </button>
          <Link href={`/b/${board.slug}`} className="btn btn-secondary">
            查看版區
          </Link>
        </div>
      </form>
    </div>
  );
}
