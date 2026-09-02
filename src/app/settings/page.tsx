import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { updateNickname } from "@/app/actions/auth";
import { NICKNAME_MAX } from "@/lib/nickname";
import { formatDate, initialOf } from "@/lib/format";

export const metadata: Metadata = { title: "帳號設定" };

const memberLabel: Record<string, string> = {
  PATIENT: "病友",
  FAMILY: "家屬",
  CLINICIAN: "臨床工作者",
};

const statusLabel: Record<string, string> = {
  NONE: "未申請",
  PENDING: "審核中",
  VERIFIED: "已驗證",
  REJECTED: "未通過",
};

const statusBadge: Record<string, string> = {
  NONE: "badge",
  PENDING: "badge badge-warning",
  VERIFIED: "badge badge-success",
  REJECTED: "badge badge-danger",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/settings");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  const params = await searchParams;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <span className="avatar" style={{ width: "3rem", height: "3rem", fontSize: "1.25rem" }}>
          {initialOf(user.nickname)}
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight name-clip">{user.nickname}</h1>
          <p className="text-sm text-muted">
            {memberLabel[user.memberType] ?? user.memberType}・加入於 {formatDate(user.createdAt)}
          </p>
        </div>
      </header>

      {params.ok === "nickname" && <p className="alert alert-success">暱稱已更新。</p>}
      {params.err === "empty" && <p className="alert alert-error">暱稱不能是空白。</p>}
      {params.err === "long" && (
        <p className="alert alert-error">暱稱超過 {NICKNAME_MAX} 字的儲存上限。</p>
      )}

      {/* Nickname — freely editable */}
      <section className="card card-pad space-y-4">
        <div className="space-y-1">
          <h2 className="section-title">暱稱</h2>
          <p className="text-sm text-muted">
            你想怎麼被稱呼都可以。沒有長度、字元或唯一性限制 —— 中文、英文、符號、emoji、空白，
            甚至和別人一模一樣都行。
          </p>
        </div>
        <form action={updateNickname} className="flex flex-wrap gap-2">
          <input
            name="nickname"
            defaultValue={user.nickname}
            required
            aria-label="暱稱"
            className="input flex-1 min-w-[14rem]"
            placeholder="想被怎麼稱呼都可以"
          />
          <button type="submit" className="btn btn-primary">
            儲存
          </button>
        </form>
        <p className="hint">
          改名後，你過去的所有發文與回覆都會一起顯示新名字。頁首的名稱最多約一分鐘後同步。
        </p>
      </section>

      {/* Account facts */}
      <section className="card card-pad space-y-4">
        <h2 className="section-title">帳號資訊</h2>
        <dl className="text-sm">
          <Row label="Email" value={user.email ?? "（未設定）"} />
          <Row label="身分" value={memberLabel[user.memberType] ?? user.memberType} />
          <Row
            label="臨床驗證"
            value={
              <span className={statusBadge[user.clinicianStatus] ?? "badge"}>
                {statusLabel[user.clinicianStatus] ?? user.clinicianStatus}
              </span>
            }
          />
          <Row
            label="角色"
            value={
              user.role === "ADMIN" ? (
                <span className="badge badge-accent">管理員</span>
              ) : (
                <span className="badge">一般會員</span>
              )
            }
          />
        </dl>
      </section>

      <section className="card card-pad space-y-3">
        <h2 className="section-title">其他</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/clinician/apply" className="btn btn-secondary">
            臨床身分驗證
          </Link>
          <Link href="/boards/apply" className="btn btn-secondary">
            申請開版
          </Link>
          <Link href="/disclaimer" className="btn btn-ghost">
            免責聲明
          </Link>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-right name-clip min-w-0">{value}</dd>
    </div>
  );
}
