import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
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
      // NextAuth throws redirect; let it propagate
      // For invalid credentials, it throws CredentialsSignin
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
    <div className="max-w-md mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">登入</h1>
      {params.error === "invalid" && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">帳號或密碼錯誤</div>
      )}
      <form action={loginAction} className="space-y-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">密碼</label>
          <input name="password" type="password" required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <p className="text-xs text-gray-500">本機未設郵件，請管理員重設密碼（忘記密碼不支援）。</p>
        <button type="submit" className="w-full py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
          登入
        </button>
      </form>

      {hasGoogle && (
        <>
          <div className="text-center text-sm text-gray-400">或</div>
          <form action={googleAction}>
            <button type="submit" className="w-full py-2 rounded border hover:bg-gray-50">
              使用 Google 登入
            </button>
          </form>
        </>
      )}

      <div className="text-sm text-center">
        還沒有帳號？{" "}
        <Link href="/register" className="underline text-[#2F6F6A]">
          註冊
        </Link>
      </div>
    </div>
  );
}
