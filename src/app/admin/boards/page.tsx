import { prisma } from "@/lib/db";
import { updateOfficialMd } from "@/app/actions/boards";
import { GROUP_LABELS } from "@/components/ui";

export default async function AdminBoardsPage() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { slug: true, name: true, group: true, officialMd: true },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="section-title">版區官方說明</h2>
        <p className="text-sm text-muted">
          支援 Markdown。這段內容會顯示在版區頁最上方，作為該版的閱讀指引。
        </p>
      </div>

      <ul className="space-y-3">
        {boards.map((b) => (
          <li key={b.slug} className="card card-pad space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{b.name}</span>
              <code className="mono text-xs text-subtle">/{b.slug}</code>
              <span className="badge badge-accent">{GROUP_LABELS[b.group] ?? b.group}</span>
            </div>
            <form action={updateOfficialMd as unknown as string} className="space-y-2">
              <input type="hidden" name="slug" value={b.slug} />
              <textarea
                name="officialMd"
                defaultValue={b.officialMd}
                rows={6}
                className="textarea mono"
                aria-label={`${b.name} 官方說明`}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                儲存
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
