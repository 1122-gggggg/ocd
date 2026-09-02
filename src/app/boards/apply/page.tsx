import { auth } from "@/auth";
import { createBoardApplication } from "@/app/actions/boards";
import { redirect } from "next/navigation";

export default async function BoardApplyPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const session = (await auth()) as any;
  if (!session?.user?.id) redirect("/login?callbackUrl=/boards/apply");
  const params = await searchParams;
  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">申請開版</h1>
      {params.ok && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">已送出申請，待管理員審核。</div>}
      <form action={createBoardApplication as any} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">版名</label>
          <input name="name" required maxLength={40} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug（小寫英文、數字與 -，2–40 字）</label>
          <input name="slug" required pattern="[a-z0-9-]+" className="mt-1 w-full border rounded px-3 py-2" placeholder="e.g. test-board" />
        </div>
        <div>
          <label className="block text-sm font-medium">群組</label>
          <select name="group" className="mt-1 w-full border rounded px-3 py-2">
            <option value="SYMPTOM">症狀</option>
            <option value="TREATMENT">治療</option>
            <option value="COMMUNITY">社群</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">描述（≤500 字）</label>
          <textarea name="description" required maxLength={500} rows={3} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">申請理由（≤2000 字）</label>
          <textarea name="rationale" required maxLength={2000} rows={4} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="w-full py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
          送出申請
        </button>
      </form>
    </div>
  );
}
