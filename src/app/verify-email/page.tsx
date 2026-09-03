import Link from "next/link";
import type { Metadata } from "next";
import { consumeEmailVerification } from "@/lib/email-verification";

export const metadata: Metadata = {
  title: "Email 驗證",
  robots: { index: false, follow: false },
};

// The token is spent on load, so this page must never be cached or prerendered.
export const dynamic = "force-dynamic";

const FAILURES: Record<string, { title: string; detail: string }> = {
  INVALID: {
    title: "連結無效",
    detail: "這個驗證連結不存在，可能已經被較新的連結取代了。",
  },
  EXPIRED: {
    title: "連結已過期",
    detail: "驗證連結有時效限制。請到帳號設定重新寄送一次。",
  },
  USED: {
    title: "連結已使用過",
    detail: "這個連結已經用過了。如果你的 Email 還沒驗證成功，請重新寄送一次。",
  },
  EMAIL_CHANGED: {
    title: "Email 已變更",
    detail: "寄出這封信之後，帳號的 Email 已經換過了。請對新的 Email 重新驗證。",
  },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token ?? "";
  const result = token
    ? await consumeEmailVerification(token)
    : ({ ok: false, reason: "INVALID" } as const);

  if (result.ok) {
    return (
      <div className="container-narrow">
        <div className="card card-pad space-y-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Email 驗證完成</h1>
          <p className="alert alert-success">
            這個 Email 已確認是你的。之後忘記密碼時，就可以自己重設了。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className="btn btn-primary">
              回到首頁
            </Link>
            <Link href="/settings" className="btn btn-secondary">
              帳號設定
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const failure = FAILURES[result.reason] ?? FAILURES.INVALID!;
  return (
    <div className="container-narrow">
      <div className="card card-pad space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{failure.title}</h1>
        <p className="alert alert-error">{failure.detail}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/settings#email" className="btn btn-primary">
            重新寄送驗證信
          </Link>
          <Link href="/" className="btn btn-ghost">
            回到首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
