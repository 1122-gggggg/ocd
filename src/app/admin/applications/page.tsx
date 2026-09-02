import { prisma } from "@/lib/db";
import { reviewBoardApplication } from "@/app/actions/boards";

export default async function AdminApplicationsPage() {
  const apps = await prisma.boardApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { proposer: true },
  });
  const pending = apps.filter((a) => a.status === "PENDING");
  const others = apps.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">開版申請</h1>
      {pending.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 text-center text-gray-500">目前沒有待審申請。</div>
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border border-[#E5E0D5] p-4 space-y-2">
              <div className="font-medium">
                {a.name} <span className="text-xs text-gray-500">/{a.slug}・{a.group}</span>
              </div>
              <div className="text-sm text-gray-600">描述：{a.description}</div>
              <div className="text-sm text-gray-600">理由：{a.rationale}</div>
              <div className="text-xs text-gray-400">
                申請人：{a.proposer.nickname}・{new Date(a.createdAt).toLocaleString("zh-TW")}
              </div>
              <form action={reviewBoardApplication as any} className="flex gap-2 items-end">
                <input type="hidden" name="id" value={a.id} />
                <input name="reviewNote" placeholder="備註（可空）" className="flex-1 border rounded px-2 py-1 text-sm" />
                <button name="status" value="APPROVED" type="submit" className="px-3 py-1 rounded bg-[#2F6F6A] text-white text-sm">
                  核准
                </button>
                <button name="status" value="REJECTED" type="submit" className="px-3 py-1 rounded border text-sm hover:bg-gray-50">
                  駁回
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-medium text-sm text-gray-600">已處理</h2>
          {others.map((a) => (
            <div key={a.id} className="bg-gray-50 rounded border p-3 text-sm">
              {a.name} /{a.slug} — {a.status} {a.reviewNote ? `・${a.reviewNote}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
