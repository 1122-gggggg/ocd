export interface ReassuranceRule {
  id: string;
  pattern: RegExp;
  weight: number;
  description: string;
}

export const REASSURANCE_RULES: readonly ReassuranceRule[] = [
  {
    id: "check_if_fine",
    pattern: /(這樣|到底|會不會)(是不是|算不算)?(沒事|正常|生病|感染|得病|死掉|壞掉|懷孕)/,
    weight: 0.8,
    description: "詢問特定事件是否算正常或沒事",
  },
  {
    id: "ask_guarantee",
    pattern: /(保證|確認一下|替我確認|求安慰|求保證|告訴我沒事|跟我說不會)/,
    weight: 0.9,
    description: "明確尋求外部保證或確認",
  },
  {
    id: "am_i_bad_person",
    pattern: /(我是不是(個)?(壞人|變態|怪物|罪人|反社會|冷血|假好人|潛在殺人犯))/,
    weight: 0.9,
    description: "道德或人格本質的侵入性尋求確認",
  },
  {
    id: "harm_fear_reassurance",
    pattern: /(我會不會(真的)?(去)?(傷害|殺|砍|推|掐|侵犯)|我會不會失控)/,
    weight: 0.85,
    description: "傷害或失控疑慮的再保證尋求",
  },
  {
    id: "rocd_reassurance",
    pattern: /(我是不是(真的)?不愛(他|她|伴侶)|這算不算(真愛|適合)|要不要分手)/,
    weight: 0.75,
    description: "關係強迫的確定性尋求",
  },
  {
    id: "contamination_checking",
    pattern: /(碰(到|了)|摸(到|了)|洗了\d+次|有沒有毒|有沒有細菌|有沒有洗乾淨)/,
    weight: 0.7,
    description: "清潔與汙染相關的重複確認",
  },
  {
    id: "english_reassurance",
    pattern: /(am i a (bad|terrible) person|please reassure me|is it possible that i (am|did)|can someone tell me i'm fine)/i,
    weight: 0.85,
    description: "英文常見求保證句型",
  },
] as const;
