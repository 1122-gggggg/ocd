"use client";

import { useState } from "react";
import {
  toggleSupportReaction,
  SupportReactionCounts,
} from "@/app/actions/reactions";
import { REACTION_LABELS } from "@/lib/ocd/reactions";
import type { ReactionTargetType, SupportReactionType } from "@prisma/client";

export function SupportReactions({
  targetType,
  targetId,
  initialCounts,
  signedIn,
}: {
  targetType: ReactionTargetType;
  targetId: string;
  initialCounts: SupportReactionCounts;
  signedIn: boolean;
}) {
  const [counts, setCounts] = useState<SupportReactionCounts>(initialCounts);
  const [loading, setLoading] = useState<SupportReactionType | null>(null);

  const handleToggle = async (type: SupportReactionType) => {
    if (!signedIn || loading) return;
    setLoading(type);

    const isReacted = counts.userReacted?.includes(type);
    const newCount = isReacted
      ? Math.max((counts[type] || 1) - 1, 0)
      : (counts[type] || 0) + 1;

    const newUserReacted = isReacted
      ? (counts.userReacted || []).filter((t) => t !== type)
      : [...(counts.userReacted || []), type];

    // Optimistic update
    setCounts((prev) => ({
      ...prev,
      [type]: newCount,
      userReacted: newUserReacted,
    }));

    try {
      const res = await toggleSupportReaction(targetType, targetId, type);
      if (!res.ok) {
        // Revert on failure
        setCounts(initialCounts);
      }
    } catch {
      setCounts(initialCounts);
    } finally {
      setLoading(null);
    }
  };

  const reactionTypes: SupportReactionType[] = [
    "UNDERSTAND",
    "HOLD_ON",
    "RELATABLE",
    "GRATEFUL",
    "RESISTED",
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      {reactionTypes.map((type) => {
        const item = REACTION_LABELS[type];
        const hasReacted = counts.userReacted?.includes(type);
        const count = counts[type] || 0;

        return (
          <button
            key={type}
            type="button"
            disabled={!signedIn}
            onClick={() => handleToggle(type)}
            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all select-none ${
              hasReacted
                ? "bg-accent-soft border-accent/60 text-accent font-medium shadow-xs"
                : "bg-surface border-line text-muted hover:border-accent/40 hover:text-fg"
            } ${!signedIn ? "opacity-75 cursor-default" : "cursor-pointer"}`}
            title={signedIn ? `給予「${item.label}」支持` : "登入後可給予支持"}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {count > 0 && <span className="font-mono ml-0.5">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
