import { CRISIS_KEYWORDS, CRISIS_HELP_TEXT } from "@/lib/crisis-keywords";

export type CrisisSeverity =
  | "NONE"
  | "DISTRESS"
  | "PASSIVE_IDEATION"
  | "ACTIVE_RISK"
  | "IMMINENT_DANGER";

export interface SafetyDetectionResult {
  severity: CrisisSeverity;
  isCrisis: boolean;
  score: number;
  evidence: string[];
  uncertainty: number;
  matchedKeywords: string[];
  matchedKeyword?: string;
  helpText: string | null;
  guidanceText?: string;
}

const IMMINENT_PATTERNS = [
  /(準備好|馬上|立刻|正在|現在就|已經).*(結束生命|去死|跳下去|割腕|吞藥|自殺|自盡|了結)/,
  /(準備結束生命|準備離開這個世界|決定要走了|永別了|最後一次發文|跟大家道別|遺書.*寫好|寫了遺書|告別信)/,
  /(站在頂樓|坐在頂樓|在陽台邊|在橋邊|拿著刀準備|刀已經在手上|今天就是終點)/,
  /(going to kill myself now|decided to end my life|suicide note|goodbye world|saying goodbye to everyone|jumping off the roof)/i,
];

const ACTIVE_PATTERNS = [
  /(想死|想要死|想自殺|真的不想活|活著沒意思|活著沒有意義|打算自殺|想要結束一切|找不到.*活下去的理由|好想了結生命|想自我了斷)/,
  /(好想跳樓|想要割腕|很想自傷|想結束自己的生命|今天就是終點|跳樓自盡)/,
  /(want to die|kill myself|end my life|commit suicide|jumping off|stop living)/i,
];

