import { auth } from "@/auth";
import Link from "next/link";
import { getRecoveryData, getVictories } from "@/app/actions/recovery";
import { RecoveryTracker } from "@/components/RecoveryTracker";
import { VictoryWall } from "@/components/VictoryWall";
import { Breadcrumbs } from "@/components/ui";

export const metadata = {
  title: "復原歷程與小小勝利 | 強迫症互助坊",
  description:
    "設定復原目標、記錄每日非強迫應對，並在小小勝利牆分享奪回生活的每個微小進展。",
};

export default async function RecoveryPage() {
  const session = (await auth()) as unknown as {
    user?: { id: string; nickname: string };
  } | null;

  const signedIn = !!session?.user?.id;
  const [recoveryData, victories] = await Promise.all([
    getRecoveryData(),
    getVictories(15),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "復原中心", href: "/recovery" },
        ]}
      />

      {/* Header */}
      <div className="card card-pad bg-accent-soft/30 border border-accent/20 space-y-2">
        <span className="badge badge-accent">Recovery Domain</span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
          🌱 復原歷程：每一天，多拿回一點生活
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-2xl">
          強迫症復原的核心不是等待「恐懼感完全消失」，而是「即使焦慮存在，我依然帶著它去工作、牽手、看電影」。
          在這裡，我們記錄下每一次微小的堅持與抵抗。
        </p>
      </div>

      {/* Victory Wall Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-fg flex items-center gap-2">
              <span>🏆 今日小小勝利牆 (Victory Wall)</span>
            </h2>
            <p className="text-xs text-muted">
              不比誰的症狀更嚴重，而是看今天大家如何從強迫症手中奪回屬於自己的時間。
            </p>
          </div>
        </div>

        <VictoryWall initialVictories={victories} signedIn={signedIn} />
      </section>

      {/* Personal Recovery Tracker & Log */}
      <section className="space-y-4 pt-4 border-t border-line">
        {signedIn ? (
          <RecoveryTracker
            initialGoals={recoveryData.goals}
            initialLogs={recoveryData.logs}
          />
        ) : (
          <div className="card card-pad text-center space-y-3 border border-line">
            <h2 className="text-lg font-bold text-fg">登入以啟用個人的非強迫日記與復原目標</h2>
            <p className="text-xs text-muted max-w-md mx-auto">
              記錄每天你如何面對觸發情境、抵抗強迫行為，建立屬於你的暴露與應對資料庫。
            </p>
            <div className="pt-1 flex items-center justify-center gap-2">
              <Link href="/login" className="btn btn-primary btn-sm">
                登入
              </Link>
              <Link href="/register" className="btn btn-secondary btn-sm">
                註冊帳號
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
