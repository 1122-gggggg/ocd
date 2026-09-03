import { registerUser } from "@/app/actions/auth";
import { PasswordInput } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "註冊" };

const ERROR_MESSAGE: Record<string, string> = {
  invalid: "輸入有誤，請檢查 Email 與密碼（至少 8 個字元）後再試一次。",
  taken: "這個 Email 已經註冊過了，請直接登入。",
  rate: "嘗試太頻繁了，請稍後再試一次。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const params = await searchParams;
  const errMessage = params.err
    ? (ERROR_MESSAGE[params.err] ?? "註冊失敗，請再試一次。")
    : null;
  const emailInvalid = params.err === "taken" || params.err === "invalid";
  const passwordInvalid = params.err === "invalid";
  const nicknameInvalid = params.err === "invalid";
  const passwordDescribedBy = ["reg-password-hint", passwordInvalid ? "reg-error" : null]
    .filter(Boolean)
    .join(" ");
  const nicknameDescribedBy = ["reg-nickname-hint", nicknameInvalid ? "reg-error" : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">建立帳號</h1>
          <p className="text-sm text-muted">加入互助坊，開始分享或只是安靜地讀。</p>
        </header>

        {errMessage && (
          <p id="reg-error" role="alert" className="alert alert-error">
            {errMessage}
          </p>
        )}

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
              placeholder="例如：you@example.com"
              aria-invalid={emailInvalid || undefined}
              aria-describedby={emailInvalid ? "reg-error" : undefined}
            />
          </div>

          <div>
            <label className="label" htmlFor="reg-password">
              密碼
            </label>
            <PasswordInput
              id="reg-password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="至少 8 個字元"
              invalid={passwordInvalid}
              describedBy={passwordDescribedBy}
            />
            <p id="reg-password-hint" className="hint">
              至少 8 個字元。旁邊的「顯示」按鈕可以檢查輸入。
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
              aria-invalid={nicknameInvalid || undefined}
              aria-describedby={nicknameDescribedBy}
            />
            <p id="reg-nickname-hint" className="hint">
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
