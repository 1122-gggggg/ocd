/**
 * 新手路徑 — 每個症狀 learn 頁的三站陪伴（①讀懂 → ②看看走過來的人 → ③今晚就能做）。
 *
 * 約束：
 * - href 全靜態：read 連站內 learn 治療篇、peers 連同主題 board（?sort=solved）、
 *   practice 連 /recovery；board 不存在的 slug 用 /search?q=關鍵字 代替，絕不連死路。
 * - TREATMENT / CLINIC 類 slug 不配對，頁面層無配對時不渲染。
 * - 繁中溫柔語氣，不做排名、不做分數、不做連續打卡。
 */

export interface PathwayStop {
  label: string;
  href: string;
}

export interface Pathway {
  read: PathwayStop;
  peers: PathwayStop;
  practice: PathwayStop;
}

const peers = (boardSlug: string): PathwayStop => ({
  label: "看看走過來的人",
  href: `/b/${boardSlug}?sort=solved`,
});

const PRACTICE: PathwayStop = {
  label: "今晚就能做的一小步",
  href: "/recovery",
};

const READ_ERP: PathwayStop = {
  label: "讀懂它：暴露與反應預防（ERP）",
  href: "/learn/erp",
};

const READ_CBT: PathwayStop = {
  label: "讀懂它：認知行為治療（CBT）",
  href: "/learn/cbt",
};

export const PATHWAY: Record<string, Pathway> = {
  contamination: { read: READ_ERP, peers: peers("contamination"), practice: PRACTICE },
  checking: { read: READ_ERP, peers: peers("checking"), practice: PRACTICE },
  symmetry: { read: READ_ERP, peers: peers("symmetry"), practice: PRACTICE },
  harm: { read: READ_ERP, peers: peers("harm"), practice: PRACTICE },
  scrupulosity: { read: READ_ERP, peers: peers("scrupulosity"), practice: PRACTICE },
  "sexual-intrusions": {
    read: READ_ERP,
    peers: peers("sexual-intrusions"),
    practice: PRACTICE,
  },
  "pure-o": { read: READ_ERP, peers: peers("pure-o"), practice: PRACTICE },
  rocd: { read: READ_ERP, peers: peers("rocd"), practice: PRACTICE },
  hoarding: { read: READ_CBT, peers: peers("hoarding"), practice: PRACTICE },
  "health-anxiety": {
    read: READ_CBT,
    peers: peers("health-anxiety"),
    practice: PRACTICE,
  },
  "other-symptoms": {
    read: READ_ERP,
    peers: peers("other-symptoms"),
    practice: PRACTICE,
  },
  // gaze-ocd 尚無對應 board，以站內搜尋代替，不連死路。
  "gaze-ocd": {
    read: READ_ERP,
    peers: { label: "看看走過來的人", href: "/search?q=餘光強迫" },
    practice: PRACTICE,
  },
};
