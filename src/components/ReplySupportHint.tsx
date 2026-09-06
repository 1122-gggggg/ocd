"use client";

import { useState } from "react";

interface ReplySupportHintProps {
  parentSupportMode?: string | null;
  hintMessage?: string | null;
}

export function ReplySupportHint({
  parentSupportMode,
  hintMessage,
}: ReplySupportHintProps) {
  const [dismissed, setDismissed] = useState(false);

  // Only show if there's an explicit hint or if parent post has specific support guidance
  const needsHint =
    Boolean(hintMessage) ||
    parentSupportMode === "EMPATHY" ||
    parentSupportMode === "FACING_OCD";

  if (!needsHint || dismissed) return null;

  const defaultMessage =
    parentSupportMode === "EMPATHY"
      ? "這篇貼文比較適合用陪伴與經驗回覆，而不是替對方確認答案。"
      : parentSupportMode === "FACING_OCD"
      ? "發文者正在抵抗強迫衝動，建議多給予耐受焦慮的陪伴，避免提供確定性保證。"
      : "提醒：在 OCD 互助中，陪伴與分享走過經驗比替對方解答更具復原價值。";

  const messageToDisplay = hintMessage || defaultMessage;

  return (
    <div className="p-2.5 rounded-lg bg-surface-2 border border-accent/30 text-xs text-muted flex items-start justify-between gap-2 animate-fadeIn">
      <div className="flex items-start gap-2">
        <span className="text-sm">💡</span>
        <p className="leading-relaxed text-fg">{messageToDisplay}</p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-fg text-xs shrink-0 px-1"
        aria-label="關閉提示"
      >
        ✕
      </button>
    </div>
  );
}
