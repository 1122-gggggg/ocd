import type { SupportReactionType } from "@prisma/client";

export const REACTION_LABELS: Record<
  SupportReactionType,
  { label: string; icon: string }
> = {
  UNDERSTAND: { label: "我懂你", icon: "🤝" },
  HOLD_ON: { label: "陪你一起撐", icon: "🛡️" },
  RELATABLE: { label: "我也經歷過", icon: "🌱" },
  GRATEFUL: { label: "謝謝你分享", icon: "🙏" },
  RESISTED: { label: "為你感到驕傲", icon: "✨" },
};
