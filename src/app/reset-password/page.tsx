import Link from "next/link";
import type { Metadata } from "next";
import { submitPasswordReset } from "@/app/actions/password";
import { peekResetToken } from "@/lib/password";
import { PASSWORD_MIN } from "@/lib/password-policy";

export const metadata: Metadata = {
  title: "重設密碼",
  // A reset link must never end up in a search index or a referrer header.
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  mismatch: "兩次輸入的密碼不一致。",
  weak: `密碼不符合規則：至少 ${PASSWORD_MIN} 字，且不能包含你的 Email 或暱稱。`,
  invalid: "連結無效，可能已被更新的連結取代。",
  expired: "連結已過期，請重新申請。",
  used: "這個連結已經使用過了。",
  rate: "嘗試次數過多，請稍後再試。",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; err?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const live = await peekResetToken(token);

  if (!live) {
    return (
      <div className="container-narrow space-y-4">
        <div className="card card-pad space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">連結無法使用</h1>
          <p className="alert alert-error">
            這個重設連結無效、已過期，或已經使用過了。請重新申請一次。
          </p>
          <Link href="/forgot-password" className="btn btn-primary">
            重新申請重設連結
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">設定新密碼</h1>
          <p className="text-sm text-muted">
            設定完成後，其他裝置上已登入的工作階段都會被登出。
          </p>
        </header>

        {params.err && ERRORS[params.err] && (
          <p className="alert alert-error">{ERRORS[params.err]}</p>
        )}

        <form action={submitPasswordReset} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="label" htmlFor="reset-password">
              新密碼
            </label>
            <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              required
              className="input"
            />
            <p className="hint">至少 {PASSWORD_MIN} 字，不能包含你的 Email 或暱稱。</p>
          </div>
          <div>
            <label className="label" htmlFor="reset-confirm">
              再輸入一次
            </label>
            <input
              id="reset-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              required
              className="input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            設定新密碼
          </button>
        </form>
      </div>
    </div>
  );
}
