import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "註冊" };

export default function RegisterPage() {
  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">建立帳號</h1>
          <p className="text-sm text-muted">加入互助坊，開始分享或只是安靜地讀。</p>
        </header>

        <form action={registerUser as unknown as string} className="space-y-4">
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
              minLength={8}
              className="input"
              placeholder="至少 8 個字元"
            />
            <p className="hint">至少 8 個字元。</p>
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
