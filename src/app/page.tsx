import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const boards = await prisma.board.findMany({
    where: { status: "ACTIVE" },
    orderBy: { slug: "asc" },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const groupLabels: Record<string, string> = {
    SYMPTOM: "症狀",
    TREATMENT: "治療",
    COMMUNITY: "社群",
  };
  const groups: Array<"SYMPTOM" | "TREATMENT" | "COMMUNITY"> = ["SYMPTOM", "TREATMENT", "COMMUNITY"];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg p-6 border border-[#E5E0D5]">
        <h1 className="text-2xl font-bold text-[#1F2933]">歡迎來到強迫症互助坊</h1>
        <p className="mt-2 text-gray-600 leading-relaxed">
          這裡是病友、家屬與臨床工作者互相支持、分享經驗的空間。請友善交流，尊重多元經驗。
        </p>
        <p className="mt-2 text-sm text-gray-500">
          本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。
        </p>
      </div>

      {groups.map((g) => {
        const list = boards.filter((b) => b.group === g);
        return (
          <section key={g} className="space-y-3">
            <h2 className="text-lg font-bold text-[#2F6F6A] border-b border-[#E5E0D5] pb-2">
              {groupLabels[g]}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((b) => {
                const last = b.posts[0]?.createdAt;
                return (
                  <Link
                    key={b.slug}
                    href={`/b/${b.slug}`}
                    className="block bg-white rounded-lg border border-[#E5E0D5] p-4 hover:shadow-sm hover:border-[#2F6F6A]/30 transition"
                  >
                    <div className="font-medium text-[#1F2933]">{b.name}</div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{b.description}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {last ? `最近發文：${new Date(last).toLocaleString("zh-TW")}` : "尚無討論，登入後可發第一篇。"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
