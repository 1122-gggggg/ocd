import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { updateNickname } from "@/app/actions/auth";
import { changePassword } from "@/app/actions/password";
import { deleteMyAccount, resendVerificationEmail } from "@/app/actions/account";
import { NICKNAME_MAX } from "@/lib/nickname";
import { formatDate, initialOf } from "@/lib/format";
import { PASSWORD_MIN } from "@/lib/password-policy";
import { mailerConfigured } from "@/lib/mailer";
import { emailVerificationEnforced } from "@/lib/email-verification";
import { DELETE_CONFIRM_PHRASE } from "@/lib/account";

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

const OK_MESSAGES: Record<string, string> = {
  nickname: "暱稱已更新。",
  verify_sent: "驗證信已寄出，請查看信箱（含垃圾郵件匣）。",
  verify_already: "這個 Email 已經驗證過了。",
};

const ERR_MESSAGES: Record<string, string> = {
  empty: "暱稱不能是空白。",
  long: `暱稱超過 ${NICKNAME_MAX} 字的儲存上限。`,
  verify_rate: "驗證信寄送過於頻繁，請稍後再試。",
  verify_noemail: "這個帳號沒有設定 Email，無法驗證。",
  verify_nomail: "本站尚未設定郵件服務，暫時無法寄送驗證信。",
  verify_failed: "驗證信寄送失敗，請稍後再試或聯絡站務。",
  pw_current: "目前的密碼不正確。",
  pw_mismatch: "兩次輸入的新密碼不一致。",
  pw_weak: `新密碼不符合規則：至少 ${PASSWORD_MIN} 字，且不能包含你的 Email 或暱稱。`,
  pw_oauth: "這個帳號是用 Google 登入的，沒有密碼可以變更。",
  pw_rate: "變更密碼過於頻繁，請稍後再試。",
  del_phrase: `請正確輸入「${DELETE_CONFIRM_PHRASE}」以確認刪除。`,
  del_password: "密碼不正確，帳號未刪除。",
  del_rate: "操作過於頻繁，請稍後再試。",
  del_last_admin: "你是唯一的管理員，請先指定另一位管理員再刪除帳號。",
  del_system: "系統帳號無法刪除。",
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

  const [postCount, replyCount] = await Promise.all([
    prisma.post.count({ where: { authorId: user.id } }),
    prisma.reply.count({ where: { authorId: user.id } }),
  ]);

  const hasPassword = !!user.passwordHash;
  const emailVerified = !!user.emailVerified;

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

      {params.ok && OK_MESSAGES[params.ok] && (
        <p className="alert alert-success">{OK_MESSAGES[params.ok]}</p>
      )}
      {params.err && ERR_MESSAGES[params.err] && (
        <p className="alert alert-error">{ERR_MESSAGES[params.err]}</p>
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
        <p className="hint">
          提醒：因為暱稱不唯一，任何人都可以取和你或站務一樣的名字。請以發文內容判斷，
          不要只憑名字相信任何人。
        </p>
      </section>

      {/* Email verification */}
      <section id="email" className="card card-pad space-y-4 scroll-mt-24">
        <div className="space-y-1">
          <h2 className="section-title">Email 驗證</h2>
          <p className="text-sm text-muted">
            驗證過的 Email 才能在忘記密碼時自己把帳號找回來。
          </p>
        </div>

        {!user.email ? (
          <p className="alert alert-info">
            這個帳號沒有 Email（使用 Google 登入或由站務建立）。忘記登入方式時請聯絡站務。
          </p>
        ) : emailVerified ? (
          <p className="alert alert-success">
            <span className="mono">{user.email}</span> 已於 {formatDate(user.emailVerified!)} 驗證。
          </p>
        ) : (
          <>
            <p className="alert alert-error">
              <span className="mono">{user.email}</span> 尚未驗證。
              {emailVerificationEnforced
                ? "驗證完成前無法發文或回覆。"
                : "建議現在就完成，否則忘記密碼時無法自助重設。"}
            </p>
            {mailerConfigured ? (
              <form action={resendVerificationEmail}>
                <button type="submit" className="btn btn-primary">
                  寄送驗證信
                </button>
              </form>
            ) : (
              <p className="hint">本站尚未設定郵件服務，暫時無法寄送驗證信。</p>
            )}
          </>
        )}
      </section>

      {/* Password */}
      <section id="password" className="card card-pad space-y-4 scroll-mt-24">
        <div className="space-y-1">
          <h2 className="section-title">密碼</h2>
          <p className="text-sm text-muted">
            變更密碼後，其他裝置上的登入狀態都會失效，這個瀏覽器也會需要重新登入。
          </p>
        </div>

        {!hasPassword ? (
          <p className="alert alert-info">
            這個帳號使用 Google 登入，沒有獨立密碼。
          </p>
        ) : (
          <form action={changePassword} className="space-y-3">
            <div>
              <label className="label" htmlFor="cur-pw">
                目前的密碼
              </label>
              <input
                id="cur-pw"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="new-pw">
                新密碼
              </label>
              <input
                id="new-pw"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN}
                required
                className="input"
              />
              <p className="hint">至少 {PASSWORD_MIN} 字，不能包含你的 Email 或暱稱。</p>
            </div>
            <div>
              <label className="label" htmlFor="confirm-pw">
                再輸入一次新密碼
              </label>
              <input
                id="confirm-pw"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN}
                required
                className="input"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              變更密碼
            </button>
          </form>
        )}
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
          <Row label="發文 / 回覆" value={`${postCount} 篇 / ${replyCount} 則`} />
        </dl>
      </section>

      {/* Data export */}
      <section className="card card-pad space-y-3">
        <div className="space-y-1">
          <h2 className="section-title">下載我的資料</h2>
          <p className="text-sm text-muted">
            匯出本站持有的你的全部個人資料（帳號、發文、回覆、舉報、各項申請）為一個 JSON 檔。
          </p>
        </div>
        <a href="/api/me/export" className="btn btn-secondary" download>
          下載 JSON
        </a>
        <p className="hint">臨床驗證上傳的證明檔本身不含在內；如需索取請聯絡站務。</p>
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

      {/* Danger zone */}
      <section
        id="danger"
        className="card card-pad space-y-4 scroll-mt-24"
        style={{ borderColor: "var(--danger, #c0392b)" }}
      >
        <div className="space-y-1">
          <h2 className="section-title">刪除帳號</h2>
          <p className="text-sm text-muted">
            這個動作無法復原。刪除後，你的 Email、密碼與所有申請紀錄都會從資料庫移除。
            建議先下載一份自己的資料。
          </p>
        </div>

        <form action={deleteMyAccount} className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="label">你的 {postCount} 篇發文與 {replyCount} 則回覆要怎麼處理？</legend>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                value="PURGE"
                defaultChecked
                className="checkbox mt-0.5"
              />
              <span>
                <strong>一併刪除</strong>
                <span className="block text-muted">
                  發文與回覆會從站上消失。別人回覆過的討論串會出現空缺。
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" name="mode" value="ANONYMIZE" className="checkbox mt-0.5" />
              <span>
                <strong>保留內容，但完全匿名</strong>
                <span className="block text-muted">
                  發文與回覆改掛「已刪除的使用者」並強制匿名，不再連結到你。討論串的脈絡會保留給還在的人。
                </span>
              </span>
            </label>
          </fieldset>

          {hasPassword && (
            <div>
              <label className="label" htmlFor="del-pw">
                目前的密碼
              </label>
              <input
                id="del-pw"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="del-confirm">
              請輸入「{DELETE_CONFIRM_PHRASE}」以確認
            </label>
            <input
              id="del-confirm"
              name="confirm"
              type="text"
              required
              autoComplete="off"
              className="input"
              placeholder={DELETE_CONFIRM_PHRASE}
            />
          </div>

          <button type="submit" className="btn btn-danger">
            永久刪除我的帳號
          </button>
        </form>
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
