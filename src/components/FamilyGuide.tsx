import Link from "next/link";

const PHRASES: { no: string; yes: string; why: string }[] = [
  {
    no: "我保證，絕對沒事，不會發生你擔心的事",
    yes: "不確定真的很難受，我在這裡陪你一起撐過這一波",
    why: "保證當下能止痛，卻讓大腦學會「焦慮就要討保證」，強迫循環反而越餵越大；陪伴把不確定還給對方，練習和未知共處。",
  },
  {
    no: "你不要再想了，想開一點就好",
    yes: "這個念頭一直纏著你一定很累，要說說現在最難受的部分嗎",
    why: "叫對方別想，只會讓念頭黏得更緊；把話題從評價轉回傾聽，對方才覺得有人懂，而不是孤單一個人對抗。",
  },
  {
    no: "你再去檢查一次，確定沒問題就安心了",
    yes: "我知道你很想再確認一次，我陪你先等十分鐘，看看焦慮會怎麼變化好嗎",
    why: "多一次檢查就是多一次保證，循環永遠填不滿；一起溫柔地延後行為，是陪對方奪回一點點主導權。",
  },
  {
    no: "你這樣洗／排／收太誇張了，快停下來",
    yes: "我看得出你停不下來很辛苦，我不會罵你，我們一起想想現在能鬆一點點的地方",
    why: "責備只會加上羞愧，讓症狀更難說出口；不評價的陪伴，才能讓對方在不被推著走的狀態下慢慢鬆手。",
  },
  {
    no: "都是因為你，我們全家都被拖累了",
    yes: "照顧你我有時也會累，我去家屬版區透透氣，你也值得有人陪",
    why: "累是真的，但怪罪會把兩個人都推進自責；家屬先接住自己，才有力氣用溫柔的方式繼續陪，而不是一起耗盡。",
  },
];

export function FamilyGuide() {
  return (
    <section aria-labelledby="learn-family-guide" className="space-y-3">
      <h2 id="learn-family-guide" className="section-title">
        給家屬：不給保證的 5 句話
      </h2>
      <div className="card card-pad space-y-4">
        <p className="text-sm text-muted leading-relaxed">
          半夜最難的不是不愛，而是太想幫忙，一不小心就給了保證。保證會餵大強迫循環；換一句陪伴的話，把不確定溫柔地還給對方，就是最好的幫忙。
        </p>
        <ol className="space-y-3">
          {PHRASES.map((item, index) => (
            <li
              key={item.yes}
              className="rounded-xl border border-line/60 bg-surface-2 p-3 space-y-1.5"
            >
              <p className="text-sm font-medium text-fg">
                {index + 1}．別說「{item.no}」
              </p>
              <p className="text-sm leading-relaxed text-fg">
                <span aria-hidden="true" className="text-accent">
                  →{" "}
                </span>
                改說「{item.yes}」
              </p>
              <p className="text-xs text-muted leading-relaxed">
                為什麼：{item.why}
              </p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/b/family"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <span>去家屬版區，和懂的人說說話</span>
            <span aria-hidden="true">→</span>
          </Link>
          <span aria-hidden="true" className="text-xs text-subtle">
            ·
          </span>
          <Link
            href="/chat"
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <span>去陪伴大廳，今晚不一個人撐</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
