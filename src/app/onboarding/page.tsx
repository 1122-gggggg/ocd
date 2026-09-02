import { auth } from "@/auth";
import { completeOnboarding } from "@/app/actions/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "完成個人資料" };

export default async function OnboardingPage() {
  const session = (await auth()) as unknown as {
    user?: { id: string; profileComplete?: boolean };
  } | null;
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  if (user.profileComplete) redirect("/");

  // OAuth sign-ups get a placeholder like "user-ab12cd34"; don't prefill it.
  const suggested = user.nickname.startsWith("user-") ? "" : user.nickname;

  return (
    <div className="container-narrow">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">再兩件事就好</h1>
          <p className="text-sm text-muted">設定你的暱稱和身分，就可以開始使用論壇。</p>
        </header>

        <form action={completeOnboarding as unknown as string} className="space-y-4">
          <div>
            <label className="label" htmlFor="ob-nickname">
              暱稱
            </label>
            <input
              id="ob-nickname"
              name="nickname"
              required
              defaultValue={suggested}
              className="input"
              placeholder="想被怎麼稱呼都可以"
            />
            <p className="hint">
              沒有任何限制：長度、符號、emoji、空白都可以，也可以和別人重複。日後隨時能改。
            </p>
          </div>

          <div>
            <label className="label" htmlFor="ob-member">
              身分
            </label>
            <select
              id="ob-member"
              name="memberType"
              defaultValue={user.memberType}
              className="select"
            >
              <option value="PATIENT">病友</option>
              <option value="FAMILY">家屬</option>
              <option value="CLINICIAN">臨床工作者</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            開始使用
          </button>
        </form>
      </div>
    </div>
  );
}
