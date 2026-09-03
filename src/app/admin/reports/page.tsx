import Link from "next/link";
import { prisma } from "@/lib/db";
import { moderateContent, resolveReport } from "@/app/actions/reports";
import { EmptyState, Pagination } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

const TARGET_LABEL: Record<string, string> = { POST: "文章", REPLY: "回覆" };
const STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "未處理", cls: "badge badge-warning" },
  RESOLVED: { label: "已結案", cls: "badge badge-success" },
  DISMISSED: { label: "已駁回", cls: "badge" },
};
const REPORT_STATUS = ["OPEN", "RESOLVED", "DISMISSED"] as const;
type ReportStatusFilter = (typeof REPORT_STATUS)[number];

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseStatus(value: string | string[] | undefined): ReportStatusFilter | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return (REPORT_STATUS as readonly string[]).includes(raw ?? "")
    ? (raw as ReportStatusFilter)
    : null;
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const status = parseStatus(sp?.status);
  const where = status ? { status } : {};
  // 預設未處理優先，其次依建立時間倒序；指定狀態時直接依建立時間倒序。
  const orderBy = status
    ? [{ createdAt: "desc" as const }]
    : [{ status: "asc" as const }, { createdAt: "desc" as const }];

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reason: true,
        status: true,
        createdAt: true,
        reporter: { select: { nickname: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const qs = (p: number, s: ReportStatusFilter | null) =>
    `/admin/reports?page=${p}${s ? `&status=${s}` : ""}`;

  return (
    <div className="space-y-4">
      <h2 className="section-title">舉報管理</h2>

      <div className="flex flex-wrap gap-2" role="navigation" aria-label="狀態篩選">
        <Link
          href={qs(1, null)}
          className={!status ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
          aria-current={!status ? "page" : undefined}
        >
          全部
        </Link>
        {REPORT_STATUS.map((s) => (
          <Link
            key={s}
            href={qs(1, s)}
            className={status === s ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            aria-current={status === s ? "page" : undefined}
          >
            {STATUS[s]?.label ?? s}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <EmptyState title="沒有舉報" description="此篩選條件下沒有舉報。" />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const s = STATUS[r.status] ?? { label: r.status, cls: "badge" };
            return (
              <li key={r.id} className="card card-pad space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-accent">
                    {TARGET_LABEL[r.targetType] ?? r.targetType}
                  </span>
                  <span className={s.cls}>{s.label}</span>
                  <code className="mono text-xs text-subtle break-all">{r.targetId}</code>
                </div>

                <p className="text-sm leading-relaxed name-clip">
                  <span className="text-muted">理由：</span>
                  {r.reason}
                </p>

                <p className="text-xs text-subtle name-clip">
                  舉報人：{r.reporter.nickname}・{formatDateTime(r.createdAt)}
                </p>

                <div className="flex flex-wrap gap-2 border-t border-line pt-3">
                  <form action={moderateContent as unknown as string} className="flex gap-2">
                    <input type="hidden" name="targetType" value={r.targetType} />
                    <input type="hidden" name="targetId" value={r.targetId} />
                    <input type="hidden" name="action" value="DELETE" />
                    <button type="submit" className="btn btn-danger btn-sm">
                      刪除內容
                    </button>
                  </form>
                  <form action={moderateContent as unknown as string} className="flex gap-2">
                    <input type="hidden" name="targetType" value={r.targetType} />
                    <input type="hidden" name="targetId" value={r.targetId} />
                    <input type="hidden" name="action" value="RESTORE" />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      恢復內容
                    </button>
                  </form>
                  <form action={resolveReport as unknown as string} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="RESOLVED" />
                    <button type="submit" className="btn btn-primary btn-sm">
                      結案
                    </button>
                  </form>
                  <form action={resolveReport as unknown as string} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value="DISMISSED" />
                    <button type="submit" className="btn btn-secondary btn-sm">
                      駁回舉報
                    </button>
                  </form>
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
        summary={`${total} 件舉報`}
      />
    </div>
  );
}
