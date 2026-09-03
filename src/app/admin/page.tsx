import Link from "next/link";
import { prisma } from "@/lib/db";
import { checkEnvConfig } from "@/lib/config-check";
import { checkAdminPassword } from "@/lib/admin-password-check";
import { TOMBSTONE_USER_ID } from "@/lib/account";

// The config audit reads live env and hashes a password; never prerender it.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    pendingBoards,
    pendingClinicians,
    openReports,
    unnotifiedReports,
    users,
    posts,
    adminPassword,
  ] = await Promise.all([
    prisma.boardApplication.count({ where: { status: "PENDING" } }),
    prisma.clinicianApplication.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.report.count({ where: { status: "OPEN", notifiedAt: null } }),
    prisma.user.count({ where: { isSystem: false, id: { not: TOMBSTONE_USER_ID } } }),
    prisma.post.count({ where: { deletedAt: null } }),
    checkAdminPassword(),
  ]);

  const issues = checkEnvConfig();

  return (
    <div className="space-y-6">
      {/* Deployment health — first, because a half-configured site looks fine
          from every other page. */}
      {(issues.length > 0 || adminPassword.status === "weak") && (
        <section className="space-y-3">
          <h2 className="section-title">部署設定檢查</h2>
          <div className="space-y-2">
            {adminPassword.status === "weak" && (
              <IssueRow
                severity="error"
                title="管理員密碼仍是預設值"
                message="站務帳號的密碼和 docker-compose／部署文件裡寫死的其中一組相同，任何看過原始碼的人都能登入後台。"
                fix="立刻執行 `npm run admin:password` 換一組新密碼，或登入後到「帳號設定 → 密碼」變更。"
              />
            )}
            {issues.map((issue) => (
              <IssueRow
                key={issue.key}
                severity={issue.severity}
                title={issue.key}
                message={issue.message}
                fix={issue.fix}
              />
            ))}
          </div>
        </section>
      )}

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
        {unnotifiedReports > 0 && (
          <p className="hint">
            其中 {unnotifiedReports} 件尚未成功送出通知（可能是郵件或 webhook 暫時失效）。
            夜間排程會再試一次。
          </p>
        )}
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

function IssueRow({
  severity,
  title,
  message,
  fix,
}: {
  severity: "error" | "warn";
  title: string;
  message: string;
  fix: string;
}) {
  return (
    <div className={severity === "error" ? "alert alert-error" : "alert alert-info"}>
      <div className="space-y-1 min-w-0">
        <div className="font-medium">
          <span className="mono">{title}</span>
        </div>
        <p>{message}</p>
        <p className="text-xs opacity-80">處理方式：{fix}</p>
      </div>
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
