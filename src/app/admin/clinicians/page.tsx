import { prisma } from "@/lib/db";
import { reviewClinicianApplication } from "@/app/actions/clinician";
import { EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "審核中", cls: "badge badge-warning" },
  APPROVED: { label: "已核准", cls: "badge badge-success" },
  REJECTED: { label: "已駁回", cls: "badge badge-danger" },
};

export default async function AdminCliniciansPage() {
  const apps = await prisma.clinicianApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      userId: true,
      title: true,
      specialty: true,
      proofPath: true,
      statement: true,
      status: true,
      reviewNote: true,
      createdAt: true,
      user: { select: { nickname: true, email: true } },
    },
  });
  const pending = apps.filter((a) => a.status === "PENDING");
  const others = apps.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="section-title">
          待審臨床申請
          <span className="text-xs font-normal text-subtle">{pending.length} 件</span>
        </h2>

        {pending.length === 0 ? (
          <EmptyState title="沒有待審申請" description="目前沒有等待處理的臨床身分驗證。" />
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
              <li key={a.id} className="card card-pad space-y-3">
                <div className="min-w-0">
                  <div className="font-medium name-clip">{a.user.nickname}</div>
                  <div className="text-xs text-subtle break-all">{a.user.email}</div>
                </div>

                <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-xs text-subtle">職稱</dt>
                    <dd className="name-clip">{a.title}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-subtle">專長</dt>
                    <dd className="name-clip">{a.specialty}</dd>
                  </div>
                </dl>

                <div className="text-sm">
                  <div className="text-xs text-subtle mb-1">說明</div>
                  <p className="leading-relaxed name-clip rounded-lg bg-surface-2 border border-line p-3">
                    {a.statement}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {a.proofPath ? (
                    <Link
                      href={`/admin/proof/${a.userId}`}
                      target="_blank"
                      className="btn btn-secondary btn-sm"
                    >
                      查看證明檔
                    </Link>
                  ) : (
                    <span className="badge">無證明檔</span>
                  )}
                  <span className="text-xs text-subtle">{formatDateTime(a.createdAt)}</span>
                </div>

                <form
                  action={reviewClinicianApplication as unknown as string}
                  className="flex flex-wrap gap-2 border-t border-line pt-3"
                >
                  <input type="hidden" name="id" value={a.id} />
                  <input
                    name="reviewNote"
                    placeholder="審核備註（可空）"
                    aria-label="審核備註"
                    className="input flex-1 min-w-[12rem]"
                  />
                  <button name="status" value="APPROVED" type="submit" className="btn btn-primary">
                    核准
                  </button>
                  <button name="status" value="REJECTED" type="submit" className="btn btn-secondary">
                    駁回
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {others.length > 0 && (
        <section className="space-y-2">
          <h2 className="section-title">已處理</h2>
          <ul className="space-y-2">
            {others.map((a) => {
              const s = STATUS[a.status] ?? { label: a.status, cls: "badge" };
              return (
                <li
                  key={a.id}
                  className="card p-3 flex flex-wrap items-center gap-2 text-sm"
                >
                  <span className={s.cls}>{s.label}</span>
                  <span className="font-medium name-clip-1">{a.user.nickname}</span>
                  {a.reviewNote && (
                    <span className="text-muted text-xs name-clip">・{a.reviewNote}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
