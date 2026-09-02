import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createClinicianApplication } from "@/app/actions/clinician";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "臨床身分驗證" };

const statusLabel: Record<string, string> = {
  NONE: "未申請",
  PENDING: "審核中",
  VERIFIED: "已驗證",
  REJECTED: "未通過",
};

const appStatusLabel: Record<string, string> = {
  PENDING: "審核中",
  APPROVED: "已核准",
  REJECTED: "已駁回",
};

export default async function ClinicianApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/clinician/apply");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");
  const app = await prisma.clinicianApplication.findUnique({ where: { userId: user.id } });
  const params = await searchParams;

  if (user.memberType !== "CLINICIAN") {
    return (
      <div className="container-narrow card card-pad text-center space-y-3">
        <p className="font-medium">這個申請只開放「臨床工作者」身分</p>
        <p className="text-sm text-muted">
          你目前的身分不是臨床工作者。身分需由管理員調整，請先與站務聯絡。
        </p>
        <div className="pt-1">
          <Link href="/settings" className="btn btn-secondary">
            回到帳號設定
          </Link>
        </div>
      </div>
    );
  }

  if (user.clinicianStatus === "VERIFIED") {
    return (
      <div className="container-narrow card card-pad text-center space-y-3">
        <span className="badge badge-success mx-auto">已通過臨床驗證</span>
        <p className="text-sm text-muted">
          你已可在「臨床交流」版發文，「已驗證臨床」徽章會顯示在你的發文與回覆旁。
        </p>
        <div className="pt-1">
          <Link href="/" className="btn btn-secondary">
            回到首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">臨床身分驗證</h1>
          <p className="text-sm text-muted">
            通過驗證後，你的發文會標示「已驗證臨床」，並可在臨床交流版發文。
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge">
              目前狀態：{statusLabel[user.clinicianStatus] ?? user.clinicianStatus}
            </span>
            {app?.status && (
              <span className="badge">申請：{appStatusLabel[app.status] ?? app.status}</span>
            )}
          </div>
        </header>

        {params.ok && <p className="alert alert-success">已送出，待管理員審核。</p>}
        {app?.reviewNote && (
          <div className="alert">
            <span aria-hidden="true">📝</span>
            <span>
              <span className="font-medium">審核備註：</span>
              {app.reviewNote}
            </span>
          </div>
        )}

        <form
          action={createClinicianApplication as unknown as string}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div>
            <label className="label" htmlFor="ca-title">
              職稱
            </label>
            <input
              id="ca-title"
              name="title"
              required
              maxLength={100}
              defaultValue={app?.title ?? ""}
              className="input"
              placeholder="例如：臨床心理師"
            />
          </div>

          <div>
            <label className="label" htmlFor="ca-specialty">
              專長
            </label>
            <input
              id="ca-specialty"
              name="specialty"
              required
              maxLength={100}
              defaultValue={app?.specialty ?? ""}
              className="input"
              placeholder="例如：ERP、CBT"
            />
          </div>

          <div>
            <label className="label" htmlFor="ca-statement">
              說明
            </label>
            <textarea
              id="ca-statement"
              name="statement"
              required
              maxLength={2000}
              rows={5}
              defaultValue={app?.statement ?? ""}
              className="textarea"
              placeholder="簡述你的訓練背景與執業經驗（≤2000 字）"
            />
          </div>

          <div>
            <label className="label" htmlFor="ca-proof">
              證明文件
            </label>
            <input
              id="ca-proof"
              type="file"
              name="proof"
              accept="image/jpeg,image/png,application/pdf"
              className="input"
              style={{ paddingBlock: "0.4rem" }}
            />
            <p className="hint">
              jpeg / png / pdf，≤5MB，可留空。檔案僅管理員可見，不會公開。
              {app?.proofPath && (
                <>
                  <br />
                  已上傳：{app.proofPath.split("/").pop()}
                </>
              )}
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            送出申請
          </button>
        </form>
      </div>
    </div>
  );
}
