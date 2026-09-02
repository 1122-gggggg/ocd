import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const [pendingBoards, pendingClinicians, openReports, users, posts] = await Promise.all([
    prisma.boardApplication.count({ where: { status: "PENDING" } }),
    prisma.clinicianApplication.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.user.count(),
    prisma.post.count({ where: { deletedAt: null } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="section-title">待處理</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <QueueCard
            href="/admin/applications"
            label="待審開版申請"
            value={pendingBoards}
          />
          <QueueCard
            href="/admin/clinicians"
            label="待審臨床申請"
            value={pendingClinicians}
          />
          <QueueCard href="/admin/reports" label="未處理舉報" value={openReports} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">站況</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-4">
            <div className="text-xs text-subtle">註冊會員</div>
            <div className="text-2xl font-bold tabular-nums">{users}</div>
          </div>
          <div className="card p-4">
            <div className="text-xs text-subtle">公開討論串</div>
            <div className="text-2xl font-bold tabular-nums">{posts}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function QueueCard({ href, label, value }: { href: string; label: string; value: number }) {
  const urgent = value > 0;
  return (
    <Link href={href} className="card card-link p-4 flex items-center justify-between gap-3">
      <div>
        <div className="text-xs text-subtle">{label}</div>
        <div className={`text-2xl font-bold tabular-nums ${urgent ? "text-accent" : ""}`}>
          {value}
        </div>
      </div>
      {urgent && <span className="badge badge-warning">待處理</span>}
    </Link>
  );
}
