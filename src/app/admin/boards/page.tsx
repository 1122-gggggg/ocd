import { prisma } from "@/lib/db";
import { updateOfficialMd } from "@/app/actions/boards";

export default async function AdminBoardsPage() {
  const boards = await prisma.board.findMany({ orderBy: { slug: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">編輯官方說明</h1>
      {boards.map((b) => (
        <div key={b.slug} className="bg-white rounded-lg border border-[#E5E0D5] p-4 space-y-2">
          <div className="font-medium">
            {b.name} <span className="text-xs text-gray-500">/{b.slug}・{b.group}</span>
          </div>
          <form action={updateOfficialMd as any} className="space-y-2">
            <input type="hidden" name="slug" value={b.slug} />
            <textarea
              name="officialMd"
              defaultValue={b.officialMd}
              rows={5}
              className="w-full border rounded px-3 py-2 text-sm font-mono"
            />
            <button type="submit" className="text-sm px-4 py-1 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
              儲存
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