const PASSIVE_PATTERNS = [
  /(不想醒來|如果能睡著不再醒來|好想消失|希望自己不曾存在|活著好累好想消失|希望一覺不醒|消失在這個世界上|活著太累了如果能消失)/,
  /(wish i were dead|wish i didn't wake up|wish i could disappear|wish i never existed)/i,
];

const NEWS_OR_THIRD_PERSON_PATTERNS = [
  /(新聞|報導|文章|書上|電影|劇中|看到有人|聽說有人|他人|別人的故事|討論|看到新聞提到).*(自殺|尋死|跳樓|割腕)/,
  /(提到自殺|報導自殺|談到自殺|關於自殺的故事)/,
];

const PAST_OR_RECOVERY_PATTERNS = [
  /(以前|過去|曾經|很久以前).*(想過|嘗試過|想死|想自殺).*(現在|走出來|好了|不再|慶幸|克服|撐過)/,
  /(走過想死的日子|當初差點自殺|以前有過想死的念頭但現在)/,
];

const NEGATION_PATTERNS = [
  /(我(並)?(沒有|不會|完全不想)(去|想)?(自殺|尋死|割腕|自傷|傷害自己|想死))/,
  /(沒有要自殺|沒有想死|不是真的想死)/,
];

const DISTRESS_PATTERNS = [
  /(好崩潰|好絕望|好無助|痛苦到快窒息|快撐不下去了|快瘋掉了|受不了了|情緒低谷|走投無路|快窒息|心好累撐不住)/,
  /(completely broken|overwhelmed|hopeless|can't take this anymore)/i,
];

export function detectSafetyCrisis(text: string): SafetyDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      severity: "NONE",
      isCrisis: false,
      score: 0,
      evidence: [],
      uncertainty: 0.05,
      matchedKeywords: [],
      helpText: null,
    };
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();
  const matchedKeywords: string[] = [];

  for (const kw of CRISIS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    }
  }

  // 1. Check for News / Third-person reference without personal crisis intent
  const isNewsOrThirdPerson = NEWS_OR_THIRD_PERSON_PATTERNS.some((p) => p.test(clean));
  const isPastOrRecovery = PAST_OR_RECOVERY_PATTERNS.some((p) => p.test(clean));
  const isNegated = NEGATION_PATTERNS.some((p) => p.test(clean));

  if (isNewsOrThirdPerson || isPastOrRecovery || isNegated) {
    // If it's pure news or past narrative without current acute crisis intent
    const hasDistress = DISTRESS_PATTERNS.some((p) => p.test(clean));
    if (hasDistress) {
      return {
        severity: "DISTRESS",
        isCrisis: false,
        score: 0.4,
        evidence: ["描述過去或第三方情境中伴隨高度情緒痛苦"],
        uncertainty: 0.2,
        matchedKeywords,
        matchedKeyword: matchedKeywords[0],
        helpText: null,
        guidanceText: "看見你正在經歷沉重情緒，在互助社群裡我們會陪你一起耐受。",
      };
    }

    return {
      severity: "NONE",
      isCrisis: false,
      score: 0.1,
      evidence: [
        isNewsOrThirdPerson
          ? "新聞/第三方事件描述，非當下個人危險"
          : isPastOrRecovery
          ? "過去經歷或康復回顧，非當前急性危機"
          : "否定句式，無當前自傷意念",
      ],
      uncertainty: 0.1,
      matchedKeywords,
      matchedKeyword: matchedKeywords[0],
      helpText: null,
    };
  }

  // 2. Check IMMINENT_DANGER
  for (const pattern of IMMINENT_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        severity: "IMMINENT_DANGER",
        isCrisis: true,
        score: 0.98,
        evidence: ["偵測到即刻危急狀態、告別字眼或具體自傷意圖"],
        uncertainty: 0.05,
        matchedKeywords,
        matchedKeyword: matchedKeywords[0] || "即刻危險意圖",
        helpText: CRISIS_HELP_TEXT,
        guidanceText:
          "我們非常在乎你的生命安全。社群支持無法替代即時緊急援助，請立即撥打 119 或至就近急診，或撥打 24 小時安心專線 1925，讓專業人員即時守護你的安全。",
      };
    }
  }

  // 3. Check ACTIVE_RISK
  for (const pattern of ACTIVE_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        severity: "ACTIVE_RISK",
        isCrisis: true,
        score: 0.9,
        evidence: ["偵測到明確自傷或結束生命意念"],
        uncertainty: 0.1,
        matchedKeywords,
        matchedKeyword: matchedKeywords[0] || "強烈危機意念",
        helpText: CRISIS_HELP_TEXT,
        guidanceText:
          "感受到你現在承受著巨大的痛苦與重擔。你不需要孤單面對，請給自己一個被接住的機會，強烈建議立即撥打 24 小時免費安心專線 1925，專業輔導員會溫柔傾聽與陪伴。",
      };
    }
  }

  // 4. Check PASSIVE_IDEATION
  for (const pattern of PASSIVE_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        severity: "PASSIVE_IDEATION",
        isCrisis: true,
        score: 0.75,
        evidence: ["偵測到被動消失或無助絕望之意念"],
        uncertainty: 0.2,
        matchedKeywords,
        matchedKeyword: matchedKeywords[0] || "被動意念",
        helpText: CRISIS_HELP_TEXT,
        guidanceText:
          "生活有時真的非常疲憊沉重。在這裡，你的疲累被理解與接納。如果這份沉重讓你感到孤立無援，隨時可以聯絡安心專線 1925，或是與信任的親友聊聊。",
      };
    }
  }

  // 5. Fallback check for matched keywords that might be active
  if (matchedKeywords.length > 0) {
    return {
      severity: "ACTIVE_RISK",
      isCrisis: true,
      score: 0.85,
      evidence: [`包含危機關鍵詞: ${matchedKeywords.join(", ")}`],
      uncertainty: 0.15,
      matchedKeywords,
      matchedKeyword: matchedKeywords[0],
      helpText: CRISIS_HELP_TEXT,
      guidanceText:
        "偵測到危機關鍵字。若你正面臨難以承受的痛苦，請記得撥打 1925 安心專線，專業資源會陪伴你度過此時此刻。",
    };
  }

  // 6. Check general DISTRESS
  for (const pattern of DISTRESS_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        severity: "DISTRESS",
        isCrisis: false,
        score: 0.6,
        evidence: ["表達高度心理痛苦或情緒崩潰感"],
        uncertainty: 0.2,
        matchedKeywords: [],
        helpText: null,
        guidanceText:
          "看見你正在經歷非常艱難的時刻。在社群裡，我們會陪你一起耐受這份情緒浪潮。",
      };
    }
  }

  // 7. Normal / Neutral
  return {
    severity: "NONE",
    isCrisis: false,
    score: 0,
    evidence: [],
    uncertainty: 0.05,
    matchedKeywords: [],
    helpText: null,
  };
}
