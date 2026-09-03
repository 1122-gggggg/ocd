import Link from "next/link";
import type { Metadata } from "next";
import { requestPasswordReset } from "@/app/actions/password";
import { mailerConfigured } from "@/lib/mailer";
import { PASSWORD_RESET_TTL_MINUTES } from "@/lib/password";

export const metadata: Metadata = { title: "忘記密碼" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; err?: string }>;
}) {
  const params = await searchParams;

  // Without a mail transport there is nothing this form could do, so say so
  // plainly instead of accepting an address and silently dropping it.
  if (!mailerConfigured) {
    return (
      <div className="container-narrow space-y-4">
        <div className="card card-pad space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">忘記密碼</h1>
          <p className="alert alert-error">
            本站尚未設定郵件服務，目前無法自動寄送重設連結。請聯絡站務協助處理。
          </p>
          <Link href="/login" className="btn btn-secondary">
            回到登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">忘記密碼</h1>
          <p className="text-sm text-muted">
            輸入註冊時使用的 Email，我們會寄一封重設連結給你。
          </p>
        </header>

        {params.sent === "1" && (
          <div className="alert alert-success space-y-1">
            <p>如果這個 Email 有註冊過，重設連結已經寄出了，請查看信箱（含垃圾郵件匣）。</p>
            <p className="text-xs">連結 {PASSWORD_RESET_TTL_MINUTES} 分鐘內有效，只能使用一次。</p>
          </div>
        )}
        {params.err === "email" && <p className="alert alert-error">請輸入有效的 Email。</p>}
        {params.err === "rate" && (
          <p className="alert alert-error">嘗試次數過多，請稍後再試。</p>
        )}

        <form action={requestPasswordReset} className="space-y-4">
          <div>
            <label className="label" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@example.com"
            />
            <p className="hint">
              為了保護隱私，無論這個 Email 是否註冊過，這裡都會顯示同樣的訊息。
            </p>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            寄送重設連結
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted">
        想起來了？{" "}
        <Link href="/login" className="text-accent underline underline-offset-2">
          回到登入
        </Link>
      </p>
    </div>
  );
}
