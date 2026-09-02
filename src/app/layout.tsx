import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
});

export const metadata: Metadata = {
  title: "強迫症互助坊",
  description: "病友、家屬與臨床工作者的經驗交流與支持空間",
};

async function Header() {
  const session = (await auth()) as unknown as {
    user?: { id: string; nickname?: string; role?: string; memberType?: string };
  } | null;

  const boards = await prisma.board.findMany({
    where: { status: "ACTIVE" },
    orderBy: { slug: "asc" },
    select: { slug: true, name: true, group: true },
  });
  const symptom = boards.filter((b) => b.group === "SYMPTOM");
  const treatment = boards.filter((b) => b.group === "TREATMENT");
  const community = boards.filter((b) => b.group === "COMMUNITY");

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b border-[#E5E0D5] bg-[#F7F4EE]/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-[56rem] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-[#2F6F6A] shrink-0">
          強迫症互助坊
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">症狀</span>
            {symptom.map((b) => (
              <Link key={b.slug} href={`/b/${b.slug}`} className="hover:text-[#2F6F6A] hover:underline">
                {b.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">治療</span>
            {treatment.map((b) => (
              <Link key={b.slug} href={`/b/${b.slug}`} className="hover:text-[#2F6F6A] hover:underline">
                {b.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">社群</span>
            {community.map((b) => (
              <Link key={b.slug} href={`/b/${b.slug}`} className="hover:text-[#2F6F6A] hover:underline">
                {b.name}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center gap-3 text-sm shrink-0">
          {session?.user ? (
            <>
              <Link href="/settings" className="hover:underline">
                {session.user.nickname ?? session.user.id.slice(0, 6)}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]"
                >
                  後台
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="px-3 py-1 border rounded hover:bg-white">
                  登出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1 border rounded hover:bg-white">
                登入
              </Link>
              <Link href="/register" className="px-3 py-1 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
                註冊
              </Link>
            </>
          )}
        </div>
      </div>
      {/* mobile nav */}
      <div className="md:hidden max-w-[56rem] mx-auto px-4 pb-3 flex flex-col gap-2 text-sm">
        <details className="border rounded p-2 bg-white/60">
          <summary className="cursor-pointer">版區選單</summary>
          <div className="mt-2 flex flex-col gap-1">
            <div className="font-medium text-xs text-gray-500 mt-1">症狀</div>
            <div className="flex flex-wrap gap-2">
              {symptom.map((b) => (
                <Link key={b.slug} href={`/b/${b.slug}`} className="underline">
                  {b.name}
                </Link>
              ))}
            </div>
            <div className="font-medium text-xs text-gray-500 mt-1">治療</div>
            <div className="flex flex-wrap gap-2">
              {treatment.map((b) => (
                <Link key={b.slug} href={`/b/${b.slug}`} className="underline">
                  {b.name}
                </Link>
              ))}
            </div>
            <div className="font-medium text-xs text-gray-500 mt-1">社群</div>
            <div className="flex flex-wrap gap-2">
              {community.map((b) => (
                <Link key={b.slug} href={`/b/${b.slug}`} className="underline">
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${notoSansTC.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">
          <div className="max-w-[56rem] mx-auto px-4 py-6">{children}</div>
        </main>
        <footer className="border-t border-[#E5E0D5] bg-white/60 mt-8">
          <div className="max-w-[56rem] mx-auto px-4 py-6 text-sm text-gray-600 leading-relaxed">
            <p>
              本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。請勿依據本站內容自行停藥或改變治療。緊急狀況請撥打 1925
              或當地緊急醫療。
            </p>
            <p className="mt-2">
              衛生福利部安心專線 <strong>1925</strong>（24 小時）｜{" "}
              <a
                href="https://www.iasp.info/suicidalthoughts/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#2F6F6A]"
              >
                https://www.iasp.info/suicidalthoughts/
              </a>{" "}
              ｜ <Link href="/disclaimer" className="underline text-[#2F6F6A]">完整免責聲明</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
