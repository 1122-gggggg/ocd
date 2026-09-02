import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createClinicianApplication } from "@/app/actions/clinician";
import { redirect } from "next/navigation";

export default async function ClinicianApplyPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/clinician/apply");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  const app = await prisma.clinicianApplication.findUnique({ where: { userId: user.id } });
  const params = await searchParams;

  if (user.memberType !== "CLINICIAN") {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 text-center">
        <p className="text-gray-700">註冊時請選臨床者</p>
        <p className="text-sm text-gray-500 mt-2">請至設定或重新註冊選擇「臨床者」身分後再申請驗證。</p>
      </div>
    );
  }
  if (user.clinicianStatus === "VERIFIED") {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 text-center">
        <p className="font-bold text-green-700">已通過臨床驗證 ✓</p>
        <p className="text-sm text-gray-600 mt-1">您已可在「臨床交流」版發文，徽章「已驗證臨床」將顯示於您的發文。</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">臨床身分驗證申請</h1>
      <p className="text-sm text-gray-600">狀態：{user.clinicianStatus} {app?.status && `（申請：${app.status}）`}</p>
      {params.ok && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">已送出，待審核。</div>}
      {app?.reviewNote && <div className="text-sm bg-gray-50 border rounded p-2">審核備註：{app.reviewNote}</div>}
      <form action={createClinicianApplication as any} className="space-y-3" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium">職稱</label>
          <input name="title" required maxLength={100} defaultValue={app?.title ?? ""} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">專長</label>
          <input name="specialty" required maxLength={100} defaultValue={app?.specialty ?? ""} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">說明（≤2000 字）</label>
          <textarea name="statement" required maxLength={2000} rows={4} defaultValue={app?.statement ?? ""} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">證明檔（jpeg/png/pdf，≤5MB，可空）</label>
          <input type="file" name="proof" accept="image/jpeg,image/png,application/pdf" className="mt-1 w-full text-sm" />
          {app?.proofPath && <p className="text-xs text-gray-500 mt-1">已有檔案：{app.proofPath.split("/").pop()}</p>}
        </div>
        <button type="submit" className="w-full py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
          送出申請
        </button>
      </form>
    </div>
  );
}
