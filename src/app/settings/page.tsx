import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const memberLabel: Record<string, string> = { PATIENT: "病友", FAMILY: "家屬", CLINICIAN: "臨床者" };
  const statusLabel: Record<string, string> = { NONE: "未申請", PENDING: "審核中", VERIFIED: "已驗證", REJECTED: "未通過" };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">帳號設定</h1>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-500">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-500">暱稱</span>
          <span>{user.nickname}（不可改）</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-500">身分</span>
          <span>{memberLabel[user.memberType] ?? user.memberType}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-500">臨床狀態</span>
          <span>{statusLabel[user.clinicianStatus] ?? user.clinicianStatus}</span>
        </div>
        <div className="flex justify-between border-b py-2">
          <span className="text-gray-500">角色</span>
          <span>{user.role}</span>
        </div>
      </div>
    </div>
  );
}
