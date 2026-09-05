import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "自救專區",
  description:
    "強迫症的系統化自救教材：從認識症狀到一線治療、藥物、第二線與新興方向，整理具理論根據與實驗支撐的研究解方與證據等級。",
};

type Paper = { label: string; href: string };
type Chapter = {
  id: string;
  no: string;
  title: string;
  goal: string;
  points: string[];
  reads: { label: string; href: string }[];
  papers: Paper[];
};

const EVIDENCE = [
  { label: "實證充足", desc: "大型隨機試驗或統合分析＋國際指引一致" },
  { label: "中等", desc: "有隨機試驗支撐，但樣本小或效果因人而異" },
  { label: "新興", desc: "初步研究，任何嘗試務必先與醫師討論" },
];

const CHAPTERS: Chapter[] = [
  {
    id: "know",
    no: "第一章",
    title: "認識強迫症：先看懂迴圈",
    goal: "自救的第一步不是對抗，而是認出自己在哪個環節。",
    points: [
      "侵入性想法本身很常見，問題不在念頭，而在念頭引發焦慮後，用儀式換取短暫緩解的迴圈。",
      "儀式不一定看得見：腦中的反覆分析、回想、自我保證同樣是儀式，只是別人看不出來。",
      "這是高度可治療的困擾，復原通常是管理而非等待奇蹟，先認識循環就是改變的開始。",
    ],
    reads: [{ label: "學習資源區：11 種常見表現", href: "/learn" }],
    papers: [],
  },
  {
    id: "erp",
    no: "第二章",
    title: "第一線心理治療：ERP 與 CBT",
    goal: "實證基礎最扎實的一線心理治療，國際指引的優先建議。",
    points: [
      "旗艦隨機對照試驗與後續統合分析整體支持含暴露與反應預防的 CBT，但每個人反應不同，步調請與醫師討論。",
      "服藥後仍困擾時，加做含 ERP 的 CBT 是有研究支持的選項之一，加藥則各有利弊，不自行加減藥。",
      "有結構、有回家練習、含復發預防的療程走得更穩；自助素材可陪伴練習，但不能取代專業評估。",
    ],
    reads: [
      { label: "暴露與反應預防（ERP）", href: "/learn/erp" },
      { label: "認知行為治療（CBT）", href: "/learn/cbt" },
    ],
    papers: [
      { label: "Foa 等 2005：ERP 旗艦試驗", href: "https://pubmed.ncbi.nlm.nih.gov/15625214/" },
      { label: "Reid 等 2021：ERP 統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/33618297/" },
      { label: "NICE CG31 強迫症治療指引", href: "https://www.nice.org.uk/guidance/cg31" },
    ],
  },
  {
    id: "meds",
    no: "第三章",
    title: "藥物治療：把基線降到做得動練習",
    goal: "藥物常扮演讓人有力氣開始練習的角色，用藥決定一律回到醫師。",
    points: [
      "一線藥物具大型試驗綜合與國際指引支撐，但起效與反應因人而異，切勿自行開始、增減或停藥。",
      "單一藥物效果不足時，文獻中有合併其他策略的增效研究，訊號有限且需權衡副作用，須由醫師審慎評估。",
      "麩胺酸等新興方向僅有小型短期試驗的初步訊號，證據仍在累積，不建議自行嘗試或解讀為常規治療。",
    ],
    reads: [{ label: "藥物治療", href: "/learn/medication" }],
    papers: [
      { label: "Soomro 2008：Cochrane 系統性回顧", href: "https://pubmed.ncbi.nlm.nih.gov/18253995/" },
      { label: "Dold 2015：增效雙盲試驗統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/25939614/" },
      { label: "NICE CG31 強迫症治療指引", href: "https://www.nice.org.uk/guidance/cg31" },
    ],
  },
  {
    id: "second-line",
    no: "第四章",
    title: "第二線：ACT、正念與森田療法",
    goal: "換一種與念頭相處的方式，適合作為一線治療的輔助。",
    points: [
      "ACT 有隨機試驗與統合分析支撐，適合與 ERP 等一線治療搭配，而非單獨取代；想加入時先與醫師確認順序與份量。",
      "正念的定位是輔助的煞車：提早察覺、減少立刻做儀式的衝動，若把它當成趕走念頭的方法反而可能加重自責。",
      "森田療法源自日本，主張順應自然、為所當為，把力氣放回生活行動；中日試驗多為中小型，證據誠實列為中等，台灣少見專門服務，安排請與醫師討論。",
      "針對東亞文化高頻的餘光強迫症（視線恐懼／對人恐怖），森田療法的順應自然（接納眼眶緊繃）與為所當為（專注眼前生活），能有效阻斷視線被黏住的焦慮螺旋。",
    ],
    reads: [
      { label: "接受與承諾治療（ACT）", href: "/learn/act" },
      { label: "正念", href: "/learn/mindfulness" },
      { label: "森田療法", href: "/learn/morita" },
      { label: "餘光強迫症與視線恐懼", href: "/learn/gaze-ocd" },
    ],
    papers: [
      { label: "Twohig 等 2010：ACT 隨機試驗", href: "https://pubmed.ncbi.nlm.nih.gov/20873905/" },
      { label: "Bürkle 等 2025：正念統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/39862744/" },
      { label: "Wu 等 2022：森田治強迫症統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/35285288/" },
    ],
  },
  {
    id: "icbt",
    no: "第五章",
    title: "數位治療：在線上接受 CBT",
    goal: "就醫不便時的另一條實證之路，但仍需專業人員參與。",
    points: [
      "有治療師引導的網路 CBT 是實證支持的治療形式，成人與青少年試驗皆顯示有效，特別嘉惠就醫不便族群。",
      "純自助線上課程只能是輔助或入門，缺乏檢核時有延誤處理的風險，未改善或加重時暫停並回診。",
      "務實的落地是混合模式：以面談為主，用數位工具延續會談間的練習，困難仍帶回會談討論。",
    ],
    reads: [
      { label: "網路與數位認知行為治療", href: "/learn/icbt" },
      { label: "自助策略", href: "/learn/self-help" },
    ],
    papers: [
      { label: "Andersson 等 2012：成人網路 CBT 試驗", href: "https://pubmed.ncbi.nlm.nih.gov/22348650/" },
      { label: "Lenhard 等 2017：青少年網路 CBT 試驗", href: "https://pubmed.ncbi.nlm.nih.gov/27993223/" },
    ],
  },
  {
    id: "neuromodulation",
    no: "第六章",
    title: "難治與腦刺激：先分清楚定位",
    goal: "TMS 與 DBS 定位完全不同，一般病友多半不需要走到這一步。",
    points: [
      "重複經顱磁刺激是非侵入、可與醫師討論的輔助選項，僅限正規治療反應不足且經完整評估的人，不取代藥物與心理治療。",
      "深腦刺激是侵入性手術，僅保留給極少數超難治個案，須在具完整團隊的醫學中心經嚴格評估，一般病友無需考慮。",
      "核准的是特定儀器用於難治型，而非人人適用；有疑問請直接詢問自己的醫療團隊，切勿自行尋求管道。",
    ],
    reads: [
      { label: "腦刺激治療", href: "/learn/neuromodulation" },
      { label: "住院與日間病房", href: "/learn/inpatient" },
    ],
    papers: [
      { label: "Carmi 等 2019：深部磁刺激多中心試驗", href: "https://pubmed.ncbi.nlm.nih.gov/31109199/" },
      { label: "Denys 等 2010：伏隔核深腦刺激研究", href: "https://pubmed.ncbi.nlm.nih.gov/20921122/" },
    ],
  },
  {
    id: "daily",
    no: "第七章",
    title: "生活地基與復發預防：讓治療站得穩",
    goal: "身體穩了，練習才做得動；好轉後仍要維持追蹤與練習。",
    points: [
      "運動與睡眠是讓治療站得穩的地基，統合分析支持其關聯性，但皆不取代正規治療，也別把它們練成新的硬性規則。",
      "家庭包容極為普遍，家人不是做錯事；家人參與的治療具中等效益，家人的角色是陪伴練習的隊友而非監工，退出保證迴圈要全家一致。",
      "復發波動是常態：備好求助名單、維持規律追蹤，低潮時提早求助，而不是等撐不住才行動。",
    ],
    reads: [
      { label: "自助策略", href: "/learn/self-help" },
      { label: "家庭支持", href: "/learn/family-support" },
      { label: "全台診療名錄", href: "/learn/clinics" },
    ],
    papers: [
      { label: "Bottoms 等 2023：運動統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/36541901/" },
      { label: "Nota 等 2015：睡眠與生理節律統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/25603315/" },
      { label: "Stewart 等 2020：家人參與治療統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/32828003/" },
    ],
  },
  {
    id: "taiwan-guide",
    no: "第八章",
    title: "台灣在地就醫與諮商現實手冊",
    goal: "面對門診只有 3 至 5 分鐘、自費諮商沉重與藥物副作用困擾時的實戰指引。",
    points: [
      "健保門診與給藥節奏：健保身心科以症狀評估與給藥為主，強迫症需耐受 8 至 12 週的高劑量累積期；前 1 至 2 週常有腸胃或嗜睡等適應期反應，切忌自行停藥。善用「3 分鐘高效複診備忘錄」事先條列症狀變化百分比、副作用與服藥順從性。",
      "心理諮商資源大地圖：善用衛福部 15 至 45 歲青壯世代心理健康支持方案（每人 3 次免費補助）、各縣市社區心理衛生中心平價門診；若自費挑選心理諮商所，務必主動確認心理師具備暴露與反應預防（ERP）或認知行為治療（CBT）訓練。",
      "與醫師精準溝通副作用：SSRI 不具成癮性；腸胃不適可隨餐服藥，白天嗜睡可與醫師討論改至睡前，性功能受影響主動提出協商調整方案；若罕見出現高燒與肌肉僵硬等血清素症候群警訊應立即急診。",
      "家屬代償退出與氧氣面罩原則：家人代開門、代洗與給保證常出於善意，卻在無形中餵養症狀；採用耶魯大學 SPACE 模式循序退出代償，堅守焦慮發作前 15 分鐘溫柔陪伴不代答的界線，照顧者先照顧好自己的生活界線。",
    ],
    reads: [
      { label: "家庭支持與代償退出", href: "/learn/family-support" },
      { label: "全台診療名錄（43 間）", href: "/learn/clinics" },
      { label: "青壯世代心理支持方案", href: "https://dep.mohw.gov.tw/DOMHAOH/cp-7168-80425-107.html" },
    ],
    papers: [
      { label: "Lebowitz 等 2020：SPACE 家屬退出代償試驗", href: "https://pubmed.ncbi.nlm.nih.gov/30851397/" },
      { label: "Hermida-Barros 等 2024：家庭代償最新統合分析", href: "https://pubmed.ncbi.nlm.nih.gov/38621516/" },
      { label: "Whiting 等 2023：強迫症照顧者負擔質性研究", href: "https://pubmed.ncbi.nlm.nih.gov/37138253/" },
    ],
  },
];

