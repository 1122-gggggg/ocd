import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const pendingBoards = await prisma.boardApplication.count({ where: { status: "PENDING" } });
  const pendingClinicians = await prisma.clinicianApplication.count({ where: { status: "PENDING" } });
  const openReports = await prisma.report.count({ where: { status: "OPEN" } });

  return (
    <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">管理員後台</h1>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div className="border rounded p-4">
          <div className="text-gray-500">待審開版申請</div>
          <div className="text-2xl font-bold">{pendingBoards}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-gray-500">待審臨床申請</div>
          <div className="text-2xl font-bold">{pendingClinicians}</div>
        </div>
        <div className="border rounded p-4">
          <div className="text-gray-500">未處理舉報</div>
          <div className="text-2xl font-bold">{openReports}</div>
        </div>
      </div>
    </div>
  );
}
