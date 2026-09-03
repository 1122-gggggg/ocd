import type { LearnEntry } from "./types";

/**
 * 症狀區 C 組：關係強迫 / 囤積 / 健康焦慮 / 其他症狀綜合。
 * 全繁中，去污名、不診斷、不承諾療效；案例為去識別化綜合改寫並附可連線來源。
 * 資源 URL 均以 curl 實際驗證（HEAD/GET < 400）。
 */
export const entries: LearnEntry[] = [
  {
    slug: "rocd",
    condition: "關係強迫",
    group: "SYMPTOM",
    overview:
      "關係強迫是強迫症常見的主題之一，核心往往不是伴侶好不好，而是腦中反覆出現關於感情的侵入性懷疑，例如我真的愛他嗎、我們適合嗎、萬一選錯人怎麼辦。為了止住不安，當事人常出現求保證、反覆比較、回想檢視、上網搜尋感情文章等行為，這些安撫只能短暫止渴，長期反而讓懷疑越滾越大。一般的感情困惑會隨相處與溝通沉澱，關係強迫則像卡住的迴圈，越想確定越不確定。若懷疑已明顯影響相處、睡眠或工作，建議尋求精神科或心理專業評估。有這些念頭不代表不愛對方，也不代表人品有問題，及早認識循環，就是改變的開始。",
    solutions: [
      {
        name: "暴露與反應阻止（ERP）",
        evidence: "strong",
        summary:
          "暴露與反應阻止是強迫症第一線的心理治療，做法是在專業引導下逐步面對引發懷疑的情境，同時減少求保證、比較與回想等行為。目標不是消除念頭，而是學會帶著不確定感生活，讓焦慮自然下降。研究顯示它對各類強迫主題都有幫助，關係強迫也會套用相同原理，並配合伴侶溝通調整。",
        steps: [
          "與專長強迫症的治療師一起列出常見的誘發情境與保證行為",
          "由低焦慮情境開始練習暴露，例如讀完懷疑念頭後不立刻求證",
          "逐步減少求保證、比較與回想等反應行為",
          "記錄焦慮變化，觀察不確定感隨時間自然下降的過程",
          "與伴侶討論如何在練習期間配合，避免無意中加入保證循環",
        ],
        linkSlug: "erp",
      },
      {
        name: "認知行為治療（CBT）",
        evidence: "moderate",
        summary:
          "認知行為治療協助當事人辨識關係強迫的思考陷阱，例如把念頭當事實、要求百分之百確定，並用更平衡的觀點看待感情中的未知。治療也會處理完美主義與過度負責等傾向，減少把正常波動災難化的習慣。過程中常搭配行為實驗，讓當事人親自驗證少求保證並不會發生可怕後果。",
        steps: [
          "辨識常見的思考陷阱，例如念頭等於事實、必須完全確定",
          "用行為實驗驗證少求保證後的實際結果",
          "練習以平衡觀點看待感情中的正常波動",
          "建立規律作息與壓力管理，減少焦慮的生理基礎",
        ],
        linkSlug: "cbt",
      },
      {
        name: "伴侶與家人支持",
        evidence: "moderate",
        summary:
          "伴侶與家人的理解對關係強迫的復原很有幫助，重點是學會區分支持與加入保證循環。家人可以陪伴就醫、一起認識強迫症的運作方式，並用一致的方式回應求保證行為，例如溫和地提醒而非反覆回答。這能減輕雙方的挫折與誤解，讓相處回到關心本身，而非圍繞懷疑打轉。",
        steps: [
          "一起認識強迫症的循環，理解懷疑是症狀而非真心話",
          "與治療師討論回應求保證行為的一致方式",
          "保留不受症狀干擾的相處時間，維持關係中的正向互動",
          "家人也照顧自己的情緒，必要時尋求自己的支持資源",
        ],
        linkSlug: "family-support",
      },
    ],
    cases: [
      {
        title: "停止逛論壇比對的那一天",
        condition:
          "二十多歲女性，經歷多種強迫主題，其中以針對伴侶的關係強迫最為難熬，長期逛論壇比對他人故事尋求保證，焦慮長年處於滿分，已明顯影響伴侶相處與睡眠。",
        tried: ["天天逛論壇並比對他人故事", "向伴侶反覆求保證"],
        worked: ["大幅減少逛論壇與搜尋", "把注意力放回日常生活"],
        vignette:
          "示意改寫：一位二十多歲的女性經歷過多種強迫主題，其中最難熬的是針對女友的關係強迫。她刻意不細數兩人故事，因為拿來比對本身就是尋求保證。她曾每天花數小時逛論壇與搜尋，焦慮長年滿分，後來下定決心大幅減少逛論壇、發文與搜尋，必要時請信任的人暫管手機。她不再拿兩人故事去套別人的答案，也不再要求女友反覆回答你愛我嗎這類問題。如今她自認好轉約八九成，焦慮降到可承受範圍，也終於能專心相處而非整天檢視感情。",
        takeaway: "把比對與搜尋認出來當作保證行為，是鬆動循環的第一步。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/ROCD/comments/okqc5g/things_that_helped_me_in_my_rocd_recovery/",
      },
      {
        title: "求婚兩天後的風暴",
        condition:
          "男士與伴侶交往十多年後求婚，兩天後突發強烈關係懷疑與恐慌，焦慮強到以為心臟病發，曾反覆向伴侶傾訴尋求保證，並開始逃避談論未來的計畫。",
        tried: ["上網搜尋零散資訊", "反覆向伴侶傾訴尋求保證"],
        worked: ["找專長強迫症的治療師", "接受暴露與反應阻止治療", "接納偶爾仍有壞日子"],
        vignette:
          "示意改寫：一位男士與女友交往十多年後求婚，兩天後突然被我真的愛她嗎的念頭淹沒，焦慮強到以為心臟病發，也曾反覆向妻子傾訴尋求保證。當年網路上幾乎找不到相關資料，他輾轉在留言板找到線索，才知道這是強迫症。他找到專長強迫症的治療師，學習暴露與反應阻止，練習帶著不確定感生活，並接納偶爾仍有壞日子。他把復原歸於持續練習而非找到標準答案。多年後他回頭分享，關係穩定，壞日子來時已經知道如何應對。",
        takeaway: "專業引導加上接納反覆，能讓壞日子不再等於打回原形。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/ROCD/comments/11rhxzi/i_beat_my_rocd_over_10_years_ago_this_is_my/",
      },
    ],
    resources: [
      {
        title: "心理健康促進與精神疾病防治專區",
        org: "衛生福利部心理健康司",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaoh/mp-107.html",
        blurb: "衛福部心健司官網，可查詢心理資源與求助管道。",
      },
      {
        title: "董氏基金會心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.jtf.org.tw/psyche/",
        blurb: "提供憂鬱、焦慮等心理衛生教育文章與量表資訊。",
      },
      {
        title: "心快活心理健康學習平台",
        org: "衛生福利部",
        region: "TW",
        kind: "course",
        url: "https://wellbeing.mohw.gov.tw/",
        blurb: "官方心理健康學習平台，有課程與自我照顧資源。",
      },
      {
        title: "Relationship OCD 介紹",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/relationship-ocd/",
        blurb: "國際強迫症基金會對關係強迫主題的介紹與建議。",
      },
      {
        title: "Obsessive-Compulsive Disorder 主題頁",
        org: "National Institute of Mental Health",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/obsessive-compulsive-disorder-ocd",
        blurb: "美國國家心理衛生研究院的強迫症衛教與研究資訊。",
      },
      {
        title: "OCD 與身體畸形障礙治療指引 CG31",
        org: "National Institute for Health and Care Excellence",
        region: "INTL",
        kind: "guideline",
        url: "https://www.nice.org.uk/guidance/cg31",
        blurb: "英國 NICE 強迫症辨識與治療的臨床指引全文。",
      },
    ],
    boardSlug: "rocd",
  },
  {
    slug: "hoarding",
    condition: "囤積困擾",
    group: "SYMPTOM",
    overview:
      "囤積困擾的核心是持續難以丟棄物品，不論物品實際價值如何，並常伴隨過度購入或收集，使家中空間被物品佔據，影響行走、衛生、安全或人際。當事人對物品常有強烈情感連結，或擔心未來會用到，丟棄時出現明顯痛苦。與單純收藏不同，囤積會讓生活空間失去原有功能。改變通常是漫長的過程，需要同時處理情緒依附與實際整理，家人的指責或突襲式清理往往適得其反。若囤積已影響居住安全或家庭關係，建議尋求精神科、心理專業或社福資源協助，一起擬定可負擔的整理步調，不必獨自硬撐。",
    solutions: [
      {
        name: "針對囤積的認知行為治療",
        evidence: "moderate",
        summary:
          "針對囤積設計的認知行為治療是目前研究最多的心理介入，重點包括辨識對物品的執念、練習丟棄與忍受不適、建立購入前的暫停機制。與一般強迫症治療不同，它更著重在住家現場的實際練習與動機經營。研究顯示症狀可明顯下降，但多數人仍需長期追蹤，進展快慢因人而異，宜與專業討論期待值。",
        steps: [
          "與專業一起盤點囤積範圍與安全優先順序",
          "辨識捨不得丟背後的想法，例如未來一定用得到",
          "從低難度物品開始練習分類、丟棄與忍受不適",
          "建立購入前的暫停與評估機制，減少新的囤入",
          "定期回顧進展並調整步調，必要時請與醫師討論",
        ],
        linkSlug: "cbt",
      },
      {
        name: "自助整理與支持資源",
        evidence: "moderate",
        summary:
          "以自助手冊與支持團體為基礎的整理方法，適合尚在排隊等候治療或症狀較輕者，例如設定極小的整理目標、記錄已完成事項、與他人一起整理以維持專注。相關自助手冊在國外支持團體中被廣泛使用，搭配價值觀目標效果較好。若情緒痛苦強烈或囤積快速惡化，仍建議優先尋求專業協助，不必等到完全失控。",
        steps: [
          "把目標縮到極小，例如每天十分鐘或只清一個平面",
          "記錄已完成事項，用累積的進展維持動機",
          "找信任的人陪伴整理，減少孤立與分心",
          "把整理連結到價值觀，例如想邀請朋友來家裡",
        ],
        linkSlug: "self-help",
      },
      {
        name: "居家整理實務與安全維護",
        evidence: "emerging",
        summary:
          "居家整理實務指的是在住家現場進行的分類、動線與安全維護，例如先清出走道與逃生路線、一次只處理一小區、物品暫存後再決定去留。這類做法屬於新興的實務經驗，證據等級仍有限，執行前請與醫師或心理專業討論，並注意消防、用電與衛生安全。若同住者有疑慮，建議邀請專業或社福單位共同規劃。",
        steps: [
          "先確保走道、門口與用火用電安全，並請與專業討論",
          "一次只處理一小區，避免一次性大掃除耗竭",
          "用暫存箱延後決定，期限到了再與信任的人一起檢視",
          "保留真正會用與有意義的物品，其餘捐贈或回收",
        ],
      },
    ],
    cases: [
      {
        title: "只湊得出兩套衣服的旅行",
        condition:
          "衣物堆滿衣櫃、損壞的抽屜與十多個紙箱，旅行前翻箱倒櫃打包七天衣物，卻只湊得出兩套真正想穿的，狼狽的經驗讓她決心徹底改變，不再用收納箱自欺。",
        tried: ["買更多收納箱把東西塞好", "想一次全部整理完"],
        worked: ["停止購入並逐件檢視", "捐出約六成衣物"],
        vignette:
          "示意改寫：一位衣物囤積者衣櫃爆滿、抽屜損壞，另有兩大收納箱與十多個紙箱，出門旅行要打包七天衣物，卻只湊得出兩套想穿的。這次經驗讓她下定決心，回國後花約一個月逐件檢視，捐出約六成衣物。她先從最好下手的夏季衣物開始，並請家人幫忙把捐贈袋直接載走，避免自己又翻回來。她曾試過買更多收納箱把東西塞好，但空間很快又滿，真正有用的是停止購入、一次只處理一件，並為想要的生活而整理。",
        takeaway: "收納箱裝不下囤入的速度，停下購入才是轉捩點。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/hoarding/comments/xscx1w/to_former_hoarders_what_helped_you_change/",
      },
      {
        title: "排不到治療時每天十分鐘",
        condition:
          "自述囤積與早年及成年創傷相關，所在城市公立排程要等數年，自費治療負擔不起，也擔心遇到不合的治療師，曾想一次清完卻總是癱瘓，不知還能怎麼辦。",
        tried: ["等待公立排程", "想一次全部清完反而癱瘓"],
        worked: ["每天十分鐘的小目標", "只買需要或有價值的東西", "自我接納不苛責"],
        vignette:
          "示意改寫：一位自述囤積與早年及成年創傷相關的網友，所在城市公立排程要等數年，自費又負擔不起，也怕遇到不合的治療師浪費錢，曾想一次全部清完卻總是癱瘓。她改用每天十分鐘的小目標，只買真正需要或有價值的東西，連差點變成垃圾車的汽車都慢慢收回來，並學著不苛責自己。她不再盯著整間屋子嘆氣，而是每天問自己今天十分鐘要處理哪一小袋。空間漸漸出現可使用的桌面，證明等待治療期間仍能先踏出小步。",
        takeaway: "夠小的目標才走得久，接納自己也是整理的一部分。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/hoarding/comments/1smha57/has_anybody_overcome_hoarding_disorder_without_a/",
      },
    ],
    resources: [
      {
        title: "衛生福利部官網",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://www.mohw.gov.tw/mp-1.html",
        blurb: "可查詢心理健康政策、社福資源與求助管道入口。",
      },
      {
        title: "臺大醫院官網",
        org: "國立臺灣大學醫學院附設醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/",
        blurb: "醫學中心官網，可查詢精神科門診與衛教資訊。",
      },
      {
        title: "諮商心理師公會全國聯合會",
        org: "諮商心理師公會全國聯合會",
        region: "TW",
        kind: "org",
        url: "https://www.tcpu.org.tw/",
        blurb: "可查詢合格諮商心理師與心理諮商相關資訊。",
      },
      {
        title: "Hoarding Disorder 介紹",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/hoarding-disorder/",
        blurb: "國際強迫症基金會對囤積症的介紹與治療方向。",
      },
      {
        title: "Hoarding Disorder 衛教頁",
        org: "National Health Service",
        region: "INTL",
        kind: "org",
        url: "https://www.nhs.uk/mental-health/conditions/hoarding-disorder/",
        blurb: "英國 NHS 對囤積症症狀與求助方式的說明。",
      },
      {
        title: "Mental Disorders 事實頁",
        org: "World Health Organization",
        region: "INTL",
        kind: "org",
        url: "https://www.who.int/news-room/fact-sheets/detail/mental-disorders",
        blurb: "世界衛生組織對各類精神疾患的整體事實說明。",
      },
    ],
    boardSlug: "hoarding",
  },
  {
    slug: "health-anxiety",
    condition: "健康焦慮",
    group: "SYMPTOM",
    overview:
      "健康焦慮是指對身體感受過度警覺，把常見的身體訊號反覆解讀為重病的跡象，即使檢查結果正常也難以放心。常見循環是察覺不適、上網搜尋、短暫安心、很快又起疑，進而反覆就醫或要求檢查，而搜尋到的重症資訊又讓焦慮更高。長期處於這種警戒狀態，睡眠、專注力與生活品質都會受影響。身體不適值得認真看待，必要的醫療檢查不可少，但當檢查一再正常、擔心卻停不下來時，可以考慮尋求心理專業協助。有這類困擾的人很多，這不是抗壓性差，而是大腦的警報系統太靈敏，值得用合適的方法照顧。",
    solutions: [
      {
        name: "認知行為治療（CBT）",
        evidence: "strong",
        summary:
          "認知行為治療是健康焦慮研究證據較充足的心理治療，重點在打破檢查與搜尋的循環，辨識災難化解讀，並用平衡的觀點看待身體訊號。治療也會安排行為實驗，例如延後搜尋、減少反覆確認，讓當事人親自體驗焦慮會自然下降。過程中會保留必要的醫療追蹤，區分合理的健康管理與過度的警戒行為。",
        steps: [
          "記錄身體感受、解讀與後續行為，辨識焦慮循環",
          "練習延後或減少搜尋症狀與反覆確認",
          "用行為實驗驗證不檢查時焦慮的自然變化",
          "保留必要的醫療追蹤，與醫師討論合理的檢查頻率",
        ],
        linkSlug: "cbt",
      },
      {
        name: "暴露與反應阻止（ERP）",
        evidence: "moderate",
        summary:
          "用於健康焦慮的暴露與反應阻止，核心是面對身體感受與不確定感，同時阻止搜尋、反覆就醫與要求保證等反應。例如練習感受到心悸時不立刻搜尋，而是觀察並繼續手邊的事。重複練習後，大腦會學到這些感受不必然等於危險，警報反應逐漸降低。實作宜在專業引導下進行，並排除需要醫療處置的狀況。",
        steps: [
          "與專業列出常見的檢查與搜尋行為清單",
          "從低焦慮的身體感受開始練習不立刻反應",
          "逐步延長不搜尋、不確認的時間",
          "記錄焦慮曲線，觀察高峰過去後的自然下降",
        ],
        linkSlug: "erp",
      },
      {
        name: "正念與身體覺察",
        evidence: "moderate",
        summary:
          "正念練習協助當事人以觀察取代評價，注意到身體感受時不立刻貼上危險標籤，也不急著消除它。規律的呼吸放鬆與身體掃描等練習，有助於降低整體警戒度，讓人從災難化劇本回到當下。研究顯示正念對焦慮症狀有中等程度的幫助，適合作為正規治療的輔助，而非取代必要的醫療與心理評估。",
        steps: [
          "每天固定短時間練習呼吸放鬆或身體掃描",
          "注意到不適時先觀察描述，不立刻下結論",
          "把注意力帶回手邊正在做的事",
          "長期記錄警戒度變化，與專業討論進展",
        ],
        linkSlug: "mindfulness",
      },
    ],
    cases: [
      {
        title: "從天天搜尋到能正常生活",
        condition:
          "網友半年前被全身多處不適淹沒，腦中閃過重症名單，看了多位醫師、檢查都正常仍無法放心，天天搜尋症狀泡論壇，恐慌發作頻繁，睡眠與工作都受影響。",
        tried: ["看了多位醫師並做多項檢查", "天天搜尋症狀並泡論壇比對"],
        worked: ["大幅減少搜尋與論壇比對", "把重心放回睡眠與日常作息"],
        vignette:
          "示意改寫：一位網友五六個月前被抽動、內震、心悸、手抖、疼痛、緊繃、視覺晃動與失眠等全身症狀淹沒，從重症名單猜過一輪，看了多位醫師、血液與理學檢查都正常仍無法放心，天天搜尋症狀泡論壇，連症狀相符的國外網站都給不了安慰。連醫師說檢查沒問題都只能安心幾天，他開始懷疑問題不在身體而在焦慮本身。他後來大幅減少搜尋，把注意力放回睡眠與日常作息，恐慌發作減少。他說還沒完全擺脫，但比起半年前，已經能正常生活。",
        takeaway: "檢查正常卻停不下來時，減少搜尋本身就是治療的一環。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/HealthAnxiety/comments/9hk21x/how_i_slowly_overcame_my_fear_of_health_anxiety/",
      },
      {
        title: "停止搜尋的半年",
        condition:
          "長期搜尋症狀並花費可觀費用反覆檢查，做過多項精密檢查仍不放心，焦慮不減反增，生活大受影響，決心徹底停止搜尋，把心理健康看得與身體傷病同等重要。",
        tried: ["花費可觀費用做多項精密檢查", "長期搜尋症狀尋求安心"],
        worked: ["徹底停止搜尋症狀與疾病", "接納焦慮同行並重視心理健康"],
        vignette:
          "示意改寫：一位長期搜尋症狀的網友花了可觀的檢查費用，做過磁振造影與多項神經電生理檢查仍不放心，決定徹底停止搜尋症狀與疾病，並告訴自己若真有大病一定會知道。她把論壇和搜尋引擎都列為保證行為，焦慮升高時改去散步或把擔心寫下來。半年後焦慮明顯下降，她坦言不算痊癒，焦慮像不請自來的旅伴同行，但不再主導人生。她開始把心理健康看得與身體傷病同等重要，並鼓勵同路人理解這場戰鬥並不孤單。",
        takeaway: "放下搜尋後，焦慮才有機會證明自己會過去。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/HealthAnxiety/comments/nrnw1z/6_months_since_i_stopped_googling_and_got_wayy/",
      },
    ],
    resources: [
      {
        title: "董氏基金會心理衛生中心",
        org: "董氏基金會",
        region: "TW",
        kind: "org",
        url: "https://www.jtf.org.tw/psyche/",
        blurb: "提供焦慮等主題的心理衛生教育文章與活動資訊。",
      },
      {
        title: "心快活心理健康學習平台",
        org: "衛生福利部",
        region: "TW",
        kind: "course",
        url: "https://wellbeing.mohw.gov.tw/",
        blurb: "官方心理健康學習平台，有課程與自我照顧資源。",
      },
      {
        title: "長庚醫療財團法人官網",
        org: "長庚醫療財團法人",
        region: "TW",
        kind: "org",
        url: "https://www.cgmh.org.tw/",
        blurb: "醫學中心官網，可查詢身心科門診與衛教資訊。",
      },
      {
        title: "Health Anxiety 衛教頁",
        org: "National Health Service",
        region: "INTL",
        kind: "org",
        url: "https://www.nhs.uk/mental-health/conditions/health-anxiety/",
        blurb: "英國 NHS 對健康焦慮症狀與自助方法的說明。",
      },
      {
        title: "Anxiety Disorders 主題頁",
        org: "National Institute of Mental Health",
        region: "INTL",
        kind: "org",
        url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
        blurb: "美國國家心理衛生研究院的焦慮症衛教與研究資訊。",
      },
      {
        title: "Anxiety Disorders 事實頁",
        org: "World Health Organization",
        region: "INTL",
        kind: "org",
        url: "https://www.who.int/news-room/fact-sheets/detail/anxiety-disorders",
        blurb: "世界衛生組織對焦慮症的整體事實說明與建議。",
      },
    ],
    boardSlug: "health-anxiety",
  },
  {
    slug: "other-symptoms",
    condition: "其他症狀綜合",
    group: "SYMPTOM",
    overview:
      "強迫症的面貌很多元，除了常見的清洗、檢查、對稱與數字，還包括侵入性禁忌念頭、過度求保證、心理儀式、反覆回想等較少被談論的形式。許多人因為念頭內容令自己羞恥而不敢求助，或誤以為只有看得見的儀式才算強迫症，因而延誤評估。共通的循環都是侵入性想法引發焦慮，再以重複行為短暫止焦，長期反而鞏固循環。認識這些樣貌的意義，是幫自己或身邊的人及早辨識、減少自責。若困擾已影響生活，建議尋求精神科或心理專業評估，並可參考本站各主題頁與討論區，找到適合自己的下一步，不必獨自摸索。",
    solutions: [
      {
        name: "暴露與反應阻止（ERP）",
        evidence: "strong",
        summary:
          "暴露與反應阻止適用於各種強迫主題，原理都是面對引發焦慮的想法或情境，同時減少儀式與迴避行為。對禁忌念頭等無法實際接觸的主題，會改用書寫或想像的方式練習。重點從來不是證明想法是錯的，而是練習不理會它、繼續生活。研究支持它是各類強迫症狀的第一線心理治療，建議由專長強迫症的治療師引導。",
        steps: [
          "與治療師一起辨識各類外顯與內在的儀式行為",
          "由低焦慮主題開始練習面對想法而不反應",
          "逐步減少迴避、求保證與心理儀式",
          "把省下的時間放回重視的生活目標",
        ],
        linkSlug: "erp",
      },
      {
        name: "藥物治療",
        evidence: "moderate",
        summary:
          "藥物治療由精神科醫師評估後開立，常用於中重度強迫症狀，或焦慮太高而難以投入心理治療時。藥物能降低整體焦慮的音量，讓人有餘裕練習治療技巧，常與心理治療併用效果較好。用藥需要時間觀察反應，劑量調整與停藥都應與醫師討論，不建議自行增減或併用偏方。有疑慮時可尋求第二意見，保障自己的知情權。",
        steps: [
          "至精神科評估症狀程度與用藥適應性，並請與醫師討論",
          "按醫囑規律服藥並記錄反應與副作用",
          "回診時與醫師討論劑量與後續計畫",
          "搭配心理治療與規律作息，發揮相輔效果",
        ],
        linkSlug: "medication",
      },
      {
        name: "接納與承諾治療（ACT）",
        evidence: "moderate",
        summary:
          "接納與承諾治療不試圖消除侵入性想法，而是練習以旁觀角度看待念頭，減少與它爭辯，並把行動放回個人重視的價值方向。對長期與強迫共處、或對傳統治療反應有限的人，這套取向提供了另一種練習框架。研究顯示它對強迫與焦慮症狀有中等程度幫助，常作為暴露治療的輔助，實作建議在專業引導下進行。",
        steps: [
          "練習把想法看成心理事件，而非必須處理的事實",
          "辨識自己重視的價值方向，例如關係或學習",
          "即使焦慮存在，仍每天做一件符合價值的小事",
          "與專業討論如何與暴露練習互相搭配",
        ],
        linkSlug: "act",
      },
    ],
    cases: [
      {
        title: "暴露治療救了我一命",
        condition:
          "嚴重強迫症發作時每幾分鐘就被侵入性想法與焦慮淹沒，長期泡論壇比對求保證，也試過硬壓下想法，狀況始終沒有改善，幾乎無法正常工作生活與社交。",
        tried: ["長期泡論壇比對與求保證", "試圖壓抑或辯贏侵入性想法"],
        worked: ["接受暴露與反應阻止治療", "不再與想法辯論並繼續生活"],
        vignette:
          "示意改寫：一位強迫症患者曾每五分鐘就被焦慮淹沒，長期泡在論壇裡比對與求保證，也試過硬壓下想法，狀況都沒有改善。接受暴露與反應阻止治療後，他學會不再與侵入性想法辯論，焦慮來時帶著它繼續做事。他不再每天量測自己好了幾成，而是把復原定義為不再被念頭綁架，並把時間還給工作與朋友。數月後發作間隔拉長到以週甚至月計，他特別回來發文提醒大家，論壇多是受苦中的聲音，好轉的人多半不再出現，復原是可能的。",
        takeaway: "好轉的關鍵不是想通，而是停止餵養循環並持續練習。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/OCD/comments/1dfl8sj/if_you_are_struggling_with_ocd_please_try_erp/",
      },
      {
        title: "斷續治療之外的下一步",
        condition:
          "健康焦慮反覆發作，認知行為治療斷斷續續，仍想知道還能多做什麼，於是在論壇發文向同路人求助，希望找到新方法，尤其想知道藥物與自助技巧是否值得一試。",
        tried: ["斷斷續續的認知行為治療", "自行上網搜尋症狀"],
        worked: ["規律服藥並與醫師討論", "以一般人反應為參照應對不確定感"],
        vignette:
          "示意改寫：一位健康焦慮者斷斷續續做認知行為治療，仍想知道還能多做什麼，在論壇發文求助。回覆中有人分享就醫後規律服藥讓焦慮音量下降，才有力氣做治療功課，並練習以沒焦慮的人會如何反應作為參照，區分需要就醫與可以等待的狀況，也有人以搜尋皮疹換來五天煎熬為戒。也有人提醒就算逛互助論壇也可能變成另一種求保證，要為使用時間設限。他把這些建議一條條記下來，開始固定回診並與醫師討論用藥，逐步找回生活節奏。",
        takeaway: "治療斷續時，先讓醫療團隊知道，比獨自加藥或停藥安全。",
        source: "reddit",
        sourceUrl:
          "https://old.reddit.com/r/Anxiety/comments/1g6l0ju/did_anyone_overcome_health_anxiety_and_if_yes_how/",
      },
    ],
    resources: [
      {
        title: "心理健康促進與精神疾病防治專區",
        org: "衛生福利部心理健康司",
        region: "TW",
        kind: "org",
        url: "https://dep.mohw.gov.tw/domhaoh/mp-107.html",
        blurb: "衛福部心健司官網，可查詢心理資源與求助管道。",
      },
      {
        title: "心理健康促進政策專區",
        org: "衛生福利部",
        region: "TW",
        kind: "org",
        url: "https://www.mohw.gov.tw/cp-16-67981-1.html",
        blurb: "衛福部心理健康相關政策與資源的說明頁面。",
      },
      {
        title: "臺大醫院精神醫學部",
        org: "國立臺灣大學醫學院附設醫院",
        region: "TW",
        kind: "org",
        url: "https://www.ntuh.gov.tw/ntuh/Fpage.action?muid=7143",
        blurb: "臺大醫院精神醫學部介紹，可查詢門診資訊。",
      },
      {
        title: "About OCD 介紹",
        org: "International OCD Foundation",
        region: "INTL",
        kind: "org",
        url: "https://iocdf.org/about-ocd/",
        blurb: "國際強迫症基金會對強迫症各主題的總覽介紹。",
      },
      {
        title: "OCD 衛教頁",
        org: "National Health Service",
        region: "INTL",
        kind: "org",
        url: "https://www.nhs.uk/mental-health/conditions/obsessive-compulsive-disorder-ocd/",
        blurb: "英國 NHS 對強迫症症狀、成因與治療的說明。",
      },
      {
        title: "What Is OCD 介紹",
        org: "American Psychiatric Association",
        region: "INTL",
        kind: "org",
        url: "https://www.psychiatry.org/patients-families/obsessive-compulsive-disorder",
        blurb: "美國精神醫學會給民眾的強迫症介紹與求助建議。",
      },
    ],
    boardSlug: "other-symptoms",
  },
];