export default function SelfHelpPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "首頁", href: "/" }, { label: "自救專區" }]} />
      <PageHeader
        title="自救專區"
        description="從認識症狀到一線治療、藥物、第二線與新興方向：整理有理論根據與實驗支撐的研究解方，幫你知道每條路的證據站在哪裡。"
      />
      <p role="note" className="alert alert-info">
        <span aria-hidden="true">☎</span>
        <span>
          本區內容僅供學習與經驗交流，不是醫療診斷或處方。若你或身邊的人有立即危險，請立即撥打{" "}
          <a href="tel:1925" className="underline underline-offset-2 font-medium">
            安心專線 1925
          </a>
          （24 小時免費），或撥打{" "}
          <a href="tel:119" className="underline underline-offset-2">
            119
          </a>
          。任何治療決定請與醫師討論。
        </span>
      </p>

      <section aria-labelledby="selfhelp-how" className="card card-pad space-y-2">
        <h2 id="selfhelp-how" className="section-title">
          如何使用本區
        </h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted leading-relaxed">
          <li>照章節順序讀：先看懂迴圈（第一章），再看一線治療（第二、三章），最後看輔助與新興方向。</li>
          <li>對照證據等級：每種解法都標示等級，等級愈高代表研究支持愈扎實，不代表對每個人都一樣有效。</li>
          <li>卡住時求助：自助是地基不是替代，練習做不下去或症狀加重時，提早讓專業陪你判斷。</li>
        </ol>
        <ul className="flex flex-wrap gap-2 pt-1">
          {EVIDENCE.map((e) => (
            <li key={e.label} className="badge" title={e.desc}>
              {e.label}：{e.desc}
            </li>
          ))}
        </ul>
      </section>

      {CHAPTERS.map((ch) => (
        <section key={ch.id} aria-labelledby={`selfhelp-${ch.id}`} className="space-y-3">
          <h2 id={`selfhelp-${ch.id}`} className="section-title">
            {ch.no}：{ch.title}
          </h2>
          <p className="text-sm text-fg leading-relaxed">{ch.goal}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted leading-relaxed">
            {ch.points.map((p) => (
              <li key={p.slice(0, 16)}>{p}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {ch.reads.map((r) => (
              <Link key={r.href} href={r.href} className="btn btn-secondary btn-sm">
                {r.label} →
              </Link>
            ))}
          </div>
          {ch.papers.length > 0 && (
            <div className="card card-pad space-y-1">
              <p className="text-sm font-medium text-fg">關鍵論文（英文原文）</p>
              <ul className="space-y-1">
                {ch.papers.map((p) => (
                  <li key={p.href} className="text-sm">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener"
                      className="text-accent underline underline-offset-2 break-all"
                    >
                      {p.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        <Link href="/learn" className="btn btn-primary">
          回學習資源區 →
        </Link>
        <Link href="/learn/clinics" className="btn btn-secondary">
          全台診療名錄
        </Link>
      </div>
    </div>
  );
}
