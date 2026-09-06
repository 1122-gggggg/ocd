export interface EvidenceMethod {
  name: string;
  grade: "實證充足" | "中等" | "新興";
  summaryZh: string;
  sources: Array<{ label: string; href: string }>;
}

export const LEARN_EVIDENCE: Record<string, EvidenceMethod[]> = {
  "contamination": [
    {
      "name": "現場暴露與反應預防（In Vivo ERP）結合污染恐懼階層表",
      "grade": "實證充足",
      "summaryZh": "針對各類細菌或髒污恐懼，在專業人員陪伴下建立0至100分的恐懼階層表，循序漸進碰觸擔憂的物品並嚴格延後或停止清洗。透過反覆接觸，讓大腦親身體會焦慮會隨著時間自然消退（習慣化），打破「碰到了就非洗不可」的惡性循環。",
      "sources": [
        {
          "label": "IOCDF 專家觀點：污染強迫症與暴露及反應預防處置",
          "href": "https://iocdf.org/expert-opinions/expert-opinion-contamination/"
        },
        {
          "label": "PubMed (Edna B. Foa et al., 2012): EX/RP臨床盲點與污染暴露階層建構",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22924159/"
        },
        {
          "label": "新竹臺大分院精神醫學部：正視焦慮症及強迫症與過度洗手行為",
          "href": "https://www.hch.gov.tw/?aid=503&pid=0&page_name=detail&iid=225"
        }
      ]
    },
    {
      "name": "選擇性血清素再吸收抑制劑（SSRI）與ERP合併治療",
      "grade": "實證充足",
      "summaryZh": "對於中重度污染強迫症，國際臨床指引一致推薦高劑量SSRI藥物或合併ERP進行治療。SSRI能有效調節神經傳導並降低強迫思緒的侵入強度，搭配ERP練習可顯著提升症狀緩解率（達80%），協助個案更有力氣突破清洗障礙。",
      "sources": [
        {
          "label": "英國國家健康與照護卓越研究院 (NICE CG31 指引)：強迫症分級照護與合併治療建議",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "JAMA Psychiatry (Simpson HB et al., 2013 RCT): SSRI合併ERP對強迫症療效之隨機對照試驗",
          "href": "https://pubmed.ncbi.nlm.nih.gov/24026523/"
        },
        {
          "label": "Molecular Psychiatry (Bloch MH et al., 2010 統合分析): 強迫症SSRI劑量與反應關係之統合分析",
          "href": "https://pubmed.ncbi.nlm.nih.gov/19468281/"
        }
      ]
    },
    {
      "name": "想像暴露（Imaginal Exposure）與心理污染處置",
      "grade": "中等",
      "summaryZh": "當污染恐懼牽涉到現實無法實地接觸的災難結果（如染上絕症或害親人受害），或源於背叛與道德感受的「心理污染」時，想像暴露透過撰寫並反覆聆聽最壞劇本來面對焦慮。臨床研究證實想像暴露結合認知重構能有效減輕心理污染感與非理性中和清洗衝動。",
      "sources": [
        {
          "label": "PubMed (Warnock-Parkes E, Salkovskis PM, Rachman J, 2012): 心理污染認知治療個案研究",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22673125/"
        },
        {
          "label": "PubMed (Gillihan SJ, Foa EB et al., 2012): EX/RP中想像暴露與核心恐懼處置",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22924159/"
        }
      ]
    },
    {
      "name": "家庭減順應介入與支持性親職方案（SPACE）",
      "grade": "實證充足",
      "summaryZh": "強迫症常使家人不由自主配合清洗要求或給予安全保證，這在醫學上稱為家庭順應，反而會加深病程。透過家庭衛教與支持性親職方案（SPACE），引導同住親友以溫和堅定的態度停止代勞清洗與反覆保證，並給予情緒接納，研究顯示能有效降低患者焦慮並鞏固治療成果。",
      "sources": [
        {
          "label": "Expert Review of Neurotherapeutics (Lebowitz ER et al., 2012 綜論): 強迫症中的家庭順應與治療預後",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22288678/"
        },
        {
          "label": "IOCDF 臨床指南：支持性親職方案（SPACE）與家庭順應處置",
          "href": "https://iocdf.org/about-ocd/ocd-treatment-guide/space/"
        },
        {
          "label": "JAACAP (Lebowitz ER et al., 2020 RCT): 針對家庭順應之SPACE隨機非劣性對照試驗",
          "href": "https://pubmed.ncbi.nlm.nih.gov/30851397/"
        }
      ]
    }
  ],
  "symmetry": [
    {
      "name": "暴露與反應預防（ERP）針對「感覺不對勁」（NJRE）",
      "grade": "實證充足",
      "summaryZh": "對稱與排列強迫多源自一種內在無法忍受的不對勁或不完整感（Not Just Right Experience）。ERP練習刻意將物品擺歪、左右接觸不平衡或打亂既定順序，並練習忍住不去重新擺正；透過與不對勁感共處，大腦會逐漸提升對不完美的耐受度，緊繃感也會自然減退。",
      "sources": [
        {
          "label": "Behaviour Research and Therapy (Coles ME & Ravid A, 2016): 強迫症「感覺不對勁」（NJRE）臨床特徵與ERP治療成效",
          "href": "https://pubmed.ncbi.nlm.nih.gov/27716490/"
        },
        {
          "label": "美國精神醫學會 (APA) 臨床治療指引 (Koran LM et al., 2007): 強迫症認知行為暴露與評估標準",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "中國醫藥大學附設醫院精神醫學部衛教：追求百分百的完美～強迫症之對稱與ERP",
          "href": "https://www.cmuh.cmu.edu.tw/HealthEdus/Detail?no=5741"
        }
      ]
    },
    {
      "name": "選擇性血清素再吸收抑制劑（SSRI）藥物治療與維度分析",
      "grade": "實證充足",
      "summaryZh": "SSRI是國際臨床指引針對各型強迫症（包含對稱與排列維度）的一線藥物。跨維度臨床研究顯示，雖然對稱排列患者常合併較多感覺現象，但足量且具足夠週數的SSRI治療仍能顯著改善強迫衝動強度，幫助個案減少重複重做的驅迫感。",
      "sources": [
        {
          "label": "American Journal of Psychiatry (Mataix-Cols D et al., 2005): 強迫症多維度模型與症狀維度治療反應",
          "href": "https://pubmed.ncbi.nlm.nih.gov/15677583/"
        },
        {
          "label": "英國國家健康與照護卓越研究院 (NICE CG31 指引)：強迫症藥物治療臨床指引",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "董氏基金會華文心理健康網：強迫症認識與血清素調節藥物衛教",
          "href": "https://www.etmh.org/"
        }
      ]
    },
    {
      "name": "接納與承諾治療（ACT）與正念共處",
      "grade": "中等",
      "summaryZh": "針對對稱排列中「必須做到完美」的僵化堅持，接納與承諾治療（ACT）引導個案以觀察而不評價的態度看待不對勁感，並將精力轉向真正重要的人生價值。臨床RCT證實ACT能有效改善強迫症狀與認知融合，是極具價值的心理治療模式或ERP輔助工具。",
      "sources": [
        {
          "label": "Journal of Consulting and Clinical Psychology (Twohig MP et al., 2010 RCT): 接納與承諾治療（ACT）治療強迫症之隨機對照試驗",
          "href": "https://pubmed.ncbi.nlm.nih.gov/20873905/"
        },
        {
          "label": "IOCDF 臨床研究：ACT與ERP合併運用於強迫症對稱維度認知融合之探討",
          "href": "https://iocdf.org/recipients/combining-acceptance-and-commitment-therapy-with-exposure-and-response-prevention-to-enhance-treatment-engagement/"
        }
      ]
    },
    {
      "name": "習慣反轉訓練（HRT）與刺激控制輔助策略",
      "grade": "新興",
      "summaryZh": "部分對稱與排列動作具有像抽動（tic-like）般高度自動化的特質（如反覆按壓開關、雙手輪流觸碰）。習慣反轉訓練透過覺察前驅衝動並施加競爭性肢體動作（如雙手交疊握緊30秒）來阻斷重複動作，搭配刺激控制減少視覺誘發，作為難治型或抽動型對稱儀式的輔助療法。",
      "sources": [
        {
          "label": "IOCDF 臨床研究：習慣反轉訓練應用於強迫症抽動型重複動作之研究",
          "href": "https://iocdf.org/recipients/habit-reversal-for-tic-like-compulsions/"
        },
        {
          "label": "Clinical Psychology Review (Bate KS et al., 2011 統合分析): 習慣反轉療法應用於重複習慣行為之統合分析",
          "href": "https://pubmed.ncbi.nlm.nih.gov/21549664/"
        }
      ]
    }
  ],
  "checking": [
    {
      "name": "暴露與不反應防範法（ERP）在檢查儀式上的應用",
      "grade": "實證充足",
      "summaryZh": "在專業治療師引導下，循序漸進暴露於引發強烈不安全感的情境（如出門前只看一眼門鎖或開關），並嚴格克制回頭確認、反覆檢查或拍照存證的衝動。雖然剛開始焦慮會快速飆升，但只要忍住不檢查，大腦會逐漸適應並學會「即便不重複確認，災難也不會發生」，有效瓦解懷疑與確認的惡性循環。",
      "sources": [
        {
          "label": "NICE Clinical Guideline CG31: Obsessive-compulsive disorder and body dysmorphic disorder: treatment",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "International OCD Foundation (IOCDF) - Exposure and Response Prevention (ERP)",
          "href": "https://iocdf.org/about-ocd/treatment/erp/"
        },
        {
          "label": "衛生福利部草屯療養院衛教專區 - 走出反覆確認的迷宮：認識強迫症",
          "href": "https://www.ttpc.mohw.gov.tw/?aid=509&pid=110&page_name=detail&iid=1370"
        }
      ]
    },
    {
      "name": "高劑量血清素再吸收抑制劑（SSRIs）與增強治療",
      "grade": "實證充足",
      "summaryZh": "SSRIs是國際指引一致推薦的第一線藥物，其治療強迫症通常需要比治療憂鬱症更高的劑量，並需規律服用8至12週以顯現療效。若單一藥物改善有限，醫師常會合併非典型抗精神病藥物進行增強治療，能顯著降低大腦反覆發出「可能出錯」的虛警訊號，減輕反覆檢查的衝動。",
      "sources": [
        {
          "label": "The Lancet Psychiatry Network Meta-Analysis: Pharmacological and psychotherapeutic interventions for management of obsessive-compulsive disorder in adults (PMID: 27318812)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/27318812/"
        },
        {
          "label": "NICE Clinical Guideline CG31: Step 3 to 5 Treatment Options for OCD",
          "href": "https://www.nice.org.uk/guidance/cg31"
        }
      ]
    },
    {
      "name": "針對「過度責任感」與記憶懷疑的認知治療（Cognitive Therapy for Inflated Responsibility & Checking）",
      "grade": "中等",
      "summaryZh": "檢查型強迫症的核心在於過度放大個人責任（認為如果不檢查，任何意外都是自己的過錯）以及越檢查越對記憶缺乏信心的「記憶懷疑」。認知治療運用行為實驗與責任餅圖，協助個案重新校正合理的責任邊界，體驗到「感覺不確定不等於真正有危險」，從認知層面減少非理性的預防性檢查。",
      "sources": [
        {
          "label": "Psychiatry Research Pilot Trial: Cognitive therapy for compulsive checking in obsessive-compulsive disorder: A pilot trial (PMID: 32070838)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/32070838/"
        },
        {
          "label": "Behavioural and Cognitive Psychotherapy: Modelling OCD: a test of the inflated responsibility model (PMID: 31666139)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/31666139/"
        }
      ]
    },
    {
      "name": "減少家庭同謀與家庭契約支持（Reduction of Family Accommodation）",
      "grade": "中等",
      "summaryZh": "許多檢查型患者會習慣向同住家人索取保證（例如反覆問「門關好了嗎？」）或要求家人代為檢查，家人的順從雖能暫時緩解焦慮，長遠卻會強化症狀。家庭治療教導親友建立溫和而堅定的界線、訂立家庭契約，以情感支持取代協助檢查與回答保證，能顯著改善家庭動態並促進個案症狀緩解。",
      "sources": [
        {
          "label": "Journal of Affective Disorders Meta-Analysis: Family and couple integrated cognitive-behavioural therapy for adults with OCD: A meta-analysis (PMID: 32828003)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/32828003/"
        },
        {
          "label": "Clinical Psychology Review Meta-Analysis: A meta-analysis of family accommodation and OCD symptom severity (PMID: 27019367)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/27019367/"
        },
        {
          "label": "International OCD Foundation Expert Opinion: Living With Someone Who Has OCD: Guidelines for Family Members",
          "href": "https://iocdf.org/expert-opinions/expert-opinion-family-guidelines/"
        }
      ]
    }
  ],
  "hoarding": [
    {
      "name": "囤積症專屬認知行為治療（CBT for Hoarding Disorder / Steketee & Frost Protocol）",
      "grade": "中等",
      "summaryZh": "囤積症在DSM-5已獨立於強迫症，傳統OCD的ERP單純著重於恐懼焦慮的去敏感化，對囤積症效果有限；專屬CBT針對囤積核心機轉，包含獲取控制、物品情感依附的認知重構、以及漸進式丟棄練習。統合分析顯示CBT能顯著減輕囤積嚴重度與雜亂程度，但臨床顯著痊癒率中等（約24%至43%），需要長期的耐心適應與練習。",
      "sources": [
        {
          "label": "Depression and Anxiety Meta-Analysis: Cognitive behavioral therapy for hoarding disorder: a meta-analysis (PMID: 25639467)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/25639467/"
        },
        {
          "label": "International OCD Foundation Hoarding Center: How is Hoarding Disorder Treated?",
          "href": "https://hoarding.iocdf.org/about-hoarding/how-is-hoarding-disorder-treated/"
        }
      ]
    },
    {
      "name": "藥物治療與其療效局限性（SSRIs 與共病輔助治療）",
      "grade": "中等",
      "summaryZh": "研究與大型統合分析指出，囤積症狀對傳統強迫症第一線藥物（SSRIs）的治療反應顯著低於其他強迫亞型，治療反應率約只有一般OCD的一半。目前醫學界普遍將藥物作為輔助手段，主要用於改善共病的憂鬱、焦慮或注意力缺陷問題，無法單靠藥物徹底清除核心囤積行為，需合併心理與行為介入。",
      "sources": [
        {
          "label": "Molecular Psychiatry Meta-Analysis: Hoarding symptoms associated with poor treatment outcome in obsessive-compulsive disorder (PMID: 24912494)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/24912494/"
        },
        {
          "label": "International OCD Foundation Hoarding Center: Treatment of HD – Medication",
          "href": "https://hoarding.iocdf.org/professionals/treatment-of-hoarding-disorder/treatment-of-hd-medication/"
        }
      ]
    },
    {
      "name": "實地分類決策技巧訓練與居家減害整理（Skills Training & In-Home Sorting Practice）",
      "grade": "中等",
      "summaryZh": "囤積症患者常伴隨資訊處理、分類決策與注意力維持的困難，將物品移出視線會引發強烈遺失焦慮。此方法透過治療師或輔導員到府，協助建立分類收納規則（例如設定保留標準與處理箱）、拆解龐大整理目標，並採取減害策略（優先確保通道、廚房與消防安全），避免激進強制清運引發強烈反彈。",
      "sources": [
        {
          "label": "International OCD Foundation Hoarding Center: Treatment of HD – Skills Training",
          "href": "https://hoarding.iocdf.org/professionals/treatment-of-hoarding-disorder/treatment-of-hd-skills-training/"
        },
        {
          "label": "衛生福利部草屯療養院衛教專區 - 儲物症認識與居家練習指南",
          "href": "https://www.ttpc.mohw.gov.tw/?aid=509&pid=110&page_name=detail&iid=1149"
        }
      ]
    },
    {
      "name": "同儕支持與「埋藏在寶藏中」工作坊（Peer-Led Buried in Treasures Support Groups）",
      "grade": "中等",
      "summaryZh": "「埋藏在寶藏中」（Buried in Treasures）是經實證隨機對照試驗證實有效的結構化團體方案，可由接受過培訓的同儕過來人帶領。在無羞恥感且具同理心的同儕支持環境中，透過每週討論讀本、設定家庭丟棄目標與互相打氣，能有效提高改變動機並降低病恥感，效果與專業心理師帶領之團體相當。",
      "sources": [
        {
          "label": "Behaviour Research and Therapy RCT: The Buried in Treasures Workshop: waitlist control trial of facilitated support groups for hoarding (PMID: 22982080)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22982080/"
        },
        {
          "label": "International OCD Foundation Hoarding Center: Support Groups for Hoarding",
          "href": "https://hoarding.iocdf.org/about-hoarding/how-is-hoarding-disorder-treated/"
        }
      ]
    }
  ],
  "harm": [
    {
      "name": "暴露與反應預防（ERP：想像腳本暴露與情境暴露）",
      "grade": "實證充足",
      "summaryZh": "在專業心理師陪伴下擬定「最壞恐懼」的想像暴露腳本或錄音，並在日常中逐步面對刀具、尖銳物或與家人獨處等觸發情境，同時練習不檢查、不藏刀、不反覆回想確認。大腦會在反覆面對中體會焦慮的自然消退，學會傷害念頭只是無害的神經雜訊。",
      "sources": [
        {
          "label": "國際強迫症基金會 (IOCDF) 專家指南：暴力與傷害強迫思維的 ERP 治療（Fred Penzel 博士）",
          "href": "https://iocdf.org/expert-opinions/expert-opinion-violent-obsessions/"
        },
        {
          "label": "PubMed 臨床研究：強迫症暴露與反應預防常見陷阱與想像暴露應用 (Gillihan et al., 2012)",
          "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3423997/"
        }
      ]
    },
    {
      "name": "藥物治療（高劑量 SSRI）與心理治療合併療法",
      "grade": "實證充足",
      "summaryZh": "精神科醫師常以較高劑量的選擇性血清素再吸收抑制劑（SSRI）調節腦部神經傳導物質，降低念頭引發的生理警報與焦慮強度。當大腦過度敏感的警報降至可承受範圍後，配合暴露與反應預防練習，能更穩定且順利地打破恐懼迴圈。",
      "sources": [
        {
          "label": "英國國家健康照護卓越研究院 (NICE) 臨床指引 [CG31]：強迫症與身體臆形症治療建議",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "美國精神醫學會 (APA) 臨床指引：強迫症患者治療實務指引 (Koran et al., 2007, PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "台大醫院健康電子報：簡介強迫症與藥物及認知行為治療",
          "href": "https://epaper.ntuh.gov.tw/health/201310/health_2.html"
        }
      ]
    },
    {
      "name": "侵入思維正常化心理教育與認知去災難化",
      "grade": "實證充足",
      "summaryZh": "跨國大規模研究證實，超過九成的健康一般人都會在日常中偶爾冒出傷害他人的荒謬念頭；強迫症的關鍵不在於念頭出現，而在於誤把「想了就等於想做（想法-行動融合）」。透過心理教育認清大腦會隨機產生背景雜訊，能大幅卸下道德罪惡感，不再耗費精力自我審查。",
      "sources": [
        {
          "label": "跨國六大洲侵入思維實證研究：93.6% 一般人皆有非自願侵入念頭 (Radomsky et al., 2014, JOCRD)",
          "href": "https://doi.org/10.1016/j.jocrd.2013.09.002"
        },
        {
          "label": "行為研究與治療經典文獻：正常與異常強迫觀念的內容一致性研究 (Rachman & de Silva, 1978, PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/718588/"
        },
        {
          "label": "衛生福利部草屯療養院衛教專區：認識強迫症之侵入性想法與自我歸因照護",
          "href": "https://www.ttpc.mohw.gov.tw/?aid=509&pid=110&page_name=detail&iid=1196"
        }
      ]
    },
    {
      "name": "接納承諾治療（ACT）與認知脫鉤",
      "grade": "中等",
      "summaryZh": "練習將腦中的傷害畫面視為飄過的文字或收音機廣播的背景雜音（認知脫鉤），而不是需要立刻證明自己清白的威脅。學會帶著害怕的感受與念頭共處，同時把心力專注投入在真正關心的家庭、工作與生活價值中。",
      "sources": [
        {
          "label": "隨機對照試驗 (RCT)：強迫症接納承諾治療效果研究 (Twohig et al., 2010, JCCP / PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/20873905/"
        },
        {
          "label": "系統性回顧與統合分析：接納承諾治療應用於強迫症之療效實證 (Soondrum et al., 2022, PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/35625042/"
        }
      ]
    },
    {
      "name": "心理社會面向：減少家庭牽連與保證尋求（Family Accommodation Reduction）",
      "grade": "中等",
      "summaryZh": "當事人反覆向親友詢問「我會不會傷害你？」雖然能獲得短暫安心，但長期會強化大腦的危險假警報。親友練習溫和停止給予口頭保證，改以同理「我知道你現在很害怕」的陪伴方式，能有效阻斷家庭牽連與對保證的依賴循環。",
      "sources": [
        {
          "label": "PubMed 臨床文獻回顧：強迫症中的家庭牽連與保證行為對治療成效之影響 (Lebowitz et al., 2012)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22288678/"
        },
        {
          "label": "董氏基金會心理衛生中心：心理健康專欄與家屬陪伴原則",
          "href": "https://www.jtf.org.tw/psyche/"
        }
      ]
    }
  ],
  "sexual-intrusions": [
    {
      "name": "暴露與反應預防（ERP：針對禁忌性主題的想像腳本與內在儀式抑制）",
      "grade": "實證充足",
      "summaryZh": "針對不想要的性畫面（如不當性向懷疑、戀童恐懼或禁忌關係），在專業陪伴下透過撰寫最壞恐懼劇本直視焦慮，同時嚴格停止檢查身體生理反應（如腹股溝與喚起感受）、反覆回想過去確認或迴避接觸特定族群。大腦能藉此重新校準警報系統，不再將身體因焦慮引發的緊繃與自主神經反應誤判為慾望。",
      "sources": [
        {
          "label": "劍橋大學出版社臨床實務指引：強迫症禁忌與不可接受思維的 CBT 與 ERP 最佳處置 (Williams, Whittal, & La Torre, 2022)",
          "href": "https://doi.org/10.1017/s1754470x22000113"
        },
        {
          "label": "國際強迫症基金會 (IOCDF) 專家專文：性取向強迫症之 ERP 暴露作業與身體檢查儀式抑制 (Fred Penzel 博士)",
          "href": "https://iocdf.org/expert-opinions/sexual-orientation-obsessions/"
        },
        {
          "label": "國際強迫症基金會 (IOCDF) 專家指南：戀童恐懼強迫症 (pOCD) 的羞恥感與 ERP 治療 (Jordan Levy 博士)",
          "href": "https://iocdf.org/expert-opinions/am-i-a-monster-an-overview-of-common-features-typical-course-shame-and-treatment-of-pedophilia-ocd-pocd/"
        }
      ]
    },
    {
      "name": "藥物治療（高劑量 SSRI / 增效策略）",
      "grade": "實證充足",
      "summaryZh": "高劑量選擇性血清素再吸收抑制劑（SSRI）能穩定調節邊緣系統過度活躍的情緒反應，顯著降低禁忌侵入性畫面帶來的強烈驚恐與生理震盪。臨床上常需持續治療數週至數月，讓大腦從反覆警報的疲憊中恢復，為心理暴露練習提供穩固基礎。",
      "sources": [
        {
          "label": "美國精神醫學會 (APA) 臨床指引：強迫症藥物治療實務指引 (Koran et al., 2007, PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "英國國家健康照護卓越研究院 (NICE) 臨床指引 [CG31]：強迫症階梯式照護與藥物建議",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "台大醫院健康電子報：強迫症藥物作用機轉與血清素調節說明",
          "href": "https://epaper.ntuh.gov.tw/health/201310/health_2.html"
        }
      ]
    },
    {
      "name": "禁忌念頭去污名心理教育與區分「意圖 vs 侵入思維（自我不諧和）」",
      "grade": "實證充足",
      "summaryZh": "實證心理學研究發現，超過八成的健康大學生都曾閃過突發的性侵入思維；患者感受到的極度痛苦、排斥與恐慌，正是在精神醫學上屬於「自我不諧和（ego-dystonic）」的鐵證——代表這些念頭與真實慾望完全背道而馳。理解大腦偶發的神經雜訊不代表道德瑕疵或真實傾向，能幫助當事人從毀滅性的自責深淵中走出來。",
      "sources": [
        {
          "label": "性研究期刊 (Journal of Sex Research)：非臨床大學生性侵入思維盛行率達 84% 之實證調查 (Byers et al., 1998)",
          "href": "https://doi.org/10.1080/00224499809551954"
        },
        {
          "label": "跨國六大洲侵入思維研究：93.6% 大眾皆有嫌惡與禁忌性念頭 (Radomsky et al., 2014, JOCRD)",
          "href": "https://doi.org/10.1016/j.jocrd.2013.09.002"
        },
        {
          "label": "衛生福利部草屯療養院：精神科衛教專文解析侵入性性影像與自我歸因技巧",
          "href": "https://www.ttpc.mohw.gov.tw/?aid=509&pid=110&page_name=detail&iid=1196"
        }
      ]
    },
    {
      "name": "接納承諾治療（ACT）與自我慈悲（Self-Compassion）",
      "grade": "中等",
      "summaryZh": "學習不將性侵入畫面視為道德污點或必須消滅的敵人，而是練習以自我慈悲的態度允許念頭如天上的烏雲自然漂移。透過認知脫鉤（不反芻、不與念頭在腦中辯論、不上網搜尋病理比對），不讓羞恥感綁架生活，堅定追求符合個人價值觀的人際與親密關係。",
      "sources": [
        {
          "label": "隨機對照試驗 (RCT)：強迫症接納承諾治療效果研究 (Twohig et al., 2010, JCCP / PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/20873905/"
        },
        {
          "label": "系統性回顧與統合分析：接納承諾治療改善強迫思維與心理靈活性之療效 (Soondrum et al., 2022, PubMed)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/35625042/"
        }
      ]
    },
    {
      "name": "心理社會面向：停止網路病理比對與保證尋求（Neutralizing Compulsions Reduction）",
      "grade": "中等",
      "summaryZh": "面對性主題侵入思維時，當事人極易上網搜尋違法案例、論壇提問或向親友旁敲側擊以確認自己「不是壞人」，但這類求證只會讓疑慮更深。心理社會支持重點在於辨認隱蔽的求證行為，藉由互助同儕與專業陪伴打破羞恥沉默，建立「停止尋求保證、允許不確定性存在」的復原社群支持。",
      "sources": [
        {
          "label": "劍橋大學出版社臨床實務指引：禁忌強迫思維中隱蔽儀式與網路求證行為之評估與處置 (Williams et al., 2022)",
          "href": "https://doi.org/10.1017/s1754470x22000113"
        },
        {
          "label": "臺北市立聯合醫院精神科衛教專區：認識強迫思考與放手練習",
          "href": "https://tpech.gov.taipei/mp109151/News_Content.aspx?n=535FED1409A8AEF2&sms=72544237BBE4C5F6&s=8A55B5DA523D7232"
        }
      ]
    }
  ],
  "scrupulosity": [
    {
      "name": "宗教與道德主題之暴露與反應預防（ERP）結合價值澄清",
      "grade": "實證充足",
      "summaryZh": "暴露與反應預防（ERP）是國際指引公認的第一線心理治療。面對宗教與道德強迫時，治療會結合價值澄清，協助您釐清「真實的信仰與道德價值」與「強迫症引發的恐懼與儀式」，在專業引導下逐步面對引發罪惡感的情境，並練習停止重複懺悔、祈禱或尋求保證，讓信仰與生活回歸平安。",
      "sources": [
        {
          "label": "美國精神醫學會（APA）強迫症臨床治療指引 (PMID: 17849776)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "國際強迫症基金會（IOCDF）：信仰與敏感性暴露原則臨床指引",
          "href": "https://iocdf.org/faith-ocd/mental-health-providers/principles-of-effective-and-religiously-sensitive-exposures/"
        },
        {
          "label": "Abramowitz & Jacoby (2014) 宗教道德強迫認知行為分析與治療意涵 (DOI: 10.1016/j.jocrd.2013.12.007)",
          "href": "https://doi.org/10.1016/j.jocrd.2013.12.007"
        }
      ]
    },
    {
      "name": "接納與承諾治療（ACT）在道德與宗教強迫之應用",
      "grade": "中等",
      "summaryZh": "接納與承諾治療不與侵入性的褻瀆或不道德念頭爭辯對錯，而是引導您練習「認知脫鉤」與「接納不確定感」，將念頭視為大腦浮現的心理雜訊。透過澄清內心真正重視的生命與信仰價值，即使內心出現懷疑或焦慮，仍能帶著不適感投入有意義的日常行動。",
      "sources": [
        {
          "label": "Dehlin et al. (2013) 接納與承諾治療於強迫症宗教道德亞型之成效研究 (PMID: 23405017)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/23405017/"
        },
        {
          "label": "Twohig et al. (2018) 接納與承諾治療結合暴露反應預防於強迫症之隨機對照試驗 (PMID: 29966992)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/29966992/"
        }
      ]
    },
    {
      "name": "藥物治療與合併療法（高劑量 SSRI 配合認知行為治療）",
      "grade": "實證充足",
      "summaryZh": "選擇性血清素再吸收抑制劑（SSRI）是各大國際與台灣臨床指引建議的第一線藥物。強迫症通常需要較高劑量且規律服用 8 至 12 週以上以發揮療效，能有效降低大腦強迫訊號的頻率與焦慮強度；與 ERP 雙管齊下合併治療，能取得更佳且持久的改善。",
      "sources": [
        {
          "label": "英國國家健康照護卓越研究院（NICE）強迫症治療指引 CG31",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "臺大醫院健康電子報：簡介強迫症與藥物及認知行為治療",
          "href": "https://epaper.ntuh.gov.tw/health/201310/health_2.html"
        }
      ]
    },
    {
      "name": "信仰領袖協同諮詢與家庭「停止保證」心理社會介入",
      "grade": "中等",
      "summaryZh": "許多道德與宗教強迫患者會反覆向神職人員或親友告解、尋求「我這樣有沒有犯罪」的保證，但反覆回答只會加劇強迫循環。本介入由心理專家邀請信任的信仰領袖與家屬參與，協助建立「界線分明的支持模式」，以同理傾聽取代教義辯論與重複背書，打破家庭與社群的調適迴圈。",
      "sources": [
        {
          "label": "臺北市立聯合醫院松德院區：強迫症特別門診與全家支持模式（處理家庭調適 Family Accommodation）",
          "href": "https://tpech.gov.taipei/mp109201/News_Content.aspx?n=86F3259FB2239188&sms=F761433975E2FD9A&s=6803CDDA4E060EFF"
        },
        {
          "label": "國際強迫症基金會（IOCDF）：信仰與敏感性暴露原則臨床指引",
          "href": "https://iocdf.org/faith-ocd/mental-health-providers/principles-of-effective-and-religiously-sensitive-exposures/"
        }
      ]
    }
  ],
  "rocd": [
    {
      "name": "關係主題暴露與反應預防（ROCD-focused ERP）",
      "grade": "實證充足",
      "summaryZh": "暴露與反應預防（ERP）應用於關係強迫時，引導當事人逐步面對「感情可能不完美」、「我可能永遠無法百分之百確定伴侶是唯一真愛」等引發強烈焦慮的未知情境，同時練習停止過度比對、反覆檢視感覺強度、刺探伴侶過往或上網查證感情文章等儀式，學會帶著不確定感生活。",
      "sources": [
        {
          "label": "國際強迫症基金會（IOCDF）專家專欄：關係強迫（ROCD）症狀與 ERP 治療",
          "href": "https://iocdf.org/expert-opinions/relationship-ocd/"
        },
        {
          "label": "Doron et al. (2016) 關係強迫症臨床症狀、失調信念與功能損害研究 (PMID: 27148087)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/27148087/"
        }
      ]
    },
    {
      "name": "伴侶輔助暴露與反應預防（Partner-Assisted ERP）與伴侶關係介入",
      "grade": "中等",
      "summaryZh": "伴侶常因心疼而無意間提供反覆保證（例如回答「我真的愛你」、「你沒有選錯」）或配合儀式，這在臨床上稱為伴侶調適，長期反而餵養強迫迴圈。伴侶輔助 ERP 訓練伴侶成為治療教練，學習溫和且中立地拒絕提供保證，同時增進健康的感情溝通與正向互動，共同減輕關係壓力。",
      "sources": [
        {
          "label": "Abramowitz, Baucom et al. (2013) 伴侶基礎認知行為治療與伴侶輔助 ERP 試驗 (PMID: 23768667)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/23768667/"
        },
        {
          "label": "Abramowitz, Baucom et al. (2013) 強化強迫症暴露與反應預防：伴侶模式臨床介入 (PMID: 22619395)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/22619395/"
        }
      ]
    },
    {
      "name": "認知行為治療（CBT）與關係失調信念重構",
      "grade": "中等",
      "summaryZh": "關係強迫患者往往持有極端的愛情信念，例如「只要有一絲懷疑就不是真愛」、「合適的伴侶絕不能有任何讓人挑剔的缺點」。認知重構協助當事人辨識這些災難化與非黑即白的思考陷阱，透過行為實驗檢驗信念，重新建立對真實親密關係波動與不完美的客觀理解。",
      "sources": [
        {
          "label": "Doron et al. (2016) 關係強迫症狀與失調關係信念實證研究 (PMID: 27148087)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/27148087/"
        },
        {
          "label": "Lazarov, Liberman, Dar (2023) 強迫症尋求內部狀態代用指標（SPIS）模型與關係強迫機制 (PMCID: PMC11284725 / PMID: 37881091)",
          "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11284725/"
        }
      ]
    },
    {
      "name": "藥物治療與合併療法（SSRI 高劑量與心理治療整合）",
      "grade": "實證充足",
      "summaryZh": "選擇性血清素再吸收抑制劑（SSRI）是治療嚴重關係強迫的第一線藥物。當強迫懷疑引發劇烈恐慌、整日反芻而無法專注生活或配合練習時，高劑量 SSRI 能調控神經傳導物質，有效降低強迫念頭的黏著度與衝動感，為後續的 ERP 與伴侶溝通奠定穩定的神經生理基礎。",
      "sources": [
        {
          "label": "美國精神醫學會（APA）強迫症臨床治療指引 (PMID: 17849776)",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "臺北市立聯合醫院松德院區：強迫症跨職類多元處遇與藥物整合治療門診",
          "href": "https://tpech.gov.taipei/mp109201/News_Content.aspx?n=86F3259FB2239188&sms=F761433975E2FD9A&s=6803CDDA4E060EFF"
        }
      ]
    }
  ],
  "pure-o": [
    {
      "name": "心智反應預防與暴露（Mental Rituals Response Prevention / ERP）",
      "grade": "實證充足",
      "summaryZh": "純強迫並非沒有強迫行為，而是把清洗或檢查搬進大腦，演變成停不下來的心智反芻、回想與自我保證。暴露與反應預防（ERP）由治療師陪同，刻意接觸引發焦慮的侵入念頭，並練習不開庭審理、不辯論、不找心智解答。當我們停止進行心智儀式，大腦會逐漸學會耐受不確定感，焦慮警報自然隨時間消退。",
      "sources": [
        {
          "label": "PubMed - Law & Boisseau (2019) Exposure and Response Prevention in the Treatment of OCD: Current Perspectives",
          "href": "https://pubmed.ncbi.nlm.nih.gov/31920413/"
        },
        {
          "label": "IOCDF 臨床專家指南 - 如何停止心智桌球：面對心智強迫推論的非涉入因應策略（NERs）",
          "href": "https://iocdf.org/expert-opinions/how-do-i-stop-thinking-about-this-what-to-do-when-youre-stuck-playing-mental-ping-pong/"
        },
        {
          "label": "董氏基金會華文心理健康網 - 強迫症衛教與心理支持資源",
          "href": "https://www.etmh.org/"
        }
      ]
    },
    {
      "name": "接納與承諾治療與正念覺察（ACT & Mindfulness-based ERP）",
      "grade": "中等",
      "summaryZh": "接納與承諾治療（ACT）教我們把腦中冒出的恐怖念頭視為客觀的心理事件或背景雜訊，練習不抓取、不分析也不用力對抗。透過認知解離與專注當下，我們學會帶著不安繼續投入生活看重的價值行動，不再讓心智反芻癱瘓日常生活節奏。",
      "sources": [
        {
          "label": "PubMed - Twohig et al. (2010) ACT vs. Progressive Relaxation Training for OCD: A Randomized Clinical Trial",
          "href": "https://pubmed.ncbi.nlm.nih.gov/20873905/"
        },
        {
          "label": "PubMed - Twohig et al. (2018) Adding ACT to Exposure and Response Prevention for OCD: A Randomized Controlled Trial",
          "href": "https://pubmed.ncbi.nlm.nih.gov/29966992/"
        }
      ]
    },
    {
      "name": "血清素藥物評估與合併治療（SSRI Pharmacotherapy & Combined Treatment）",
      "grade": "實證充足",
      "summaryZh": "當大腦警報系統過度敏銳、心智反芻劇烈到難以靠意志中斷時，經精神科醫師評估開立的選擇性血清素回收抑制劑（SSRI）能有效調節神經傳導，降低情緒底線的緊繃強度。規律服藥並維持足夠療程，能為心理治療的暴露練習提供穩固的生理基礎，兩者合併效果顯著。",
      "sources": [
        {
          "label": "PubMed - APA Practice Guideline for the Treatment of Patients With Obsessive-Compulsive Disorder",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "NICE Guideline CG31 - Obsessive-Compulsive Disorder and Body Dysmorphic Disorder Treatment",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "台灣精神醫學會 - 精神醫療臨床指引與衛教專區",
          "href": "https://www.sop.org.tw/"
        }
      ]
    },
    {
      "name": "反芻監測與停損因應（Rumination Monitoring & Self-Compassion）",
      "grade": "中等",
      "summaryZh": "反芻監測幫助我們敏銳覺察大腦何時從『被動浮現念頭』滑向了『主動開庭分析』。透過為反芻設立延遲計時、排定專屬思考時段，並在卡關時用自我慈悲語言安撫挫折，我們能逐步縮短腦內辯論的時間，重拾注意力掌控權。",
      "sources": [
        {
          "label": "IOCDF 專家衛教 - 辨識心智反芻與強迫推論的運作機制",
          "href": "https://iocdf.org/expert-opinions/how-do-i-stop-thinking-about-this-what-to-do-when-youre-stuck-playing-mental-ping-pong/"
        },
        {
          "label": "衛生福利部心理健康司 - 心理健康促進與情緒自我調節衛教專區",
          "href": "https://dep.mohw.gov.tw/DOMHAOH/"
        }
      ]
    }
  ],
  "health-anxiety": [
    {
      "name": "健康焦慮特定認知行為治療（CBT for Health Anxiety / CBT-HA）",
      "grade": "實證充足",
      "summaryZh": "健康焦慮特定認知行為治療（CBT-HA）是目前國際公認實證最充足的心理治療。治療師會協助你辨識將心跳、頭痛等正常身體訊號誤判為絕症的災難化思維，並透過行為實驗驗證『不反覆查資料或重複就醫，身體也不會崩潰』，重建對健康不確定性的接納能力。",
      "sources": [
        {
          "label": "PubMed - Tyrer et al. (2017) Cognitive-Behaviour Therapy for Health Anxiety in Medical Patients (CHAMP): RCT to 5 Years",
          "href": "https://pubmed.ncbi.nlm.nih.gov/28877841/"
        },
        {
          "label": "NHS 官方指引 - 健康焦慮症狀檢視、自助策略與認知行為治療（CBT）",
          "href": "https://www.nhs.uk/mental-health/conditions/health-anxiety/"
        },
        {
          "label": "台大醫院臨床心理中心 - 健康心理學專區：健康焦慮管理與治療",
          "href": "https://www.ntuh.gov.tw/CPC/Fpage.action?muid=1750&fid=1588"
        }
      ]
    },
    {
      "name": "保證尋求中斷與親友界線支持（Stopping Reassurance-Seeking & Family Accommodation Reduction）",
      "grade": "中等",
      "summaryZh": "反覆追問親友『我看起來還好嗎？』或天天上網查病，就像飲鴆止渴：當下能換來幾分鐘安心，卻讓大腦深信『我很危險，必須不斷確認』。親友指引強調事先約定平靜界線，以『我知道你現在很不舒服，我陪著你深呼吸，但我不替疾病背書』取代反覆保證，共同打破依賴惡性循環。",
      "sources": [
        {
          "label": "PubMed Central - Halldorsson & Salkovskis (2017) Excessive Reassurance Seeking in OCD and Health Anxiety: Functions and Differences",
          "href": "https://pmc.ncbi.nlm.nih.gov/articles/PMC5504131/"
        },
        {
          "label": "PubMed - Salkovskis & Warwick (1986) Morbid Preoccupations, Health Anxiety and Reassurance: A Cognitive-Behavioural Approach",
          "href": "https://pubmed.ncbi.nlm.nih.gov/3753387/"
        },
        {
          "label": "IOCDF 臨床家庭指南 - 與強迫及焦慮症患者同住：親友如何設立保證界線並終止共謀行為",
          "href": "https://iocdf.org/expert-opinions/expert-opinion-family-guidelines/"
        }
      ]
    },
    {
      "name": "身體感受與疾病恐懼之暴露與反應抑制（Interoceptive & Situational ERP）",
      "grade": "實證充足",
      "summaryZh": "健康焦慮的暴露療法引導個案刻意去體會引發疑慮的生理感受（如運動引發心跳加快、閉氣體驗胸悶），或閱讀醫療疾病情境，同時嚴格遵守反應抑制：不量脈搏、不反覆觸摸淋巴結、不查病論壇。反覆練習能讓自律神經習慣刺激，大腦會親自學會『身體有感受不等於生重病』。",
      "sources": [
        {
          "label": "PubMed - Weck et al. (2017) Cognitive Therapy and Exposure Therapy for Health Anxiety: A 3-Year Naturalistic Follow-Up",
          "href": "https://pubmed.ncbi.nlm.nih.gov/28956951/"
        },
        {
          "label": "PubMed - Scarella et al. (2019) Illness Anxiety Disorder: Psychopathology and Treatment",
          "href": "https://pubmed.ncbi.nlm.nih.gov/30920464/"
        }
      ]
    },
    {
      "name": "藥物評估與血清素調節劑（SSRI Pharmacotherapy for Illness Anxiety Disorder）",
      "grade": "實證充足",
      "summaryZh": "當健康焦慮導致身體整天處於高度緊繃的戰逃狀態、連日常作息與談話治療都難以專注時，經身心科醫師評估使用抗焦慮或血清素調節藥物（如 SSRI）是具扎實實證的選擇。藥物能平穩神經系統對身體訊號的過敏反射，改善伴隨的自律神經失調與失眠，協助患者更有能量投入行為改變。",
      "sources": [
        {
          "label": "PubMed - Greeven et al. (2007) Cognitive Behavior Therapy and Paroxetine in Hypochondriasis: A Randomized Controlled Trial",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17202549/"
        },
        {
          "label": "台灣精神醫學會 - 精神科藥物評估與焦慮症治療臨床指引資源",
          "href": "https://www.sop.org.tw/"
        }
      ]
    }
  ],
  "erp": [
    {
      "name": "暴露與反應預防機制：抑制學習與預期違背",
      "grade": "實證充足",
      "summaryZh": "ERP 的核心不是消除焦慮感受，而是讓大腦建立新的安全記憶。藉由有計畫地面對引發強迫擔憂的情境，並刻意練習不執行清洗或檢查等儀式，大腦會逐步發現所害怕的災難並未發生，破除『只有做儀式才能安全』的預測。透過持續接觸不確定感，強迫念頭的威脅性將自然消退，幫助患者重新拿回生活的主導權。",
      "sources": [
        {
          "label": "Craske et al. (2014) 抑制學習模式於暴露治療之優化應用（Behaviour Research and Therapy）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/24864005/"
        },
        {
          "label": "國際強迫症基金會（IOCDF）暴露與反應預防治療（ERP）臨床指引說明",
          "href": "https://iocdf.org/about-ocd/ocd-treatment-guide/exposure-response-prevention/"
        },
        {
          "label": "衛生福利部草屯療養院：走出反覆確認的迷宮：認識強迫症與ERP治療",
          "href": "https://www.ttpc.mohw.gov.tw/?aid=509&pid=0&page_name=detail&iid=1370"
        }
      ]
    },
    {
      "name": "ERP 劑量反應與階層式實踐：療程頻率與維持練習",
      "grade": "實證充足",
      "summaryZh": "多項臨床試驗與統合分析顯示 ERP 具有明確的劑量反應效應，常規每週一至二次會談或短期密集門診皆能顯著減輕症狀。治療由建立客觀的焦慮階層表開始，依序由低至高逐步挑戰，並高度倚賴日常生活的自主作業落實。唯有投入足夠的練習時數並在多種生活情境中推廣經驗，才能穩固新學習並有效降低復發風險。",
      "sources": [
        {
          "label": "Reid et al. (2021) 暴露與反應預防認知行為治療隨機對照試驗統合分析（Comprehensive Psychiatry）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/33618297/"
        },
        {
          "label": "英國國家健康照護卓越研究院（NICE CG31）強迫症階梯式照護臨床處遇指引",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "臺北市立聯合醫院松德院區：強迫症特別門診與整合治療衛教",
          "href": "https://tpech.gov.taipei/mp109201/News_Content.aspx?n=86F3259FB2239188&sms=F761433975E2FD9A&s=6803CDDA4E060EFF"
        }
      ]
    }
  ],
  "cbt": [
    {
      "name": "兒童與青少年強迫症之認知行為治療與合併處遇（POTS 模式）",
      "grade": "實證充足",
      "summaryZh": "具指標性的兒少強迫症治療研究（POTS）證實，以 ERP 為核心的認知行為治療是兒童青少年的第一線首選，中重度個案合併 SSRI 藥物治療能達到最佳的緩解效果。兒少 CBT 強調發展階段適應性，透過將症狀擬人化命名等趣味方式提升配合度，並由家長陪同建立同盟。及早啟動專業介入，能有效阻斷病程慢性化並守護孩子的學業與人際發展。",
      "sources": [
        {
          "label": "Pediatric OCD Treatment Study (POTS) Team (2004) 兒少強迫症 CBT、舍曲林與合併治療隨機對照試驗（JAMA）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/15507582/"
        },
        {
          "label": "美國精神醫學會（APA 2007）強迫症患者治療實務指引",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "董氏基金會心理衛生中心：青少年與大專心理健康自我照顧與資源",
          "href": "https://www.jtf.org.tw/psyche/"
        }
      ]
    },
    {
      "name": "認知重構與家庭心理社會支持（減少代償與親職合作）",
      "grade": "實證充足",
      "summaryZh": "CBT 結合針對過度責任感與災難化信念的認知檢驗，並將焦點擴及家庭系統的互動模式。家人出於關心常會配合代為檢查或提供反覆保證，這種『家庭調適/代償』短期雖能平息情緒，長期卻往往強化了強迫循環。透過專業家屬衛教，引導家庭成員從配合儀式轉向溫和且一致的心理支持，能大幅提升個案在生活環境中的康復動力。",
      "sources": [
        {
          "label": "臺北市立聯合醫院松德院區：強迫症特別門診家庭調適（Family Accommodation）與全隊治療衛教",
          "href": "https://tpech.gov.taipei/mp109201/News_Content.aspx?n=86F3259FB2239188&sms=F761433975E2FD9A&s=6803CDDA4E060EFF"
        },
        {
          "label": "英國國家健康照護卓越研究院（NICE NG222）成人階梯照護與共享決策原則指引",
          "href": "https://www.nice.org.uk/guidance/ng222"
        },
        {
          "label": "社團法人中華民國康復之友聯盟：精神障礙者家庭支持與復元理念推廣",
          "href": "https://www.tamiroc.org.tw/"
        }
      ]
    }
  ],
  "medication": [
    {
      "name": "第一線 SSRI 藥物治療種類與足量足期指引原則",
      "grade": "實證充足",
      "summaryZh": "國際指引（APA、NICE）一致建議選擇性血清素再吸收抑制劑（如 Fluoxetine、Sertraline、Fluvoxamine、Paroxetine、Escitalopram 等）為一線藥物。強迫症的劑量反應不同於憂鬱症，臨床常需由醫師審慎調整至指引建議的高劑量範圍，且需足期觀察 8 至 12 週（其中至少 4 至 6 週處於高劑量期）方能評估療效。藥物能協助調降焦慮基線，服藥務必規律並與醫師持續討論，切勿自行調整或停藥。",
      "sources": [
        {
          "label": "Bloch et al. (2010) 強迫症 SSRI 劑量反應關係統合分析（Molecular Psychiatry）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/19468281/"
        },
        {
          "label": "美國精神醫學會（APA 2007）強迫症患者治療實務指引",
          "href": "https://pubmed.ncbi.nlm.nih.gov/17849776/"
        },
        {
          "label": "國際強迫症基金會（IOCDF）成人強迫症藥物治療指引與劑量說明",
          "href": "https://iocdf.org/about-ocd/ocd-treatment-guide/medication/"
        },
        {
          "label": "台灣精神醫學會：血清素與強迫症治療專業衛教與就醫指引",
          "href": "https://www.sop.org.tw/"
        }
      ]
    },
    {
      "name": "難治型強迫症之二線抗精神病藥增效治療（需專科醫師評估）",
      "grade": "中等",
      "summaryZh": "當接受充分且足期的第一線 SSRI 治療後反應仍不足時，國際指引建議可在原藥物基礎上，加上低劑量第二代抗精神病藥（如 Risperidone 或 Aripiprazole）作為增效策略。臨床統合分析指出約三分之一的難治個案能因此獲得進一步改善，特別適合合併抽動症狀者。此策略具潛在代謝與神經反應等副作用，必須由精神科專科醫師嚴格評估適應症與定期監測，不得擅自用藥。",
      "sources": [
        {
          "label": "Dold et al. (2015) 難治型強迫症抗精神病藥增效隨機對照試驗更新統合分析（Int J Neuropsychopharmacol）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/25939614/"
        },
        {
          "label": "英國國家健康照護卓越研究院（NICE CG31）抗精神病藥增效與進階處遇指引",
          "href": "https://www.nice.org.uk/guidance/cg31"
        },
        {
          "label": "國際強迫症基金會（IOCDF）增效輔助用藥（Augmentation）醫學衛教",
          "href": "https://iocdf.org/about-ocd/ocd-treatment-guide/medication/"
        }
      ]
    },
    {
      "name": "難治型神經調節輔助治療：深部經顱磁刺激（rTMS）與深腦刺激（DBS）",
      "grade": "新興",
      "summaryZh": "對於嘗試多種高劑量藥物及標準 ERP 心理治療皆無改善的嚴重難治型強迫症，神經調節技術提供了調節腦部皮質—紋狀體迴路的可行選項。深部經顱磁刺激（dTMS/rTMS）屬非侵入性物理治療，已獲美國 FDA 核准輔助治療難治患者；而深腦刺激（DBS）則為植入電極的手術，僅限極少數超難治個案。此類處遇效果因人而異且伴隨風險，必須經醫學中心精神科與神經外科跨專業團隊全面評估方可考慮。",
      "sources": [
        {
          "label": "Carmi et al. (2019) 前瞻性多中心雙盲深部經顱磁刺激（dTMS）治療強迫症隨機對照試驗（Am J Psychiatry）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/31109199/"
        },
        {
          "label": "Cruz et al. (2022) 難治型強迫症深腦刺激（DBS）療效統合分析（Psychiatry Research）",
          "href": "https://pubmed.ncbi.nlm.nih.gov/36240634/"
        },
        {
          "label": "臺北市立聯合醫院松德院區：嚴重強迫症特別門診與深部腦刺激治療多元處遇衛教",
          "href": "https://tpech.gov.taipei/mp109201/News_Content.aspx?n=86F3259FB2239188&sms=F761433975E2FD9A&s=6803CDDA4E060EFF"
        }
      ]
    }
  ]
};
