import type { LearnEntry } from "./types";

/**
 * 症狀頁 A：污染與清洗 / 確認與檢查 / 對稱與排列
 *
 * - 全繁中，去污名、不診斷、不斷言療效。
 * - 案例為去識別化綜合改寫（不貼原文大段、不留帳號），忠於來源主題；
 *   來源為 Reddit r/OCD、r/OCDRecovery 貼文，sourceUrl 於 2026-09-03
 *   以 curl（瀏覽器 UA）驗證回傳 200。
 * - 資源 URL 亦於同日以 curl 驗證回傳 200。
 */
export const entries: LearnEntry[] = [
  {
    slug: "contamination",
    condition: "污染與清洗",
    group: "SYMPTOM",
    overview:
      "污染與清洗是強迫症常見的表現之一：腦中反覆出現怕髒、怕細菌或怕生病的念頭，明明知道實際風險不高，卻難以擺脫不安，於是透過反覆洗手、過度清潔、要求家人配合，或迴避大眾運輸、廁所等場所來換取暫時的安心。然而安心通常維持不久，不安很快回來，清洗的標準也可能越墊越高，進而佔去大量時間，影響工作、人際與日常生活。這些反應並不是愛乾淨或意志力不足，而是大腦的警報系統過於敏感所致。若相關困擾持續且影響生活，建議至精神科、身心科或臨床心理專業求助，也可以先從本站討論區與學習資源開始認識它。",
    solutions: [
      {
        name: "暴露與反應預防（ERP）",
        evidence: "strong",
        summary:
          "暴露與反應預防是目前實證基礎最扎實的強迫症心理治療，會在專業人員陪伴下，依序面對引發污染擔憂的情境，同時練習不執行清洗儀式，讓大腦重新學習與不安共處。研究顯示它對多數污染與清洗困擾有幫助，實際效果因人而異，需由專業人員評估安排。",
        steps: [
          "與專業人員一起列出困擾情境的難易順序表",
          "從負擔較小的一項開始，逐步接觸擔憂的情境",
          "接觸後練習延後或不做清洗儀式，並記錄感受變化",
          "定期回顧進展，由專業人員調整後續練習方向",
        ],
        linkSlug: "erp",
      },
      {
        name: "藥物治療評估",
        evidence: "strong",
        summary:
          "部分中重度困擾者經醫師評估後，可能適合以血清素相關藥物輔助治療，目標是降低強迫意念與焦慮的強度，讓心理治療與日常練習更容易進行。用藥種類、劑量與期間需由精神科或身心科醫師個別判斷，不建議自行開始或停藥。",
        steps: [
          "至精神科或身心科門診完整說明困擾與病史",
          "與醫師討論藥物選擇、可能的副作用與追蹤計畫",
          "依醫囑規律服藥並回診，不自行增減或停藥",
          "將用藥變化與感受記錄下來，回診時提供醫師參考",
        ],
        linkSlug: "medication",
      },
      {
        name: "自助管理與生活調適",
        evidence: "moderate",
        summary:
          "在接受專業協助的同時，規律作息、適度運動、記錄清洗觸發點與因應方式，有助於更了解自己的困擾模式，也能讓回診或會談更有效率，並在低潮時提醒自己曾經的進步。自助策略屬於輔助性質，若困擾加重或難以負荷，請優先尋求專業協助。",
        steps: [
          "記錄引發清洗衝動的情境、想法與持續時間",
          "維持規律睡眠、飲食與適度活動，穩定身心狀態",
          "與信任的親友約定支持方式，減少臨時安撫儀式",
          "定期整理紀錄，在回診或會談時與專業人員討論",
        ],
        linkSlug: "self-help",
      },
    ],
    cases: [
      {
        title: "示意改寫一：從反覆洗手到逐步減量",
        condition:
          "長期因害怕污染而反覆洗手，明知已經洗得很乾淨仍停不下來，外出與工作安排大受影響，並伴隨明顯的焦慮與疲憊。",
        tried: ["反覆清洗並不斷延長洗手時間", "要求身邊的人保證已經乾淨"],
        worked: ["暴露與反應預防：由淺入深逐步減少清洗"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者曾每天花大量時間洗手，碰過門把或外出回來就要重洗，明明知道已經洗得夠乾淨，腦中擔憂生病的念頭卻揮之不去。後來在專業人員協助下，他列出由易到難的練習順序，從縮短洗手時間、延後清洗開始，一次只挑戰一小步。焦慮升高時不再立刻沖水，而是記錄感受、做別的事度過高峰。數月後洗手次數明顯下降，他說最大的改變不是不再害怕，而是不再被害怕指揮生活。",
        takeaway: "一次只練一小步，累積起來就是生活的改變。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/atk23b/recovering_from_hand_washing/",
      },
      {
        title: "示意改寫二：把生活重心拿回來",
        condition:
          "污染擔憂伴隨大量迴避行為，不敢搭大眾運輸、不敢碰觸公共物品，活動範圍越縮越小，連重視的社交與運動都停擺了。",
        tried: ["迴避公共場所與一切可疑觸碰", "自行摸索放鬆方法，效果只能維持片刻"],
        worked: ["暴露與反應預防", "藥物輔助降低焦慮基線", "把重視的日常活動排回生活"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者因害怕污染而逐漸足不出戶，連喜歡的活動都放棄了。就醫後醫師評估搭配藥物，先把整體焦慮強度降下來，他才有力氣開始做暴露練習。同時他刻意把運動與朋友聚會排回行事曆，用有價值的事填滿時間。復原並非直線，偶爾仍會倒退，但他學會把倒退看成過程的一部分，而不是前功盡棄，生活圈也慢慢擴大回來。",
        takeaway: "復原不只靠減少儀式，也靠把重視的生活找回來。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCDRecovery/comments/1d6y9be/how_i_mostly_recovered_from_contamination_ocd/",
      },
    ],
    resources: [
      {
        title: "心理健康司",
        org: "衛生福利部心理健康司",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaohw/",
        blurb: "政府心理健康政策與求助資訊入口",
      },
      {
        title: "心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.etmh.org/",
        blurb: "提供心理衛生教育與憂鬱焦慮防治資訊",
      },
      {
        title: "臺大醫院",
        org: "國立臺灣大學醫學院附設醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/",
        blurb: "醫學中心精神醫學部就醫與衛教資訊",
      },
      {
        title: "長庚醫療財團法人",
        org: "長庚醫療財團法人",
        region: "TW",
        kind: "org",
        url: "https://www.cgmh.org.tw/",
        blurb: "各院區精神科門診與心理健康衛教資源",
      },
      {
        title: "About OCD",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/what-is-ocd/",
        blurb: "國際強迫症基金會的強迫症認識專頁",
      },
      {
        title: "Obsessive-Compulsive Disorder (OCD)",
        org: "National Institute of Mental Health",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        blurb: "美國國家精神衛生研究院的強迫症主題頁",
      },
      {
        title: "Obsessive-compulsive disorder and BDD (NG203)",
        org: "National Institute for Health and Care Excellence",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/ng203",
        blurb: "英國 NICE 強迫症診療指引全文",
      },
    ],
    boardSlug: "contamination",
  },
  {
    slug: "checking",
    condition: "確認與檢查",
    group: "SYMPTOM",
    overview:
      "確認與檢查常見的樣貌是：一再回頭檢查門鎖、瓦斯、電源、信件內容或訊息是否傳錯，明明剛檢查過，心裡卻浮現萬一沒做好的念頭，只好再檢查一次。短暫放心之後，懷疑很快又回來，檢查次數越來越多，出門、上班或就寢都可能被耽擱，也常讓身邊的人感到壓力。這並不是粗心或不負責任，而是對不確定感與責任感過度警覺的表現。若檢查行為已佔去大量時間或引起明顯痛苦，建議至精神科、身心科或臨床心理專業談談，也可以先在本站討論區看看其他人的經驗分享。",
    solutions: [
      {
        name: "暴露與反應預防（ERP）",
        evidence: "strong",
        summary:
          "針對確認與檢查，暴露與反應預防會在專業人員引導下，練習在檢查一次後就離開現場、忍住不再回頭，並觀察焦慮自然起伏的過程。多次練習後，大腦會逐漸學會容忍不確定感。計畫需個別設計，建議由熟悉強迫症的專業人員陪同進行。",
        steps: [
          "與專業人員列出常檢查的項目與難易順序",
          "約定每次只檢查一次的具體做法與提醒語",
          "練習離開現場並延後回頭，用其他活動度過焦慮",
          "記錄每次的焦慮變化，回診時與專業人員檢討",
        ],
        linkSlug: "erp",
      },
      {
        name: "認知行為治療（CBT）",
        evidence: "strong",
        summary:
          "認知行為治療會協助辨識檢查背後的想法，例如高估危險、高估自身責任或要求百分之百確定，並透過行為實驗逐步修正。對於被反覆懷疑困住的人，認知工作能補強暴露練習的效果，實務上常與暴露與反應預防結合，由治療師依個別狀況安排。",
        steps: [
          "寫下檢查當下浮現的擔憂想法與災難化預期",
          "與治療師一起檢視證據，評估實際風險比例",
          "設計小規模行為實驗，驗證不檢查會發生什麼事",
          "把學到的新觀點整理成提醒卡，焦慮時取用",
        ],
        linkSlug: "cbt",
      },
      {
        name: "家人支持與溝通",
        evidence: "moderate",
        summary:
          "家人代為檢查或頻繁保證看似幫忙，長期卻可能維持檢查循環。家人支持的重點是理解這是症狀而非故意找麻煩，一起約定回應方式，例如以傾聽取代保證，並鼓勵當事人持續接受專業協助，讓家庭氣氛與復原方向一致，全家人一起往同一個方向走。",
        steps: [
          "一起認識確認與檢查的循環，減少責備與誤解",
          "約定面對要求保證時的統一回應方式",
          "把省下的檢查時間轉為共同的休閒或休息安排",
          "必要時家人也可尋求心理專業的諮詢支持",
        ],
        linkSlug: "family-support",
      },
    ],
    cases: [
      {
        title: "示意改寫三：只檢查一次就離開",
        condition:
          "每天出門前反覆確認門鎖與爐具，走到半路仍忍不住折返查看，遲到與精神耗竭成為日常，工作表現也開始受影響。",
        tried: ["拍照存證、請家人再三保證", "在腦中反覆推演確認是否關好"],
        worked: ["暴露與反應預防：檢查一次後就離開現場", "認知行為：辨識並修正災難化想法"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者出門總要確認門鎖好幾次，有時都走遠了還得回頭，拍照與家人的保證只能安心幾分鐘。他後來學到關鍵不在檢查得更仔細，而是練習檢查一次就離開，帶著不確定感繼續往前走。搭配把萬一沒關好的災難化想法寫下來逐一檢視，焦慮發作的次數慢慢下降。他說學會信任那一次認真的檢查，是整個轉變的起點。",
        takeaway: "多檢查一次不會更安全，學會停在一次才會更自由。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/ywjlom/anyone_know_any_good_tricks_to_stop_me_from/",
      },
      {
        title: "示意改寫四：不再被懷疑牽著走",
        condition:
          "明明已經檢查過，卻不信任自己的記憶與感官，不斷回頭確認，連寄出的信件與訊息都要反覆打開檢查，睡眠與信心都受影響。",
        tried: ["一再回頭檢查同一項目", "反覆詢問同事與家人求保證"],
        worked: ["暴露與反應預防", "家人支持：以傾聽取代保證"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者並非能力不足，而是被對犯錯的過度擔憂綁住：檢查完仍覺得不算數，非得再看一次才安心。他練習把懷疑標記為症狀的聲音，而不是事實的提醒，並和家人約定不再提供保證，改以傾聽陪伴。少了保證的短暫止渴，他反而有機會體驗焦慮自己退去，檢查的衝動也逐漸鬆動，睡眠品質跟著改善。",
        takeaway: "把懷疑當成症狀的聲音，而不是事實的提醒。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/10ze8sl/anyone_has_this_checking_ocd_type_where_you_just/",
      },
    ],
    resources: [
      {
        title: "心理健康司",
        org: "衛生福利部心理健康司",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaohw/",
        blurb: "政府心理健康政策與求助資訊入口",
      },
      {
        title: "心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.etmh.org/",
        blurb: "提供心理衛生教育與憂鬱焦慮防治資訊",
      },
      {
        title: "臺大醫院",
        org: "國立臺灣大學醫學院附設醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/",
        blurb: "醫學中心精神醫學部就醫與衛教資訊",
      },
      {
        title: "長庚醫療財團法人",
        org: "長庚醫療財團法人",
        region: "TW",
        kind: "org",
        url: "https://www.cgmh.org.tw/",
        blurb: "各院區精神科門診與心理健康衛教資源",
      },
      {
        title: "About OCD",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/",
        blurb: "國際強迫症基金會的強迫症認識與求助專頁",
      },
      {
        title: "Obsessive-compulsive disorder and BDD (NG203)",
        org: "National Institute for Health and Care Excellence",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/ng203",
        blurb: "英國 NICE 強迫症診療指引全文",
      },
      {
        title: "Obsessive-Compulsive and Related Disorders",
        org: "American Psychiatric Association",
        region: "INTL",
        kind: "org",
        url: "https://www.psychiatry.org/patients-families/obsessive-compulsive-disorder",
        blurb: "美國精神醫學會的強迫症衛教專頁",
      },
    ],
    boardSlug: "checking",
  },
  {
    slug: "symmetry",
    condition: "對稱與排列",
    group: "SYMPTOM",
    overview:
      "對稱與排列的困擾常表現為：物品一定要擺正、對齊或左右一致，動作要做到感覺對了才行，否則心裡就像卡著一根刺，渾身不對勁。這種不對勁未必來自具體的害怕，更多的是一種就是不對的內在張力，於是反覆調整、觸碰、重做，直到緊繃暫時鬆開。過程可能耗去大量時間，也可能因堅持特定順序而與家人起摩擦。這不是龜毛或完美主義的標籤可以解釋的，而是一種需要被理解的症狀。若困擾持續影響生活，建議尋求精神科、身心科或臨床心理專業的評估與陪伴。",
    solutions: [
      {
        name: "暴露與反應預防（ERP）",
        evidence: "strong",
        summary:
          "針對對稱與排列，暴露與反應預防會練習刻意留下輕微的不對齊或不照順序做，並忍住不立刻修正，去體驗那股不對勁如何升起又慢慢下降。在專業人員協助下由淺入深練習，有助於擴大對不完美的容忍度，實際安排需個別評估。",
        steps: [
          "與專業人員列出觸發不對勁感的情境清單",
          "從輕微的不對齊開始，練習不立刻修正",
          "以計時或活動轉移度過張力高峰並做紀錄",
          "逐步提高難度，定期與專業人員檢討方向",
        ],
        linkSlug: "erp",
      },
      {
        name: "接納與承諾治療（ACT）",
        evidence: "moderate",
        summary:
          "接納與承諾治療著重學習與不對勁感共處，把注意力放回真正重視的生活方向，而不是花整天把每件事做到感覺對了。它常作為整體治療的一部分，與暴露練習搭配使用，適合在專業人員引導下進行，重點是找回生活的自主感，效果因人而異。",
        steps: [
          "辨識不對勁感出現時身體與想法的變化",
          "練習以觀察取代立刻修正，給感受留一點空間",
          "釐清自己重視的生活方向與近期小目標",
          "把省下的時間投入一件有價值的日常活動",
        ],
        linkSlug: "act",
      },
      {
        name: "正念練習",
        evidence: "emerging",
        summary:
          "正念練習透過觀察呼吸與身體感覺，培養面對衝動時不馬上反應的停頓能力，可能有助於面對不對勁感時穩定情緒、做好自我調節。目前它對強迫症狀的直接證據仍有限，屬於輔助性質，開始前請與醫師或治療師討論，不取代正規治療。",
        steps: [
          "與醫師或治療師討論是否適合加入正念練習",
          "從每天短時間的呼吸觀察開始建立習慣",
          "把練習中學到的停頓用在想修正的小時刻",
          "記錄練習頻率與感受，回診時一併討論",
        ],
        linkSlug: "mindfulness",
      },
    ],
    cases: [
      {
        title: "示意改寫五：與不對勁感共處",
        condition:
          "物品必須擺正對齊、事情要做到感覺對了才行，否則整天渾身不對勁，睡前整理常耗去一兩個小時，白天精神與課業都受影響。",
        tried: ["反覆調整排列直到感覺對了", "避開容易變亂的場所與活動"],
        worked: ["暴露與反應預防：刻意留下輕微不對齊", "接納取向：把時間轉回重視的生活目標"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者形容那種感覺不像害怕，更像心裡發癢：東西稍歪就得重排，否則什麼事都做不下去。他後來練習刻意讓書架留一本微歪的書，忍住不去扶正，體會那股不對勁升起又慢慢退去。同時他把省下的時間拿去做真正想做的事，而不是等感覺對了才開始。他說這不是完美主義，而是大腦的警報太敏感，理解這點後自責少了很多。",
        takeaway: "這不是追求完美，而是需要被理解的敏感警報。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/1gpcrgl/anyone_else_here_with_the_just_right_subtype_of/",
      },
      {
        title: "示意改寫六：左右成對的步伐",
        condition:
          "走路與觸碰講究左右成對，少一邊就要補一下，否則整天覺得怪；怕被旁人注意而逐漸減少外出，人際也跟著疏遠。",
        tried: ["重複動作直到兩邊感覺一致", "減少外出以避開他人目光"],
        worked: ["暴露與反應預防", "正念練習輔助自我調節（經專業人員同意後進行）"],
        vignette:
          "示意改寫：以下為去識別化綜合改寫，非原文直譯。原分享者走路若一腳先碰到線，另一腳也要補一下，開關與觸碰都要成對，否則怪感揮之不去。朋友以為只是講究，他卻越來越累。在輔導老師鼓勵下就醫後，他開始練習打破左右成對的規則，並以短時間呼吸觀察幫自己度過想重做的衝動。他說第一次知道這種怪感有名字、也有人懂，比任何技巧都先讓他鬆了一口氣。",
        takeaway: "說不出口的怪感值得被認真對待，輔導與醫療都是可用的門。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/1e1mli0/whats_your_experience_of_just_right_ocd/",
      },
    ],
    resources: [
      {
        title: "心理健康司",
        org: "衛生福利部心理健康司",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaohw/",
        blurb: "政府心理健康政策與求助資訊入口",
      },
      {
        title: "心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.etmh.org/",
        blurb: "提供心理衛生教育與憂鬱焦慮防治資訊",
      },
      {
        title: "長庚醫療財團法人",
        org: "長庚醫療財團法人",
        region: "TW",
        kind: "org",
        url: "https://www.cgmh.org.tw/",
        blurb: "各院區精神科門診與心理健康衛教資源",
      },
      {
        title: "華人正念減壓中心",
        org: "華人正念減壓中心",
        region: "TW",
        kind: "course",
        url: "https://www.mindfulness.com.tw/",
        blurb: "正念減壓課程與練習資源介紹",
      },
      {
        title: "About OCD",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/",
        blurb: "國際強迫症基金會的強迫症認識與求助專頁",
      },
      {
        title: "Obsessive-Compulsive Disorder (OCD)",
        org: "National Institute of Mental Health",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        blurb: "美國國家精神衛生研究院的強迫症主題頁",
      },
      {
        title: "Mental disorders",
        org: "World Health Organization",
        region: "INTL",
        kind: "org",
        url: "https://www.who.int/news-room/fact-sheets/detail/mental-disorders",
        blurb: "世界衛生組織心理疾患事實說明文件",
      },
    ],
    boardSlug: "symmetry",
  },
];
