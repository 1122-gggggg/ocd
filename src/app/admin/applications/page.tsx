import { prisma } from "@/lib/db";
import { reviewBoardApplication } from "@/app/actions/boards";
import { EmptyState, GROUP_LABELS } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "審核中", cls: "badge badge-warning" },
  APPROVED: { label: "已核准", cls: "badge badge-success" },
  REJECTED: { label: "已駁回", cls: "badge badge-danger" },
};

export default async function AdminApplicationsPage() {
  const apps = await prisma.boardApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
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
  });
  const pending = apps.filter((a) => a.status === "PENDING");
  const others = apps.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="section-title">
          待審開版申請
          <span className="text-xs font-normal text-subtle">{pending.length} 件</span>
        </h2>

        {pending.length === 0 ? (
          <EmptyState title="沒有待審申請" description="目前沒有等待處理的開版申請。" />
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
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
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 && (
        <section className="space-y-2">
          <h2 className="section-title">已處理</h2>
          <ul className="space-y-2">
            {others.map((a) => {
              const s = STATUS[a.status] ?? { label: a.status, cls: "badge" };
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
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
