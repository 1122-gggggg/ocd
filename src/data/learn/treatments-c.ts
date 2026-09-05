import type { LearnEntry } from "./types";

/**
 * 治療法 C 組：森田療法 / 網路與數位 CBT / 腦刺激治療。
 * 全繁中，去污名、不診斷、不承諾療效；論文與指引 URL 均以 curl 實際驗證（< 400）。
 * 實證多為中小型試驗，solutions 僅標 moderate／emerging，無 strong；侵入性選項附嚴格警語。
 */
export const entries: LearnEntry[] = [
  {
    slug: "morita",
    condition: "森田療法",
    group: "TREATMENT",
    overview:
      "森田療法由日本精神科醫師森田正馬於約一九一九年創立，原用於治療神經質，也就是對身心不適過度敏感、愈想控制反而被纏得愈緊的狀態，後來延伸至強迫、社交焦慮等困擾。它的核心原則有二：順應自然，把焦慮與念頭視為會起伏的自然現象，不再用儀式或壓抑強求消除；為所當為，把力氣放回眼前該做的生活行動，讓注意力在行動中自然轉移。傳統住院森田分為臥床靜養、輕作業、重作業、社會適應四期，現代則多為門診晤談搭配日記指導的形式。與暴露與反應預防同樣重視行動，但森田不直接挑戰恐懼，而是經由生活本身轉化關係，兩者也可搭配。目前實證多為中小型中日試驗且品質有限，台灣亦少見專門服務，安排請與醫師討論。",
    solutions: [
      {
        name: "順應自然的行動原則",
        evidence: "moderate",
        summary:
          "森田療法觀察到，強迫的痛苦一半來自症狀本身，一半來自與症狀的纏鬥：愈想把念頭連根拔起，念頭愈像影子般跟著走。順應自然不是放棄，而是承認焦慮與念頭會自然起伏，把原本用來對抗的力氣轉向眼前能做的事。當行動先恢復，症狀的份量往往跟著改變，生活的主導權也回到自己手上，這正是多項中日試驗中功能改善的共同方向。",
        steps: [
          "注意到自己正在與念頭纏鬥的時刻",
          "練習把感受命名為自然現象而不評價它",
          "問自己此刻生活中該做的一件小事",
          "先行動十分鐘再回頭看感受的變化",
          "每天記下行動與感受的簡短對照",
        ],
      },
      {
        name: "住院四期與門診形式",
        evidence: "moderate",
        summary:
          "傳統住院森田分為四期：絕對臥床靜養、輕作業、重作業、社會適應，透過作息與勞動重建生活節奏；現代則多為門診晤談搭配日記，治療師以批語引導當事人看見行動的進展。兩種形式目標一致：不是等不焦慮了才生活，而是在生活中讓焦慮自然退位。台灣目前少見完整住院森田，實際參與方式與可近資源請與醫師討論。",
        steps: [
          "了解住院與門診兩種形式的差異與負擔",
          "與醫師討論自身狀況適合的形式",
          "若採門診形式，規律記錄作息與行動日記",
          "回診時與治療師一起檢視行動的變化",
          "把穩定的作息逐步帶回日常生活",
        ],
      },
      {
        name: "與暴露與反應預防併用",
        evidence: "emerging",
        summary:
          "森田對症狀的接納態度，可作為暴露練習的心理底座：暴露負責鬆動恐懼連結，森田負責把省下的力氣投入生活，兩者方向一致，學者比較研究亦指出森田與接納取向氣質相近。但兩法併用的強迫症專門研究仍少，多為合併藥物的試驗，效果與風險尚無定論，是否併用、如何排序請務必與醫師討論，切勿自行停藥或更動治療計畫。",
        steps: [
          "先與醫師確認目前的一線治療計畫",
          "提出想加入森田觀點的想法並聽取評估",
          "不自行停藥或更動暴露練習的安排",
          "觀察併用後生活功能的變化並回報醫師",
          "定期與醫師檢討是否繼續或調整",
        ],
      },
    ],
    cases: [
      {
        title: "為所當為的上班族",
        condition:
          "當事人長期受檢查困擾，出門反覆確認門窗瓦斯，常因此遲到；也曾用力壓抑念頭，反而整天心神不寧，工作與睡眠都受影響。",
        tried: ["用力壓抑強迫念頭", "出門前反覆確認到安心為止"],
        worked: ["為所當為：先做眼前的工作", "門診式行動日記"],
        vignette:
          "【示意改寫】綜合常見經驗改寫，非特定個人。他過去要求零焦慮才出門，結果愈確認愈晚。在治療師引導下，他練習把確認的衝動當成會起伏的自然現象，同時每天寫下三件該做的事，先行動十分鐘再說。遇到特別難的日子，他允許自己只完成最小版本的三件事，不責備也不熬夜補做，隔天再回到原本的節奏。幾個月後遲到變少了，確認的次數也跟著下降。他說，焦慮還在，但生活先回來了，而這就值得繼續走下去。",
        takeaway: "先行動，焦慮會在生活中自然退位。",
        source: "other",
        sourceUrl:
          "https://books.google.com/books/about/Morita_Therapy_and_the_True_Nature_of_An.html?id=8FKn7cBtFgsC",
      },
      {
        title: "照著作息走的備考生",
        condition:
          "當事人受清洗困擾，洗手洗到脫皮仍停不下來，家事與備考進度全面停擺；曾嚴格要求環境零碰觸，結果活動範圍愈縮愈小。",
        tried: ["要求環境零碰觸", "洗到覺得乾淨為止"],
        worked: ["固定作息與家事行動", "順應自然：允許不適感存在"],
        vignette:
          "【示意改寫】綜合常見經驗改寫，非特定個人。她把一天切成作息表，煮飯、打掃、讀書各有時段，洗手保留但不再加碼；不適感來時提醒自己這是自然現象，繼續把手邊的事做完。遇到波動復發的日子，她不再把作息表丟掉重來，而是隔天照常接回去，慢慢發現破功一次也不等於前功盡棄。作息穩定幾週後，洗手的時間慢慢縮短，讀書進度也動起來了。她說，日子有了秩序，症狀就沒那麼大聲了。",
        takeaway: "作息先穩下來，症狀的音量會跟著調小。",
        source: "other",
        sourceUrl: "https://www.ntuh.gov.tw/omas/Fpage.action?muid=7146&fuid=7153",
      },
    ],
    resources: [
      {
        title: "森田療法治強迫症：系統性回顧與統合分析",
        org: "Australasian Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/35285288/",
        blurb: "森田合併藥物對強迫症療效的統合分析，共二十一項試驗。",
      },
      {
        title: "成人焦慮症的森田療法考科藍回顧",
        org: "Cochrane Database of Systematic Reviews",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/25695214/",
        blurb: "考科藍回顧：七項小型試驗，證據品質極低、尚無定論。",
      },
      {
        title: "森田療法百年回顧",
        org: "Asia-Pacific Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/35403327/",
        blurb: "日本團隊回顧森田百年源流、四期架構與門診演變。",
      },
      {
        title: "精神醫學部",
        org: "臺大醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/omas/Fpage.action?muid=7146&fuid=7153",
        blurb: "醫學中心精神科的就醫與衛教資訊。",
      },
      {
        title: "心理健康司",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaoh/",
        blurb: "心理健康政策、資源與求助管道總覽。",
      },
      {
        title: "日本森田療法学会",
        org: "日本森田療法学会",
        region: "INTL",
        kind: "org",
        url: "https://www.jps-morita.jp/",
        blurb: "日本森田療法學會官網，日文為主的學會與治療介紹。",
      },
      {
        title: "森田療法與焦慮性疾患的真貌",
        org: "SUNY Press",
        region: "INTL",
        kind: "book",
        url: "https://books.google.com/books/about/Morita_Therapy_and_the_True_Nature_of_An.html?id=8FKn7cBtFgsC",
        blurb: "森田正馬原著英譯，四期架構與順應自然的經典說明。",
      },
      {
        title: "強迫症治療總覽",
        org: "國際強迫症基金會（IOCDF）",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/ocd-treatment/",
        blurb: "國際強迫症基金會的強迫症治療英文總覽。",
      },
    ],
    boardSlug: "self-help",
  },
  {
    slug: "icbt",
    condition: "網路與數位認知行為治療",
    group: "TREATMENT",
    overview:
      "網路與數位認知行為治療是把認知行為治療的內容搬到網路上進行的治療形式，通常包含衛教文字、練習作業與症狀追蹤，再依治療師參與程度分成兩種：治療師引導式會由專業人員透過訊息或視訊回饋作業、調整進度；純自助式則完全自己閱讀與練習，不與治療師互動。研究顯示，有治療師引導的網路治療對強迫症狀有中等程度的實證支持，效果接近面對面治療，特別適合就醫不便、時間難配合或青少年族群；純自助課程的證據仍有限，定位為輔助或入門。數位工具不能取代專業評估，若症狀嚴重、有共病或出現自我傷害的念頭，務必優先就醫並與醫師討論。",
    solutions: [
      {
        name: "治療師引導式網路治療",
        evidence: "moderate",
        summary:
          "每週在線上閱讀治療模組並完成暴露與反應預防等作業，治療師透過訊息或視訊給予回饋、調整難度。隨機試驗顯示它能明顯改善成人與青少年的強迫症狀，適合往返門診困難、課業工作難請假，或居住地缺乏專長治療師的人，開始前請先經精神科或臨床心理師評估是否合適。",
        steps: [
          "先經醫師或臨床心理師評估是否適合線上進行",
          "每週固定時間完成線上模組與回家練習",
          "主動向治療師回報作業困難與症狀變化",
          "依回饋調整暴露階層的難度與速度",
          "療程結束後與治療師擬定維持與復發因應計畫",
        ],
      },
      {
        name: "純自助線上課程",
        evidence: "emerging",
        summary:
          "完全自己閱讀教材、看影片並練習技巧，沒有治療師回饋，彈性最高但少了外部檢核。目前針對強迫症的證據仍有限，只能當作認識症狀的入門或正規治療的輔助，不能取代專業評估與治療。若練習後症狀未改善、加重或出現強烈不適，請停下來並儘速與醫師討論，切勿獨自硬撐。",
        steps: [
          "選擇可信機構出版、有實證基礎的課程",
          "先與醫師討論自助課程在整體計畫中的位置",
          "照課程進度練習並記錄症狀變化",
          "未改善或加重時暫停並回診討論",
        ],
      },
      {
        name: "數位工具搭配面談的混合模式",
        evidence: "moderate",
        summary:
          "以面對面治療為主，搭配症狀追蹤應用程式、線上作業平台或訊息提醒來延續兩次會談之間的練習。研究顯示這種混合做法有助於提高作業完成度，讓治療師更快掌握一週的變化，適合已在接受治療、想讓練習更穩定的人。工具只是助手，困難仍要帶回會談中與治療師討論，隱私設定也要先確認清楚。",
        steps: [
          "與治療師討論要搭配哪一種數位工具",
          "每天簡短記錄症狀、練習與焦慮變化",
          "把記錄帶回會談作為調整依據",
          "定期檢視工具是否真的減輕負擔",
        ],
      },
    ],
    // cases 留空：尚無同時符合收錄門檻（有病情＋有嘗試過的解方＋有被認為有用的解方＋可連線來源）
    // 的可收錄案例，待後續補充；不虛構案例。
    cases: [],
    resources: [
      {
        title: "成人網路治療之隨機對照試驗",
        org: "Psychological Medicine",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/22348650/",
        blurb: "成人經治療師引導的網路治療，症狀明顯改善。",
      },
      {
        title: "青少年網路治療之隨機對照試驗",
        org: "J Am Acad Child Adolesc Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/27993223/",
        blurb: "青少年經網路治療改善，家屬負擔亦減輕。",
      },
      {
        title: "衛生福利部心理健康司",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaoh/",
        blurb: "衛福部心理健康政策、資源與求助管道的官方入口。",
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
        title: "求助名錄",
        org: "國際強迫症基金會（IOCDF）",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/find-help/",
        blurb: "國際強迫症基金會的求助名錄，含線上治療選項說明。",
      },
      {
        title: "兒童青少年網路治療研究平台",
        org: "卡羅琳斯卡學院",
        region: "INTL",
        kind: "tool",
        url: "https://www.bip.se/",
        blurb: "瑞典的兒童青少年網路治療研究平台。",
      },
    ],
    boardSlug: "self-help",
  },
  {
    slug: "neuromodulation",
    condition: "腦刺激治療",
    group: "TREATMENT",
    overview:
      "腦刺激治療是指以儀器調節腦部迴路的醫療方式，目前與強迫症相關的主要有兩種，定位完全不同，務必先分清楚。重複經顱磁刺激是非侵入性的，探頭置於頭皮外以磁脈衝刺激特定腦區，不需麻醉與開刀；當正規治療反應不足時，醫師可能評估是否適合搭配使用，美國食品藥物管理局已核准特定儀器用於難治型強迫症，但核准不等於人人適用。深腦刺激則是侵入性手術，在腦內植入電極長期刺激，僅保留給極少數、多種正規治療皆無效的超難治個案，且須在具備完整團隊的醫學中心經過嚴格評估，多以臨床試驗或專案方式進行。兩者皆不能取代藥物與心理治療，也都存在風險與不確定性，任何考慮都必須回到醫療團隊的完整評估，本頁資訊僅為衛教，不構成醫療建議。",
    solutions: [
      {
        name: "重複經顱磁刺激",
        evidence: "moderate",
        summary:
          "非侵入性的腦刺激方式，療程期間定期到院接受刺激，不需麻醉住院。研究顯示對部分難治型病友可能有中等程度的輔助效益，常與藥物或心理治療併用，效果因人而異且可能隨時間變化。重點是適應症把關：僅限正規治療反應不足、經精神科醫師完整評估認為適合的人，實際療程安排、儀器選擇與費用，都必須與醫師逐項討論確認。",
        steps: [
          "與精神科醫師確認是否符合難治型的評估標準",
          "了解儀器種類、療程次數與可能的副作用",
          "治療期間維持原有的藥物與心理治療追蹤",
          "記錄症狀與生活功能的變化供回診討論",
          "療程結束後與醫師規劃後續的維持與追蹤",
        ],
      },
      {
        name: "深腦刺激（僅超難治與嚴格適應症）",
        evidence: "emerging",
        summary:
          "侵入性的腦部手術，在特定核區植入電極並以微弱電流長期調節迴路，風險與不確定性都高。目前僅保留給極少數、多種一線與二線治療皆無效的超難治個案，且必須在具備精神科、神經外科與完整追蹤團隊的醫學中心，經過嚴格的身心評估與倫理審查，多以臨床試驗或專案方式進行。一般病友無需考慮此選項，有疑問請直接詢問自己的醫療團隊，切勿自行尋求管道。",
        steps: [
          "先確認已完整嘗試過一線藥物與心理治療",
          "由精神科醫師轉介至具深腦刺激團隊的醫學中心",
          "接受跨科團隊的身心狀況與適應症評估",
          "充分了解手術風險、長期追蹤與費用負擔",
          "僅在正式醫療與倫理程序下考慮參與",
        ],
      },
    ],
    // cases 留空：侵入性選項不宜以個案故事引導想像，一般病友亦難有可比經驗；
    // 待未來有合適的去識別化衛教案例並通過收錄門檻後再補。
    cases: [],
    resources: [
      {
        title: "深部磁刺激多中心雙盲試驗",
        org: "American Journal of Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/31109199/",
        blurb: "深部磁刺激多中心雙盲試驗，核准的重要依據之一。",
      },
      {
        title: "伏隔核深腦刺激治療難治型強迫症",
        org: "Archives of General Psychiatry",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/20921122/",
        blurb: "伏隔核深腦刺激的開創性研究，僅限超難治脈絡下理解。",
      },
      {
        title: "間斷與持續深腦刺激模式比較",
        org: "Brain Stimulation",
        region: "INTL",
        kind: "paper",
        url: "https://pubmed.ncbi.nlm.nih.gov/36681239/",
        blurb: "比較兩種刺激模式的隨機試驗，參數仍在優化中。",
      },
      {
        title: "強迫症治療指引（CG31）",
        org: "英國國家健康照護卓越研究院（NICE）",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/cg31",
        blurb: "英國強迫症指引，含轉介與處置的分級建議。",
      },
      {
        title: "磁刺激用於強迫症的核准公告",
        org: "美國食品藥物管理局（FDA）",
        region: "INTL",
        kind: "org",
        url: "https://www.fda.gov/news-events/press-announcements/fda-permits-marketing-transcranial-magnetic-stimulation-treatment-obsessive-compulsive-disorder",
        blurb: "特定磁刺激儀器用於難治型強迫症的核准公告。",
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
        title: "台灣精神醫學會",
        org: "台灣精神醫學會",
        region: "TW",
        kind: "org",
        url: "https://www.tsem.org.tw/",
        blurb: "精神醫學專業學會的衛教與新知。",
      },
    ],
    boardSlug: "self-help",
  },
];
