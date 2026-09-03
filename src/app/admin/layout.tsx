import { AdminNav } from "@/components/AdminNav";
import { prisma } from "@/lib/db";

// Queue counts must reflect the moment the page is opened, not build time.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Counts live in the layout so every admin page shows the same badges — the
  // moderation queue should be visible from wherever an admin happens to be.
  const [openReports, pendingBoards, pendingClinicians] = await Promise.all([
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.boardApplication.count({ where: { status: "PENDING" } }),
    prisma.clinicianApplication.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">管理後台</h1>
        <AdminNav
          badges={{
            "/admin/reports": openReports,
            "/admin/applications": pendingBoards,
            "/admin/clinicians": pendingClinicians,
          }}
        />
      </div>
      {children}
    </div>
  );
}
