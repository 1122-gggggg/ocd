import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getCachedBoards } from "@/lib/cache";
import { SiteHeader } from "@/components/SiteHeader";
import { mailerConfigured } from "@/lib/mailer";
import { emailVerificationEnforced } from "@/lib/email-verification";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "強迫症互助坊",
    template: "%s｜強迫症互助坊",
  },
  description: "病友、家屬與臨床工作者的經驗交流與支持空間",
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

/**
 * Nudge for accounts whose address is still unproven. Shown site-wide because
 * the consequence — no self-service password reset — only becomes visible at
 * the exact moment the member can no longer read a banner.
 */
async function EmailNotice() {
  if (!mailerConfigured) return null;
  const session = (await auth()) as unknown as {
    user?: { email?: string | null; emailVerified?: number | null };
  } | null;
  const user = session?.user;
  if (!user?.email || user.emailVerified) return null;

  return (
    <div className="container-page pt-4">
      <p className="alert alert-error">
        <span>
          你的 Email 還沒驗證
          {emailVerificationEnforced ? "，驗證前無法發文或回覆" : "，忘記密碼時將無法自助重設"}。
        </span>
        <Link href="/settings#email" className="underline underline-offset-2 font-medium">
          前往驗證
        </Link>
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface-2">
      <div className="container-page py-8 space-y-5 text-sm text-muted">
        <div className="alert alert-info">
          <span aria-hidden="true">☎</span>
          <span>
            如果你現在很不好受：衛生福利部安心專線 <strong>1925</strong>（24 小時免費）。
            立即危險請撥 <strong>119</strong> 或前往最近的急診。
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
        <EmailNotice />
        <main id="main" className="flex-1">
          <div className="container-page py-6 sm:py-8">{children}</div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
