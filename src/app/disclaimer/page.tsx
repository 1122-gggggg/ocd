import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "免責聲明與求助資源",
  description: "本站內容僅供經驗交流，不是醫療診斷、處方或治療建議。",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">免責聲明與求助資源</h1>
        <p className="text-muted">請在使用本站前花一分鐘讀完這一頁。</p>
      </header>

      <div className="alert alert-error">
        <span aria-hidden="true">⚠</span>
        <span>
          若你或身邊的人有<strong>立即危險</strong>，請立即撥打 <strong>119</strong>
          ，或前往最近的急診。
        </span>
      </div>

      <section className="card card-pad space-y-4">
        <h2 className="section-title">這裡不是什麼</h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            本站內容由使用者撰寫或管理員整理，僅供經驗交流，
            <strong className="text-fg">不是醫療診斷、處方或治療建議</strong>。
            請勿依據本站內容自行停藥或改變治療。
          </p>
          <p>
            版區官方說明、使用者發文與回覆皆為經驗分享，無法取代專業醫療評估。
            若你有持續困擾或症狀影響生活，請諮詢精神科、身心科或心理專業人員。
          </p>
          <p>
            治療相關版區（ERP、CBT、藥物治療等）的內容僅為學習與經驗交流，
            <strong className="text-fg">這不是處方，請與醫師討論</strong>。
            任何用藥調整務必與主治醫師討論。
          </p>
        </div>
      </section>

      <section className="card card-pad space-y-4">
        <h2 className="section-title">求助資源</h2>
        <ul className="space-y-2">
          <li className="alert alert-info">
            <span aria-hidden="true">☎</span>
            <span>
              衛生福利部安心專線 <strong>1925</strong>（24 小時免費）
            </span>
          </li>
          <li className="alert">
            <span aria-hidden="true">🌐</span>
            <a
              href="https://www.iasp.info/suicidalthoughts/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 break-all"
            >
              iasp.info/suicidalthoughts — 國際自殺防治協會資源
            </a>
          </li>
          <li className="alert">
            <span aria-hidden="true">💬</span>
            <span>各縣市生命線（1995）、張老師專線（1980）</span>
          </li>
        </ul>
      </section>

      <section className="card card-pad space-y-3">
        <h2 className="section-title">匿名與隱私</h2>
        <p className="text-sm text-muted leading-relaxed">
          發文與回覆時可以選擇匿名，其他使用者將看不到你的暱稱。
          站務人員仍可追蹤發文者，以處理違規內容與緊急求助情況。
          暱稱本身沒有任何限制，你隨時可以在帳號設定裡更換。
        </p>
      </section>
    </div>
  );
}
