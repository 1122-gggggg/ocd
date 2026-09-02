import { prisma } from "@/lib/db";
import { moderateContent, resolveReport } from "@/app/actions/reports";

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, targetType: true, targetId: true, reason: true, status: true, createdAt: true, reporter: { select: { nickname: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">舉報管理</h1>
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 text-center text-gray-500">目前沒有待審申請。</div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-lg border border-[#E5E0D5] p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium">{r.targetType}</span> {r.targetId} — {r.status}
              </div>
              <div className="text-sm text-gray-600">理由：{r.reason}</div>
              <div className="text-xs text-gray-400">
                舉報人：{r.reporter.nickname}・{new Date(r.createdAt).toLocaleString("zh-TW")}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={moderateContent as any} className="flex gap-2">
                  <input type="hidden" name="targetType" value={r.targetType} />
                  <input type="hidden" name="targetId" value={r.targetId} />
                  <button name="action" value="DELETE" type="submit" className="text-xs px-3 py-1 rounded bg-red-600 text-white">
                    刪文
                  </button>
                  <button name="action" value="RESTORE" type="submit" className="text-xs px-3 py-1 rounded border">
                    恢復
                  </button>
                </form>
                <form action={resolveReport as any} className="flex gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <button name="status" value="RESOLVED" type="submit" className="text-xs px-3 py-1 rounded bg-[#2F6F6A] text-white">
                    結案 RESOLVED
                  </button>
                  <button name="status" value="DISMISSED" type="submit" className="text-xs px-3 py-1 rounded border">
                    駁回 DISMISSED
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
