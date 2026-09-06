export interface ReassuranceResponseStrategy {
  title: string;
  leadMessage: string;
  options: Array<{
    id: string;
    label: string;
    actionType: "HOLD_TOGETHER" | "READ_STORIES" | "URGE_SURFING";
    hint: string;
  }>;
}

export function getReassuranceResponseStrategy(): ReassuranceResponseStrategy {
  return {
    title: "💡 溫柔提醒：你現在很痛苦，大腦正在催促你得到 100% 確定的答案",
    leadMessage:
      "我們理解你此刻無比焦慮，但根據 IOCDF 臨床指引，直接回答「你絕對沒事」反而會加固大腦的強迫警報。我們更願意陪你這樣度過：",
    options: [
      {
        id: "hold_together",
        label: "我想有人陪我撐過這個念頭（不求答案）",
        actionType: "HOLD_TOGETHER",
        hint: "進入互助大廳，讓病友陪伴你耐受當下的不確定感",
      },
      {
        id: "read_stories",
        label: "我想看看其他病友怎麼走過類似時刻",
        actionType: "READ_STORIES",
        hint: "閱讀 Reddit 康復者如何停止確認並拿回生活",
      },
      {
        id: "urge_surfing",
        label: "我想做一個 2 分鐘的「不求答案練習」",
        actionType: "URGE_SURFING",
        hint: "暫停 120 秒深呼吸，讓大腦的焦慮浪潮自然消退",
      },
    ],
  };
}
