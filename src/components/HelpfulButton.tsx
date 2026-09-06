"use client";

import { useState } from "react";
import { toggleHelpful } from "@/app/actions/helpful";

export function HelpfulButton({
  targetType,
  targetId,
  initialCount,
  initialVoted,
}: {
  targetType: "POST" | "REPLY";
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (pending) return;
    setPending(true);
    const prevVoted = voted;
    const prevCount = count;
    // 樂觀更新：+1 / -1
    setVoted(!voted);
    setCount((c) => (voted ? Math.max(c - 1, 0) : c + 1));
    try {
      const res = (await toggleHelpful(targetType, targetId)) as {
        ok: boolean;
        voted?: boolean;
        count?: number;
      };
      if (!res.ok) {
        // 失敗回滾
        setVoted(prevVoted);
        setCount(prevCount);
      } else {
        if (typeof res.count === "number") setCount(res.count);
        if (typeof res.voted === "boolean") setVoted(res.voted);
      }
    } catch {
      setVoted(prevVoted);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={voted}
      title={voted ? "取消「有幫助」" : "這則對我有幫助"}
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all select-none ${
        voted
          ? "bg-accent-soft border-accent/60 text-accent font-medium shadow-xs"
          : "bg-surface border-line text-muted hover:border-accent/40 hover:text-fg"
      } ${pending ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
    >
      <span aria-hidden>👍</span>
      <span>{voted ? "有幫助 ✓" : "有幫助"}</span>
      {count > 0 && <span className="font-mono ml-0.5">{count}</span>}
    </button>
  );
}
