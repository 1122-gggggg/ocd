import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "登入" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    reset?: string;
    pwchanged?: string;
    verify?: string;
  }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";
  const hasGoogle = !!process.env.AUTH_GOOGLE_ID;

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const cb = String(formData.get("callbackUrl") ?? "/");
    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: cb,
      });
    } catch (e: unknown) {
      const err = e as { type?: string; cause?: unknown };
      // NextAuth throws redirect; let it propagate.
      // Invalid credentials surface as CredentialsSignin.
      if (err?.type === "CredentialsSignin") {
        redirect(`/login?error=invalid&callbackUrl=${encodeURIComponent(cb)}`);
      }
      throw e;
    }
  }

  async function googleAction() {
    "use server";
    await signIn("google", { redirectTo: callbackUrl });
  }

  return (
    <div className="container-narrow space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">登入</h1>
          <p className="text-sm text-muted">歡迎回來。</p>
        </header>

        {params.error === "invalid" && (
          <p className="alert alert-error">帳號或密碼錯誤，請再試一次。</p>
        )}
        {params.reset === "1" && (
          <p className="alert alert-success">密碼已重設，請用新密碼登入。</p>
        )}
        {params.pwchanged === "1" && (
          <p className="alert alert-success">密碼已變更，請重新登入。</p>
        )}

        <form action={loginAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label className="label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="login-password">
              密碼
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
            />
            <p className="hint">
              <Link
                href="/forgot-password"
                className="text-accent underline underline-offset-2"
              >
                忘記密碼？
              </Link>
            </p>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg">
            登入
          </button>
        </form>

        {hasGoogle && (
          <>
            <div className="flex items-center gap-3">
              <span className="divider flex-1" />
              <span className="text-xs text-subtle">或</span>
              <span className="divider flex-1" />
            </div>
            <form action={googleAction}>
              <button type="submit" className="btn btn-secondary btn-block btn-lg">
                使用 Google 登入
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-sm text-muted">
        還沒有帳號？{" "}
        <Link href="/register" className="text-accent underline underline-offset-2">
          註冊
        </Link>
      </p>
    </div>
  );
}
