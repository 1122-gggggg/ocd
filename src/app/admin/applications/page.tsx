import Link from "next/link";
import { prisma } from "@/lib/db";
import { reviewBoardApplication } from "@/app/actions/boards";
import { EmptyState, GROUP_LABELS, Pagination } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "審核中", cls: "badge badge-warning" },
  APPROVED: { label: "已核准", cls: "badge badge-success" },
  REJECTED: { label: "已駁回", cls: "badge badge-danger" },
};
const APP_STATUS = ["PENDING", "APPROVED", "REJECTED"] as const;
type AppStatusFilter = (typeof APP_STATUS)[number];

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

function parseStatus(value: string | string[] | undefined): AppStatusFilter | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return (APP_STATUS as readonly string[]).includes(raw ?? "")
    ? (raw as AppStatusFilter)
    : null;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp?.page);
  const status = parseStatus(sp?.status);
  const where = status ? { status } : {};
  // 預設待審優先，其次依建立時間倒序；指定狀態時直接依建立時間倒序。
  const orderBy = status
    ? [{ createdAt: "desc" as const }]
    : [{ status: "asc" as const }, { createdAt: "desc" as const }];

  const [total, apps] = await Promise.all([
    prisma.boardApplication.count({ where }),
    prisma.boardApplication.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        group: true,
        description: true,
        rationale: true,
        status: true,
        reviewNote: true,
        createdAt: true,
        proposer: { select: { nickname: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const qs = (p: number, s: AppStatusFilter | null) =>
    `/admin/applications?page=${p}${s ? `&status=${s}` : ""}`;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="section-title">
          開版申請
          <span className="text-xs font-normal text-subtle">{total} 件</span>
        </h2>

        <div className="flex flex-wrap gap-2" role="navigation" aria-label="狀態篩選">
          <Link
            href={qs(1, null)}
            className={!status ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            aria-current={!status ? "page" : undefined}
          >
            全部
          </Link>
          {APP_STATUS.map((s) => (
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

        {apps.length === 0 ? (
          <EmptyState title="沒有申請" description="此篩選條件下沒有開版申請。" />
        ) : (
          <ul className="space-y-3">
            {apps.map((a) => {
              const s = STATUS[a.status] ?? { label: a.status, cls: "badge" };
              if (a.status !== "PENDING") {
                return (
                  <li key={a.id} className="card p-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className={s.cls}>{s.label}</span>
                    <span className="font-medium name-clip-1">{a.name}</span>
                    <code className="mono text-xs text-subtle">/{a.slug}</code>
                    {a.reviewNote && (
                      <span className="text-muted text-xs name-clip">・{a.reviewNote}</span>
                    )}
                  </li>
                );
              }
              return (
                <li key={a.id} className="card card-pad space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium name-clip">{a.name}</span>
                    <code className="mono text-xs text-subtle">/{a.slug}</code>
                    <span className="badge badge-accent">
                      {GROUP_LABELS[a.group] ?? a.group}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="text-xs text-subtle mb-1">描述</div>
                      <p className="leading-relaxed name-clip rounded-lg bg-surface-2 border border-line p-3">
                        {a.description}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-subtle mb-1">申請理由</div>
                      <p className="leading-relaxed name-clip rounded-lg bg-surface-2 border border-line p-3">
                        {a.rationale}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-subtle name-clip">
                    申請人：{a.proposer.nickname}・{formatDateTime(a.createdAt)}
                  </p>

                  <form
                    action={reviewBoardApplication as unknown as string}
                    className="flex flex-wrap gap-2 border-t border-line pt-3"
                  >
                    <input type="hidden" name="id" value={a.id} />
                    <input
                      name="reviewNote"
                      placeholder="審核備註（可空）"
                      aria-label="審核備註"
                      className="input flex-1 min-w-[12rem]"
                    />
                    <button name="status" value="APPROVED" type="submit" className="btn btn-primary">
                      核准
                    </button>
                    <button name="status" value="REJECTED" type="submit" className="btn btn-secondary">
                      駁回
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hrefFor={(n) => qs(n, status)}
          summary={`${total} 件`}
        />
      </section>
    </div>
  );
}
