import { prisma } from "@/lib/db";
import { moderateContent, resolveReport } from "@/app/actions/reports";
import { EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

const TARGET_LABEL: Record<string, string> = { POST: "文章", REPLY: "回覆" };
const STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "未處理", cls: "badge badge-warning" },
  RESOLVED: { label: "已結案", cls: "badge badge-success" },
  DISMISSED: { label: "已駁回", cls: "badge" },
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      status: true,
      createdAt: true,
      reporter: { select: { nickname: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="section-title">舉報管理</h2>

      {reports.length === 0 ? (
        <EmptyState title="沒有舉報" description="目前沒有任何待處理的舉報。" />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const status = STATUS[r.status] ?? { label: r.status, cls: "badge" };
            return (
              <li key={r.id} className="card card-pad space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-accent">
                    {TARGET_LABEL[r.targetType] ?? r.targetType}
                  </span>
                  <span className={status.cls}>{status.label}</span>
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
                    <button name="action" value="DELETE" type="submit" className="btn btn-danger btn-sm">
                      刪除內容
                    </button>
                    <button name="action" value="RESTORE" type="submit" className="btn btn-secondary btn-sm">
                      恢復內容
                    </button>
                  </form>
                  <form action={resolveReport as unknown as string} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <button name="status" value="RESOLVED" type="submit" className="btn btn-primary btn-sm">
                      結案
                    </button>
                    <button name="status" value="DISMISSED" type="submit" className="btn btn-secondary btn-sm">
                      駁回舉報
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
