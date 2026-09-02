export default function DisclaimerPage() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4 leading-relaxed">
      <h1 className="text-2xl font-bold">免責聲明與求助資源</h1>
      <p>
        本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。請勿依據本站內容自行停藥或改變治療。緊急狀況請撥打
        1925 或當地緊急醫療。
      </p>
      <p>
        本站的版區官方說明、使用者發文與回覆皆為經驗分享，無法取代專業醫療評估。若您有持續困擾或症狀影響生活，請諮詢精神科、心身科或心理專業人員。
      </p>
      <p>
        治療相關版區（ERP、CBT、藥物治療等）內容僅為學習與經驗交流，這不是處方／請與醫師討論。任何用藥調整請務必與主治醫師討論。
      </p>
      <h2 className="text-lg font-bold mt-4">求助資源</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>衛生福利部安心專線 <strong>1925</strong>（24 小時）</li>
        <li>
          <a
            href="https://www.iasp.info/suicidalthoughts/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#2F6F6A]"
          >
            https://www.iasp.info/suicidalthoughts/
          </a>
        </li>
        <li>各地縣市生命線、張老師專線</li>
      </ul>
      <p className="text-sm text-gray-500">
        若您或身邊的人有立即危險，請立即撥打 119 或前往最近的急診。
      </p>
    </div>
  );
}
