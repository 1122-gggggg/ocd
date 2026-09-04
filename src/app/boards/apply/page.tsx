import { auth } from "@/auth";
import { createBoardApplication } from "@/app/actions/boards";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "申請開版" };

const ERROR_MESSAGES: Record<string, string> = {
  SLUG_TAKEN: "該版區代稱 (slug) 已被使用或已有申請中，請換一個。",
  INVALID_SLUG: "代稱 (slug) 格式不符，僅允許小寫英文、數字與 -，長度 2-40 字。",
  INVALID_NAME: "版區名稱長度需為 1-40 字。",
  INVALID_GROUP: "請選擇正確的版區分組。",
  INVALID_DESC: "版區說明不能為空且需在 500 字以內。",
  INVALID_RATIONALE: "申請理由不能為空且需在 2000 字以內。",
};

export default async function BoardApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/boards/apply");
  const params = await searchParams;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">申請開版</h1>
          <p className="text-sm text-muted">
            覺得少了一個能聊某個主題的地方？告訴我們，管理員會評估後開設。
          </p>
        </header>

        {params.ok && (
          <p className="alert alert-success">已送出申請，管理員審核後會開設版區。</p>
        )}
        {params.err && (
          <p role="alert" className="alert alert-error">
            {ERROR_MESSAGES[params.err] ?? "送出失敗，請檢查輸入內容後再試一次。"}
          </p>
        )}

        <form action={createBoardApplication as unknown as string} className="space-y-4">
          <div>
            <label className="label" htmlFor="ba-name">
              版名
            </label>
            <input id="ba-name" name="name" required maxLength={40} className="input" placeholder="例如：睡眠與作息" />
          </div>

          <div>
            <label className="label" htmlFor="ba-slug">
              網址代稱（slug）
            </label>
            <input
              id="ba-slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              className="input mono"
              placeholder="sleep-routine"
            />
            <p className="hint">小寫英文、數字與連字號，2–40 字。會成為 /b/… 的網址。</p>
          </div>

          <div>
            <label className="label" htmlFor="ba-group">
              群組
            </label>
            <select id="ba-group" name="group" className="select" defaultValue="SYMPTOM">
              <option value="SYMPTOM">症狀</option>
              <option value="TREATMENT">治療</option>
              <option value="COMMUNITY">社群</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ba-desc">
              版區描述
            </label>
            <textarea
              id="ba-desc"
              name="description"
              required
              maxLength={500}
              rows={3}
              className="textarea"
              placeholder="這個版要討論什麼？（≤500 字）"
            />
          </div>

          <div>
            <label className="label" htmlFor="ba-why">
              申請理由
            </label>
            <textarea
              id="ba-why"
              name="rationale"
              required
              maxLength={2000}
              rows={5}
              className="textarea"
              placeholder="為什麼現有版區不夠用？（≤2000 字）"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            送出申請
          </button>
        </form>
      </div>
    </div>
  );
}
