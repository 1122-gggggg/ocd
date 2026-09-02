import { auth } from "@/auth";
import { completeOnboarding } from "@/app/actions/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = (await auth()) as unknown as { user?: { id: string; profileComplete?: boolean } } | null;
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (user.profileComplete) redirect("/");

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">完成個人資料</h1>
      <p className="text-sm text-gray-600">請設定暱稱與身分以開始使用論壇。</p>
      <form action={completeOnboarding as any} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">暱稱（2–24 字，唯一）</label>
          <input
            name="nickname"
            required
            minLength={2}
            maxLength={24}
            defaultValue={user.nickname.startsWith("user-") ? "" : user.nickname}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">身分</label>
          <select name="memberType" defaultValue={user.memberType} className="mt-1 w-full border rounded px-3 py-2">
            <option value="PATIENT">病友</option>
            <option value="FAMILY">家屬</option>
            <option value="CLINICIAN">臨床者</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
          完成
        </button>
      </form>
    </div>
  );
}
