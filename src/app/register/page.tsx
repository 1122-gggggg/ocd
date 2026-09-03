import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PASSWORD_MIN } from "@/lib/password-policy";

export const metadata: Metadata = { title: "註冊" };

/**
 * registerUser redirects on success and returns an error object otherwise.
 * Passing it straight to <form action> threw that object away, so a rejected
 * registration re-rendered an unchanged form and looked like nothing happened.
 * Round-tripping the code through the query string keeps the page a server
 * component while still telling the person what went wrong.
 */
const ERRORS: Record<string, string> = {
  RATE_LIMITED: "註冊過於頻繁，請稍後再試。",
  EMAIL_TAKEN: "這個 Email 已經註冊過了。忘記密碼可以用「忘記密碼」重設。",
  INVALID_INPUT: "請檢查填寫的內容。",
  WEAK_PASSWORD: `密碼不符合規則：至少 ${PASSWORD_MIN} 字，且不能包含你的 Email 或暱稱。`,
  UNKNOWN: "註冊失敗，請稍後再試。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; msg?: string }>;
}) {
  const params = await searchParams;

  async function registerAction(formData: FormData) {
    "use server";
    const result = await registerUser(formData);
    if (result && !result.ok) {
      const code = result.code ?? "UNKNOWN";
      const msg = result.message ? `&msg=${encodeURIComponent(result.message)}` : "";
      redirect(`/register?err=${encodeURIComponent(code)}${msg}`);
    }
  }

  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">建立帳號</h1>
          <p className="text-sm text-muted">加入互助坊，開始分享或只是安靜地讀。</p>
        </header>

        {params.err && (
          <p className="alert alert-error">
            {ERRORS[params.err] ?? params.msg ?? ERRORS.UNKNOWN}
          </p>
        )}

        <form action={registerAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="reg-email">
              Email
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="reg-password">
              密碼
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={PASSWORD_MIN}
              className="input"
              placeholder={`至少 ${PASSWORD_MIN} 個字元`}
            />
            <p className="hint">
              至少 {PASSWORD_MIN} 個字元，且不能包含你的 Email 或暱稱。
            </p>
          </div>

          <div>
            <label className="label" htmlFor="reg-nickname">
              暱稱
            </label>
            <input
              id="reg-nickname"
              name="nickname"
              required
              className="input"
              placeholder="想被怎麼稱呼都可以"
            />
            <p className="hint">
              沒有任何限制：長度、符號、emoji、空白都可以，也可以和別人重複。日後隨時能在設定裡改。
            </p>
          </div>

          <div>
            <label className="label" htmlFor="reg-member">
              身分
            </label>
            <select id="reg-member" name="memberType" className="select" defaultValue="PATIENT">
              <option value="PATIENT">病友</option>
              <option value="FAMILY">家屬</option>
              <option value="CLINICIAN">臨床工作者</option>
            </select>
            <p className="hint">
              臨床工作者需另行驗證，註冊後請至「臨床身分驗證」提交證明。
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            註冊並登入
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted">
        已經有帳號了？{" "}
        <Link href="/login" className="text-accent underline underline-offset-2">
          登入
        </Link>
      </p>
    </div>
  );
}
