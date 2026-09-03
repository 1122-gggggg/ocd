import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getCachedBoards } from "@/lib/cache";
import { SiteHeader } from "@/components/SiteHeader";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

// 正式網址：AUTH_URL（未設定時退回正式網域）。metadataBase 讓 OG／canonical 相對路徑轉為絕對網址。
const siteUrl =
  process.env.AUTH_URL && process.env.AUTH_URL.trim() !== ""
    ? process.env.AUTH_URL
    : "https://ocd.goodman.tw";

// 社群圖示待辦：日後新增 src/app/icon.tsx 與 src/app/opengraph-image.tsx；
// 本檔僅引用「/icon」與「/opengraph-image」路徑，不在此建立圖檔。
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "強迫症互助坊",
    template: "%s｜強迫症互助坊",
  },
  description: "病友、家屬與臨床工作者的經驗交流與支持空間",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "強迫症互助坊",
    locale: "zh_Hant",
    url: "/",
    title: "強迫症互助坊",
    description: "病友、家屬與臨床工作者的經驗交流與支持空間",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "強迫症互助坊",
    description: "病友、家屬與臨床工作者的經驗交流與支持空間",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#14181b" },
  ],
};

async function Header() {
  const session = (await auth()) as unknown as {
    user?: { id: string; nickname?: string; role?: string; memberType?: string };
  } | null;

  const boards = await getCachedBoards();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const user = session?.user
    ? {
        nickname: session.user.nickname ?? session.user.id.slice(0, 6),
        isAdmin: session.user.role === "ADMIN",
      }
    : null;

  return <SiteHeader boards={boards} user={user} signOutAction={signOutAction} />;
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface-2">
      <div className="container-page py-8 space-y-5 text-sm text-muted">
        <div className="alert alert-info">
          <span aria-hidden="true">☎</span>
          <span>
            如果你現在很不好受：衛生福利部安心專線 <a href="tel:1925" className="underline underline-offset-2 font-medium">1925</a>（24 小時免費）。
            立即危險請撥 <a href="tel:119" className="underline underline-offset-2 font-medium">119</a> 或前往最近的急診。
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="font-medium text-fg">關於本站</div>
            <p className="leading-relaxed">
              本站內容由使用者撰寫或管理員整理，僅供經驗交流，
              <strong className="text-fg">不是醫療診斷、處方或治療建議</strong>。
              請勿依據本站內容自行停藥或改變治療。
            </p>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-fg">求助與說明</div>
            <ul className="space-y-1">
              <li>
                <Link href="/disclaimer" className="hover:text-accent underline underline-offset-2">
                  完整免責聲明
                </Link>
              </li>
              <li>
                <Link href="/boards/apply" className="hover:text-accent underline underline-offset-2">
                  申請開版
                </Link>
              </li>
              <li>
                <a
                  href="https://www.iasp.info/suicidalthoughts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent underline underline-offset-2"
                >
                  IASP 國際求助資源
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-4 text-xs text-subtle">
          © {new Date().getFullYear()} 強迫症互助坊
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body className={`${notoSansTC.variable} antialiased min-h-screen flex flex-col`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn btn-primary btn-sm"
        >
          跳到主要內容
        </a>
        <Header />
        <main id="main" className="flex-1">
          <div className="container-page py-6 sm:py-8">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
