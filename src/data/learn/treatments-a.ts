import type { LearnEntry } from "./types";

/**
 * 心理治療法衛教內容（TREATMENT 組，共 4 筆）。
 * - solutions 改寫為「核心技術 / 進行方式」，不帶反向連結欄位；
 *   適用症狀中文名列於各篇 overview 末段。
 * - 案例為新形狀 LearnCase：condition + tried + worked + vignette（開頭標示意改寫）
 *   + takeaway + source/sourceUrl；去識別化改寫、不貼大段、不留帳號。
 * - 全部 resource.url 與 case.sourceUrl 已於 2026-09-03 以 curl（超時 15s）驗證 < 400
 *  （Reddit 採 old.reddit.com 鏈；IOCDF 等以瀏覽器 UA 驗證）。
 */
export const entries: LearnEntry[] = [
  {
    slug: "erp",
    condition: "暴露與反應預防（ERP）",
    group: "TREATMENT",
    overview:
      "暴露與反應預防（ERP）是目前強迫症心理治療中實證基礎最扎實的一線方法，屬於認知行為治療的一支。它的基本想法是：強迫行為之所以停不下來，是因為每一次儀式都暫時趕走了焦慮，反而讓大腦把「不做儀式就會出事」的連結越練越強。在受過訓練的治療師陪同下，當事人會依事先排好的焦慮階層，由輕到重逐步接觸害怕的情境、物品或想法，也就是暴露，同時練習延後或不做原本的強迫行為，也就是反應預防，讓大腦慢慢學到焦慮會自行下降、擔心的災難並不會發生。療程通常有固定次數並搭配回家練習，強度因人而異，也可能與藥物併用，實際安排請與醫師討論。以下困擾的討論區都與本頁方法相關：污染與清洗、檢查與確認、侵入性想法、對稱與排序、囤積與丟棄困難。",
    solutions: [
      {
        name: "焦慮階層與漸進暴露",
        evidence: "strong",
        summary:
          "與治療師一起把害怕的情境按焦慮程度由小排到大，做成個人化的練習階梯。從焦慮較低的項目開始接觸，一次只練一小步，停留到焦慮自然下降再往下一階，讓大腦逐步更新對危險的預測，慢慢拿回對生活的掌控，是許多人復原的第一步。",
        steps: [
          "與治療師盤點觸發情境，排出個人化的焦慮階層",
          "從低焦慮項目開始，短時間接觸害怕的情境",
          "停留並觀察焦慮的起伏，不提早逃開",
          "記錄每次練習與焦慮變化，穩定後再往下一階",
          "把進展類化到日常生活中的類似情境",
        ],
      },
      {
        name: "反應預防與儀式管理",
        evidence: "strong",
        summary:
          "暴露的同時練習延後、縮短或不做強迫儀式，例如延後清洗、減少確認次數。重點不是硬撐，而是用事先約好的替代做法度過焦慮高峰，讓大腦學到不做儀式也不會發生災難，儀式的吸引力隨之下降，日常生活的選擇也變多了。",
        steps: [
          "列出常用的儀式，與治療師約定預防目標",
          "先從延後儀式幾分鐘開始練習",
          "用約好的替代活動度過焦慮高峰，例如散步或呼吸",
          "逐步縮短儀式時間或減少重複次數",
          "回顧進展，並為壓力期預先準備維持計畫",
        ],
      },
      {
        name: "想像暴露與類化維持",
        evidence: "strong",
        summary:
          "對於難以在現實中重演的擔心，例如害怕未來發生壞事，會在治療室中用語言或書寫生動想像擔心的情境並停留其中，同時不做心理儀式。穩定後再把所學帶回生活驗證，並為壓力期預先排練維持計畫，讓這份進步能長久維持下去。",
        steps: [
          "挑一個適合用想像處理的擔心主題",
          "在治療室中描述情境並停留其中一段時間",
          "練習不做心理儀式或反覆推演",
          "把進展帶回現實情境中驗證",
          "訂定壓力期的維持與提早求助計畫",
        ],
      },
    ],
    cases: [
      {
        title: "不再追著念頭解題的人",
        condition:
          "分享者長年受強迫想法與重複儀式困擾，生活繞著焦慮打轉，曾以為必須先消除念頭才能恢復正常，直到接觸暴露治療。",
        tried: ["反覆上網搜尋求證", "在腦中與念頭辯論", "用儀式暫時緩解焦慮"],
        worked: ["階層式暴露練習", "忍受不確定感", "把注意力放回生活"],
        vignette:
          "示意改寫：分享者過去每天花大量時間想把強迫念頭徹底想通，儀式越做越多，人卻越來越累。接觸暴露治療後，他學會不再追著每個念頭解題，而是按焦慮階層逐步接觸害怕的情境，並在焦慮中練習不做儀式。他發現主題換來換去都沒關係，重點是同一套應對方式：停留、觀察、讓焦慮自己退潮。幾個月後念頭還在，但已經指揮不動他，省下的時間回到了工作與朋友身上。",
        takeaway: "康復不是念頭消失，而是念頭不再能指揮你。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/eqyjy7/erp_shockingly_successful/",
      },
      {
        title: "畫出五個月復原曲線的人",
        condition:
          "分享者接受暴露治療約五個月，把焦慮分數畫成曲線，過程高低起伏，曾懷疑自己是不是沒有進步，靠紀錄找回信心。",
        tried: ["逃避高焦慮情境", "追求一次到位的完美暴露"],
        worked: ["每天小步驟暴露", "記錄焦慮變化追蹤進展"],
        vignette:
          "示意改寫：分享者把五個月的焦慮分數畫成一張圖，曲線一路震盪向下，高峰與倒退不斷出現。他一度很沮喪，直到回頭看見整體趨勢才確信自己在前進。他的心得是復原從來不是直線：重要的是每天辨認出儀式、選擇坐在焦慮裡一下下，而不是做一次完美的大暴露。把波動當成練習機會後，倒退不再那麼可怕，曲線也繼續緩緩向下，而他終於相信自己正在康復。",
        takeaway: "看趨勢不看單點，復原從來不是直線。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/iryp9h/graphed_my_ocd_recovery_progress_over_5_months/",
      },
    ],
    resources: [
      {
        title: "心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.jtf.org.tw/psyche/",
        blurb: "心理衛生文章、自我檢測與求助資訊，適合延伸閱讀。",
      },
      {
        title: "心理健康司",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaoh/mp-107.html",
        blurb: "心理健康政策、資源地圖與求助管道總覽。",
      },
      {
        title: "暴露與反應預防（ERP）介紹",
        org: "國際強迫症基金會（IOCDF）",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/ocd-treatment-guide/exposure-response-prevention/",
        blurb: "國際強迫症基金會撰寫的ERP原理與歷程說明。",
      },
      {
        title: "強迫症治療指引（CG31）",
        org: "英國國家健康照護卓越研究院（NICE）",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/cg31",
        blurb: "英國強迫症指引，含心理治療的分級建議。",
      },
      {
        title: "強迫症主題頁",
        org: "美國國家精神衛生研究院（NIMH）",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        blurb: "強迫症症狀、成因與治療的英文衛教總覽。",
      },
      {
        title: "ERP、氯米帕明與合併治療之隨機安慰劑對照試驗",
        org: "American Journal of Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/15625214/",
        blurb: "旗艦級隨機對照試驗，奠定 ERP 為一線心理治療的地位。",
      },
      {
        title: "服藥反應不佳者加做 CBT 之隨機對照試驗",
        org: "American Journal of Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/18316422/",
        blurb: "服藥仍困擾者，加做 ERP 比單純服藥多一分改善機會。",
      },
      {
        title: "含 ERP 之 CBT 的隨機試驗統合分析（2021）",
        org: "Comprehensive Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/33618297/",
        blurb: "多項隨機試驗的統合分析，整體支持含 ERP 的 CBT。",
      },
    ],
    boardSlug: "erp",
  },
  {
    slug: "cbt",
    condition: "認知行為治療（CBT）",
    group: "TREATMENT",
    overview:
      "認知行為治療（CBT）是一大類重視合作、有結構的心理治療，強迫症常用的暴露治療即源自這個傳統。CBT認為困擾不只來自事件本身，也來自自動化想法、情緒與行為互相強化的循環：例如把一個閃過的念頭當成警訊，焦慮上升後用儀式緩解，短暫安心卻讓疑慮下次更強。治療中會一起辨認這些循環，用提問與證據重新檢視想法，並以小步驟的行為實驗驗證擔心是否成真，逐步拿回生活的選擇權。療程通常按週進行並有回家練習，步調可與治療師商量，也可能與藥物或其他方法搭配，細節請與醫師討論。以下困擾的討論區都與本頁方法相關：污染與清洗、檢查與確認、侵入性想法、對稱與排序、囤積與丟棄困難。",
    solutions: [
      {
        name: "認識想法、情緒與行為的循環",
        evidence: "strong",
        summary:
          "第一步是把模糊的不舒服拆開來看：觸發事件引發了什麼自動化想法，帶來什麼情緒與身體感覺，又做了什麼行為去緩解。用紀錄表把循環畫出來後，常會發現真正讓困擾放大的，是想法與儀式之間的連結，而這正是後續可以練習鬆動的地方。",
        steps: [
          "挑一個近期的困擾片段一起回顧",
          "分辨事件、想法、情緒與行為四個格子",
          "用一至兩週簡單記錄循環出現的樣子",
          "與治療師一起找出重複出現的模式",
        ],
      },
      {
        name: "認知重建與行為實驗",
        evidence: "strong",
        summary:
          "針對卡住的想法，用提問檢視證據：支持與不支持這個擔心的事實各有哪些，還有沒有其他解釋。再設計小規模的行為實驗去驗證，例如延後確認一次並觀察結果，把結論寫下來取代原本的災難預測，讓想法越來越有彈性與空間。",
        steps: [
          "選一個具體且可以驗證的擔心",
          "列出支持與不支持這個擔心的證據",
          "設計小步驟的現實驗證實驗",
          "記錄結果並更新原本的想法",
          "把新結論用在下一個類似情境",
        ],
      },
      {
        name: "結構化療程與復發預防",
        evidence: "strong",
        summary:
          "CBT通常按週進行、有明確目標與回家練習，結尾會整理學到的方法做成個人手冊：哪些警訊代表壓力回升、哪些練習最有效、何時該提早求助。追蹤期會拉長回診間隔，把維持的責任逐步交還給當事人，成為自己的治療師。",
        steps: [
          "與治療師訂出具體可觀察的治療目標",
          "每週固定會談並搭配回家練習",
          "定期回顧目標達成度並調整方向",
          "整理個人維持手冊與警訊清單",
          "約定追蹤與提早求助的時機",
        ],
      },
    ],
    cases: [
      {
        title: "四年才搞懂的求助者",
        condition:
          "分享者與強迫奮戰四年才整理出心得：一般談話治療反而助長反芻，直到找到強迫症專門的治療師才真正走對路。",
        tried: ["一般談話治療", "反覆尋求保證", "獨自與念頭辯論"],
        worked: ["強迫症專門的CBT", "為念頭命名並重建", "把念頭當背景雜訊"],
        vignette:
          "示意改寫：分享者花了四年才明白，不是所有心理治療都一樣：一般的談話治療讓他越談越陷進反芻，換到專門處理強迫症的治療師後才對味。他學會為念頭命名、用證據檢視想法，把念頭當成背景雜訊而非緊急命令，也不再到處討保證。四年回顧進步很多，他把心得寫成總整理文，後來者才不用走冤枉路，這篇整理文至今仍在幫助版上的新來者。",
        takeaway: "找對專長的治療師，是少走冤枉路的關鍵。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/uhjndw/a_masterpost_of_what_ive_learned_after_a_4_year/",
      },
    ],
    resources: [
      {
        title: "心快活心理健康學習平台",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://wellbeing.mohw.gov.tw/",
        blurb: "免費心理健康課程與自我照顧的學習資源。",
      },
      {
        title: "台灣精神醫學會",
        org: "台灣精神醫學會",
        region: "TW",
        kind: "org",
        url: "https://www.tsop.org.tw/",
        blurb: "精神醫學專業學會的衛教與就醫資訊。",
      },
      {
        title: "心理治療主題頁",
        org: "美國國家精神衛生研究院（NIMH）",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/psychotherapies",
        blurb: "各類心理治療的原理與適用對象英文介紹。",
      },
      {
        title: "心理治療主題頁",
        org: "美國心理學會（APA）",
        region: "INTL",
        kind: "org",
        url: "https://www.apa.org/topics/psychotherapy",
        blurb: "心理治療如何進行、如何找治療師的說明。",
      },
      {
        title: "心理疾患事實頁",
        org: "世界衛生組織（WHO）",
        region: "INTL",
        kind: "org",
        url: "https://www.who.int/news-room/fact-sheets/detail/mental-disorders",
        blurb: "世界衛生組織的心理健康事實與數據總覽。",
      },
      {
        title: "強迫症 CBT 的二十年統合分析（1993–2014）",
        org: "Clinical Psychology Review",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/26117062/",
        blurb: "橫跨二十年研究的統合分析，比較各類 CBT 的效果。",
      },
      {
        title: "加做 CBT 與加用利培酮之隨機臨床試驗",
        org: "JAMA Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/24026523/",
        blurb: "比較加做 CBT 與加藥的試驗，供與醫師討論參考。",
      },
      {
        title: "強迫症治療實務指引（APA，2007）",
        org: "美國精神醫學會（APA）",
        region: "INTL",
        kind: "guideline",
        url: "https://psychiatryonline.org/pb/assets/raw/sitewide/practice_guidelines/guidelines/ocd.pdf",
        blurb: "美國精神醫學會的強迫症治療指引與決策參考。",
      },
    ],
    boardSlug: "cbt",
  },
  {
    slug: "act",
    condition: "接受與承諾治療（ACT）",
    group: "TREATMENT",
    overview:
      "接受與承諾治療（ACT）屬於行為治療的新發展，目標不是把不舒服的想法趕走，而是改變我們與想法的關係。它觀察到越用力對抗或壓抑念頭，念頭往往黏得越緊；ACT於是練習以好奇、不評價的態度注意到念頭來來去去，同時看清它只是腦中的語言事件，不等於事實或命令。另一方面，ACT邀請當事人釐清自己在乎的價值方向，例如學業、關係或興趣，再把省下來的力氣投入微小而具體的行動，即使不適感還在也願意往價值前進。研究顯示ACT對強迫相關困擾有中等程度的實證支持，常作為一線治療的輔助，實際搭配請與醫師討論。以下困擾的討論區都與本頁方法相關：污染與清洗、檢查與確認、侵入性想法、對稱與排序、囤積與丟棄困難。",
    solutions: [
      {
        name: "接納與願意接觸",
        evidence: "moderate",
        summary:
          "練習對不請自來的念頭與不適感說願意，為它們留一個位置而不急著消滅。例如把焦慮命名並觀察它在身體的位置與變化，發現感受會起伏、不需要立刻用儀式處理，騰出來的力氣留給真正重要的事，生活的選擇也跟著變多了。",
        steps: [
          "注意到對抗念頭時身體出現了什麼反應",
          "練習為感受命名，並觀察它的起伏",
          "用呼吸為不適感留出空間而不趕走它",
          "在日常小事中重複願意接觸的練習",
        ],
      },
      {
        name: "認知脫鉤",
        evidence: "moderate",
        summary:
          "把「我就是我的想法」的黏著鬆開：念頭只是腦中出現的語言事件。透過換句話說、放慢語速，或想像把想法投射到螢幕上等練習，拉開自己與念頭的距離，讓念頭不必下指令也能存在。距離拉開後，可以選擇的行動自然變多。",
        steps: [
          "選一個常出現的黏著想法",
          "練習加上「我注意到我有一個想法」的句式",
          "用聲音、速度或畫面的小變化拉開距離",
          "觀察可以選擇的行動是否變多了",
        ],
      },
      {
        name: "價值導向的承諾行動",
        evidence: "moderate",
        summary:
          "釐清在乎的價值方向，例如照顧家人、完成學業或投入興趣，再把大目標切成小到不可能失敗的行動。即使不適感還在，也每天做一件靠近價值的小事，讓生活品質的改善先發生，症狀的份量自然下降，一步步活成想要的樣子。",
        steps: [
          "寫下三個自己在乎的生活領域",
          "為每個領域訂一個微小具體的行動",
          "把行動排進行事曆並確實執行",
          "每週回顧進展並微調下一步",
        ],
      },
    ],
    cases: [
      {
        title: "放下拔河繩索的康復者",
        condition:
          "分享者在康復討論區回顧多年與強迫拔河的經歷：越用力對抗念頭，念頭纏得越緊，生活縮小到只剩儀式與逃避。",
        tried: ["用力壓抑與推開強迫念頭", "反覆在腦中自證清白"],
        worked: ["認知脫鉤：把念頭當心理事件", "價值導向的小行動", "配合暴露練習"],
        vignette:
          "示意改寫：分享者形容過去像每天和強迫拔河，贏了也精疲力竭。後來他學會放下繩索：念頭來時為它命名，提醒自己這只是腦中的語言事件，不必聽令；同時把在乎的價值寫下來，每天做一件靠近價值的小事，即使不適感還在。暴露練習仍是主菜，接納的態度則讓他終於吃得下。回顧時他說，目標從感覺變好換成活得更好，而這一路的每一步都算數。",
        takeaway: "放下繩索不是認輸，而是換一種贏法。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCDRecovery/comments/1gj6y1i/id_like_to_hear_some_success_stories/",
      },
    ],
    resources: [
      {
        title: "精神醫學部",
        org: "臺大醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/omas/Fpage.action?muid=7146&fuid=7153",
        blurb: "醫學中心精神科的就醫與衛教資訊。",
      },
      {
        title: "長庚醫療體系",
        org: "長庚紀念醫院",
        region: "TW",
        kind: "org",
        url: "https://www.cgmh.org.tw/",
        blurb: "各院區精神科門診與心理衛生資源查詢。",
      },
      {
        title: "ACT與強迫症",
        org: "國際強迫症基金會（IOCDF）",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/ocd-treatment-guide/act/",
        blurb: "國際強迫症基金會的ACT應用英文說明。",
      },
      {
        title: "給大眾的ACT介紹",
        org: "情境行為科學協會（ACBS）",
        region: "INTL",
        kind: "org",
        url: "https://contextualscience.org/act_for_the_public",
        blurb: "ACT國際學會給一般大眾的入門資源。",
      },
      {
        title: "ACT 與放鬆訓練比較之隨機試驗",
        org: "J Consult Clin Psychol",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/20873905/",
        blurb: "ACT 減輕強迫症狀的隨機試驗，效果不亞於放鬆訓練。",
      },
      {
        title: "ACT 用於強迫症的統合分析（2022）",
        org: "Brain Sciences",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/35625042/",
        blurb: "統合多項研究，支持 ACT 作為一線治療的輔助。",
      },
    ],
    boardSlug: "act",
  },
  {
    slug: "mindfulness",
    condition: "正念（Mindfulness）",
    group: "TREATMENT",
    overview:
      "正念是刻意把注意力帶回當下，並以不評價的態度覺察呼吸、身體感受與念頭起伏的練習，後來被整理成減壓與認知療法等團體課程。正念不要求清空大腦，也不保證症狀消失；它練的是提早注意到又被念頭捲走的那一刻，然後溫和地把注意力帶回來，減少立刻以儀式滅火的衝動。研究顯示正念對焦慮、憂鬱等情緒困擾有中等程度的幫助，對強迫症狀本身的證據仍在累積，定位是輔助而非取代一線治療，是否適合請與醫師討論，練習中若感到強烈不適也請暫停並尋求協助。以下困擾的討論區都與本頁方法相關：污染與清洗、檢查與確認、侵入性想法、對稱與排序、囤積與丟棄困難。",
    solutions: [
      {
        name: "正念呼吸與身體掃描",
        evidence: "moderate",
        summary:
          "每天固定幾分鐘，把注意力放在呼吸或依序掃過身體各部位，分心時溫和帶回。這個基本功練的是提早察覺被念頭捲走的那一刻，為後續選擇不做儀式爭取幾秒鐘的空間；初學者請從短時間開始，別貪多，穩定的覺察力是慢慢養成的。",
        steps: [
          "選一個固定時段，從三到五分鐘開始",
          "跟隨呼吸或身體感受，不評價好壞",
          "分心時注意到發生了什麼，再溫和帶回",
          "逐漸延長並固定為日常習慣",
        ],
      },
      {
        name: "念頭的正念觀察",
        evidence: "moderate",
        summary:
          "把侵入性想法當成天空飄過的雲來觀察：注意到它、為它命名，然後回到呼吸。不跟念頭辯論也不壓抑，練習讓念頭存在但不指揮行動，搭配每天短暫的呼吸空間，在焦慮升溫時及早踩煞車。多練習幾次，煞車會越來越靈敏好用。",
        steps: [
          "靜坐中為出現的念頭簡單命名",
          "練習不追隨也不推開，只是觀察",
          "每天安排短暫的呼吸空間暫停",
          "在焦慮升溫時用觀察取代立刻儀式",
        ],
      },
      {
        name: "正念作為一線治療的輔助",
        evidence: "emerging",
        summary:
          "目前研究多把正念放在輔助位置：先以暴露等一線方法處理核心症狀，再用正念照顧殘餘的焦慮與反覆。若想把正念帶進治療，請與醫師討論順序與份量，並選擇有臨床訓練的帶領者，不要自行取代正規治療，安全永遠是第一位。",
        steps: [
          "先與醫師確認目前的一線治療計畫",
          "討論正念要放在哪個階段、每週多少份量",
          "選擇有臨床訓練的課程或帶領者",
          "定期回顧輔助效果並調整方向",
        ],
      },
    ],
    cases: [
      {
        title: "從清空大腦到觀察雲的人",
        condition:
          "分享者受侵入性想法困擾多年，靜坐時念頭反而更吵，曾懷疑自己不適合正念，一度因此更加焦慮自責，走了不少彎路。",
        tried: ["強迫自己清空大腦", "長時間靜坐硬撐", "用冥想趕走特定念頭"],
        worked: ["短時間呼吸錨定", "不評價地觀察念頭", "把正念當輔助而非替代治療"],
        vignette:
          "示意改寫：分享者一開始把冥想當成消除念頭的工具，越想靜越靜不下來，還多了自責。調整後，他改成每天幾分鐘跟著呼吸，走神了就溫和帶回，把念頭當成飄過的雲，只看不追。他說最大的收穫是多出幾秒鐘的空間，能在儀式衝動和行動之間踩煞車；正念沒有取代他的正規治療，卻讓治療的路好走許多，也讓他相信自己有能力繼續走下去。",
        takeaway: "觀察而不追趕，就是給大腦的煞車。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/Mindfulness/comments/1beualj/what_benefits_does_meditation_have_with_someone/",
      },
    ],
    resources: [
      {
        title: "衛生福利部",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://mohw.gov.tw/mp-1.html",
        blurb: "中央主管機關的政策、資源與求助管道。",
      },
      {
        title: "董氏基金會心理衛生專區",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.jtf.org.tw/psyche/melancholia/",
        blurb: "心理衛生文章與情緒困擾的自我照顧資訊。",
      },
      {
        title: "正念學習資源",
        org: "牛津正念中心",
        region: "INTL",
        kind: "org",
        url: "https://www.oxfordmindfulness.org/learn-mindfulness/",
        blurb: "牛津大學正念中心的課程與研究介紹。",
      },
      {
        title: "成人憂鬱症指引（CG90）",
        org: "英國國家健康照護卓越研究院（NICE）",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/cg90",
        blurb: "英國指引中關於正念認知療法的建議。",
      },
      {
        title: "正念與接納課程的統合分析（2025）",
        org: "J Anxiety Disord",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/39862744/",
        blurb: "統合研究顯示正念課程對強迫症狀有中等程度幫助。",
      },
      {
        title: "正念用於強迫症的原理與研究回顧",
        org: "Expert Rev Neurother",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/38889066/",
        blurb: "回顧正念提早察覺念頭、減少儀式衝動的作用。",
      },
    ],
    boardSlug: "mindfulness",
  },
];
