import Link from "next/link";
import { prisma } from "@/lib/db";
import { EmptyState, GROUP_LABELS, Pagination } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

const BOARD_STATUS = ["ACTIVE", "PENDING", "ARCHIVED"] as const;
type BoardStatusFilter = (typeof BOARD_STATUS)[number];

const STATUS_LABEL: Record<BoardStatusFilter, string> = {
  ACTIVE: "啟用中",
  PENDING: "待開版",
  ARCHIVED: "已封存",
};

const STATUS_CLS: Record<BoardStatusFilter, string> = {
  ACTIVE: "badge badge-success",
  PENDING: "badge badge-warning",
  ARCHIVED: "badge",
};

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseStatus(value: string | string[] | undefined): BoardStatusFilter | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return (BOARD_STATUS as readonly string[]).includes(raw ?? "")
    ? (raw as BoardStatusFilter)
    : null;
}

export default async function AdminBoardsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const status = parseStatus(sp?.status);
  const where = status ? { status } : {};

  const [total, boards] = await Promise.all([
    prisma.board.count({ where }),
    prisma.board.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { slug: true, name: true, group: true, status: true, createdAt: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const qs = (p: number, s: BoardStatusFilter | null) =>
    `/admin/boards?page=${p}${s ? `&status=${s}` : ""}`;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="section-title">版區管理</h2>
        <p className="text-sm text-muted">
          官方說明（Markdown）請至各版區頁面查看；此處僅列出基本資料以便管理。
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="navigation" aria-label="狀態篩選">
        <Link
          href={qs(1, null)}
          className={!status ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
          aria-current={!status ? "page" : undefined}
        >
          全部
        </Link>
        {BOARD_STATUS.map((s) => (
          <Link
            key={s}
            href={qs(1, s)}
            className={status === s ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            aria-current={status === s ? "page" : undefined}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {boards.length === 0 ? (
        <EmptyState title="沒有版區" description="此篩選條件下沒有版區。" />
      ) : (
        <ul className="space-y-3">
          {boards.map((b) => {
            const label = STATUS_LABEL[b.status as BoardStatusFilter] ?? b.status;
            const cls = STATUS_CLS[b.status as BoardStatusFilter] ?? "badge";
            return (
              <li key={b.slug} className="card card-pad space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{b.name}</span>
                  <code className="mono text-xs text-subtle">/{b.slug}</code>
                  <span className="badge badge-accent">{GROUP_LABELS[b.group] ?? b.group}</span>
                  <span className={cls}>{label}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-subtle">{formatDateTime(b.createdAt)}</span>
                  <Link href={`/b/${b.slug}`} className="btn btn-secondary btn-sm">
                    查看版區（含官方說明）
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hrefFor={(n) => qs(n, status)}
        summary={`${total} 個版區`}
      />
    </div>
  );
}
