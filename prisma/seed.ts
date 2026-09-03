import { PrismaClient, BoardGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DISCLAIMER =
  "本站內容由使用者撰寫或管理員整理，僅供經驗交流，不是醫療診斷、處方或治療建議。請勿依據本站內容自行停藥或改變治療。緊急狀況請撥打 1925 或當地緊急醫療。";

type BoardSeed = {
  slug: string;
  name: string;
  description: string;
  group: BoardGroup;
  officialMd: string;
};

const boards: BoardSeed[] = [
  // SYMPTOM
  {
    slug: "contamination",
    name: "污染與清洗",
    description: "關於污染恐懼、過度清洗與清潔儀式的經驗分享。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n本版聚焦污染恐懼與清洗相關的困擾，提供病友分享因應經驗與支持。\n內容以經驗交流為主，不提供診斷與處方。\n如有需要請諮詢專業醫療人員。`,
  },
  {
    slug: "checking",
    name: "確認與檢查",
    description: "反覆確認門窗、瓦斯、文件等行為的討論。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n此區討論反覆檢查與確認的困擾，交流如何與家人溝通及日常調適。\n不提供診斷標準，請以專業評估為準。`,
  },
  {
    slug: "symmetry",
    name: "對稱與排列",
    description: "對稱、排列、整齊相關的強迫經驗。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n分享對對稱與排列的執著感受與因應策略，互相支持、減少孤立感。\n版內資訊僅供參考。`,
  },
  {
    slug: "harm",
    name: "傷害恐懼",
    description: "害怕傷害自己或他人的侵入思維。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n本版討論傷害相關的侵入思維帶來的焦慮與困擾，強調同理與非評價的交流。\n若有危機念頭請立即求助 1925。`,
  },
  {
    slug: "scrupulosity",
    name: "宗教與道德",
    description: "宗教、道德、罪惡感相關的強迫思維。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n聚焦宗教與道德主題的強迫思維，分享如何區分價值觀與症狀的困惑。\n版內非宗教或道德評判。`,
  },
  {
    slug: "sexual-intrusions",
    name: "性相關侵入思維",
    description: "性相關的非自願侵入思維與焦慮。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n此區提供對性相關侵入思維的經驗交流，理解其為症狀表現而非個人意願。\n請保持尊重與支持。`,
  },
  {
    slug: "rocd",
    name: "關係強迫",
    description: "對親密關係、伴侶關係的反覆懷疑與檢視。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n討論關係強迫中對感情與承諾的反覆懷疑，分享溝通與自我接納的經驗。\n不提供關係諮商診斷。`,
  },
  {
    slug: "pure-o",
    name: "純粹強迫思維",
    description: "以內在思維、反芻為主的強迫經驗。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n本版關注以外顯行為較少、內在反芻為主的困擾，鼓勵以文字梳理與支持。\n內容非專業治療指引。`,
  },
  {
    slug: "hoarding",
    name: "囤積",
    description: "難以丟棄物品、過度囤積的困擾。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n分享囤積相關的困擾、家庭影響與整理過程中的心情。\n請避免評價他人物品價值。`,
  },
  {
    slug: "health-anxiety",
    name: "健康焦慮",
    description: "對健康、疾病的過度擔憂與反覆確認。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n討論對健康與疾病的擔憂及反覆查證的循環，交流焦慮調適經驗。\n有身體不適請就醫。`,
  },
  {
    slug: "other-symptoms",
    name: "其他症狀",
    description: "其他未分類的強迫相關症狀。",
    group: "SYMPTOM",
    officialMd: `${DISCLAIMER}\n\n若找不到合適分類，可在此分享其他相關困擾。\n管理員會依討論熱度評估是否增設新版。`,
  },
  // TREATMENT
  {
    slug: "erp",
    name: "ERP 暴露與反應預防",
    description: "暴露與反應預防的經驗與資源。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n本版分享 ERP 相關的學習與練習心得，提醒這不是處方／請與醫師討論。\n實際療程安排需由專業人員評估。`,
  },
  {
    slug: "cbt",
    name: "CBT 認知行為治療",
    description: "認知行為治療相關的學習與經驗。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n交流 CBT 中對想法與行為的覺察練習，這不是處方／請與醫師討論。\n內容僅為經驗分享。`,
  },
  {
    slug: "medication",
    name: "藥物治療",
    description: "藥物治療的經驗與資訊交流。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n此區僅分享就醫與服藥經驗，這不是處方／請與醫師討論。\n請勿依據本站內容自行停藥或調整劑量。`,
  },
  {
    slug: "act",
    name: "ACT 接受與承諾治療",
    description: "接受與承諾治療的觀念與實踐。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n分享 ACT 中接納、價值觀與承諾行動的體會，這不是處方／請與醫師討論。\n歡迎分享練習中的困難與收穫。`,
  },
  {
    slug: "mindfulness",
    name: "正念",
    description: "正念、冥想相關的練習分享。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n分享正念與覺察練習對焦慮的幫助，這不是處方／請與醫師討論。\n鼓勵溫和、持續的練習而非追求完美。`,
  },
  {
    slug: "inpatient",
    name: "住院與日間病房",
    description: "住院、日間病房與密集治療的經驗。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n此版分享住院與日間病房的流程、心情與銜接經驗，這不是處方／請與醫師討論。\n尊重不同治療選擇。`,
  },
  {
    slug: "family-support",
    name: "家庭支持",
    description: "家人如何支持與自我照顧。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n聚焦家屬的支持技巧與自我照顧，分享溝通與界限的經驗，這不是處方／請與醫師討論。\n鼓勵家庭一起學習。`,
  },
  {
    slug: "self-help",
    name: "自助策略",
    description: "日常自助、因應技巧與生活調適。",
    group: "TREATMENT",
    officialMd: `${DISCLAIMER}\n\n分享日常可嘗試的自助策略與生活調適，這不是處方／請與醫師討論。\n小步驟的改變也值得肯定。`,
  },
  // COMMUNITY
  {
    slug: "announcements",
    name: "公告",
    description: "站務公告與重要通知。",
    group: "COMMUNITY",
    officialMd: `${DISCLAIMER}\n\n本版僅限站務發布公告，歡迎在其他版區交流。\n請留意置頂資訊與版規更新。`,
  },
  {
    slug: "newcomers",
    name: "新手區",
    description: "新成員自我介紹與使用說明。",
    group: "COMMUNITY",
    officialMd: `${DISCLAIMER}\n\n歡迎新朋友在此自我介紹、提問使用方式。\n友善回應，一起營造支持的氛圍。`,
  },
  {
    slug: "family",
    name: "家屬專區",
    description: "家屬間的經驗交流與支持。",
    group: "COMMUNITY",
    officialMd: `${DISCLAIMER}\n\n此區供家屬彼此支持，分享照顧經驗與心情調適。\n請互相尊重、不評價彼此的家庭選擇。`,
  },
  {
    slug: "clinical",
    name: "臨床交流",
    description: "臨床工作者與病友的專業交流（需驗證）。",
    group: "COMMUNITY",
    officialMd: `${DISCLAIMER}\n\n本版僅限已驗證臨床者發文，回覆則開放所有登入用戶。\n內容仍非個別診療建議，請依個別情況諮詢專業人員。`,
  },
];

async function main() {
  // Fail closed: never seed a weak/default admin password into any database.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (
    !adminPassword ||
    adminPassword === "changeme-admin" ||
    adminPassword.length < 12
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD 未設定或過於脆弱：請設定至少 12 個字元的強密碼後再執行 seed（拒絕預設值 changeme-admin）。",
    );
  }
  const hash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ocd.local" },
    update: {
      nickname: "站務",
      role: "ADMIN",
      profileComplete: true,
      passwordHash: hash,
    },
    create: {
      email: "admin@ocd.local",
      nickname: "站務",
      role: "ADMIN",
      profileComplete: true,
      passwordHash: hash,
      memberType: "PATIENT",
    },
  });
  for (const b of boards) {
    // Idempotent: officialMd is seed-only content — never overwrite it once
    // an admin has edited the board in production.
    await prisma.board.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        group: b.group,
        status: "ACTIVE",
      },
      create: {
        slug: b.slug,
        name: b.name,
        description: b.description,
        group: b.group,
        officialMd: b.officialMd,
        status: "ACTIVE",
      },
    });
  }

  const announcements = await prisma.board.findUnique({ where: { slug: "announcements" } });
  if (announcements) {
    const existing = await prisma.post.findFirst({
      where: { boardId: announcements.id, title: "歡迎來到強迫症互助坊" },
    });
    if (!existing) {
      await prisma.post.create({
        data: {
          boardId: announcements.id,
          authorId: admin.id,
          title: "歡迎來到強迫症互助坊",
          bodyMd: `${DISCLAIMER}\n\n歡迎來到強迫症互助坊，這裡是病友、家屬與臨床工作者互相支持、分享經驗的空間。\n請友善交流，尊重多元經驗。\n\n需要協助時：\n- 衛生福利部安心專線 **1925**（24 小時）\n- https://www.iasp.info/suicidalthoughts/\n`,
          isAnonymous: false,
        },
      });
    }
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
