import { prisma } from "@/lib/db";
import { reviewClinicianApplication } from "@/app/actions/clinician";
import Link from "next/link";

export default async function AdminCliniciansPage() {
  const apps = await prisma.clinicianApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, userId: true, title: true, specialty: true, proofPath: true, statement: true, status: true, reviewNote: true, createdAt: true, user: { select: { nickname: true, email: true } } },
  });
  const pending = apps.filter((a) => a.status === "PENDING");
  const others = apps.filter((a) => a.status !== "PENDING");
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">臨床申請</h1>
      {pending.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 text-center text-gray-500">目前沒有待審申請。</div>
      ) : (
        <div className="space-y-3">
          {pending.map((a) => (
            <div key={a.id} className="bg-white rounded-lg border border-[#E5E0D5] p-4 space-y-2">
              <div className="font-medium">
                {a.user.nickname} <span className="text-xs text-gray-500">{a.user.email}</span>
              </div>
              <div className="text-sm">職稱：{a.title}｜專長：{a.specialty}</div>
              <div className="text-sm text-gray-600">說明：{a.statement}</div>
              {a.proofPath ? (
                <div className="text-sm">
                  證明檔：{" "}
                  <Link href={`/admin/proof/${a.userId}`} target="_blank" className="underline text-[#2F6F6A]">
                    查看檔案
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-gray-500">無證明檔</div>
              )}
              <form action={reviewClinicianApplication as any} className="flex gap-2 items-end">
                <input type="hidden" name="id" value={a.id} />
                <input name="reviewNote" placeholder="備註" className="flex-1 border rounded px-2 py-1 text-sm" />
                <button name="status" value="APPROVED" type="submit" className="px-3 py-1 rounded bg-[#2F6F6A] text-white text-sm">
                  核准
                </button>
                <button name="status" value="REJECTED" type="submit" className="px-3 py-1 rounded border text-sm">
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
              {a.user.nickname} — {a.status} {a.reviewNote ? `・${a.reviewNote}` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
