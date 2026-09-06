"use client";

import { useState } from "react";
import { VictoryItem, createVictory } from "@/app/actions/recovery";
import { Avatar } from "@/components/ui";
import { SupportReactions } from "@/components/SupportReactions";

export function VictoryWall({
  initialVictories,
  signedIn,
}: {
  initialVictories: VictoryItem[];
  signedIn: boolean;
}) {
  const [victories, setVictories] = useState<VictoryItem[]>(initialVictories);
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signedIn || !input.trim() || posting) return;

    setPosting(true);
    setError(null);

    try {
      const res = await createVictory(input);
      if (!res.ok) {
        setError(res.message || "發布失敗");
      } else if (res.victory) {
        setVictories((prev) => [res.victory!, ...prev]);
        setInput("");
      }
    } catch {
      setError("網路連線異常，請稍候重試");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Post a Victory form */}
      {signedIn ? (
        <form onSubmit={handlePost} className="card p-3 sm:p-4 bg-surface-2/70 border border-line space-y-2">
          {error && <p className="text-xs text-danger">{error}</p>}
          <label className="block text-xs font-semibold text-fg">
            分享你今天對抗強迫的一個小小勝利：
          </label>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例：今天洗手時腦袋叫我洗第 3 次，我深呼吸數了 30 秒，轉身離開了浴室！"
              rows={2}
              maxLength={500}
              className="input flex-1 text-xs py-2 leading-relaxed resize-none"
              disabled={posting}
            />
            <button
              type="submit"
              disabled={posting || !input.trim()}
              className="btn btn-primary btn-sm shrink-0 h-[52px]"
            >
              {posting ? "發布中…" : "分享勝利"}
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-3 text-center text-xs text-muted">
          登入後即可在勝利牆分享你今天「奪回生活」的微小勝利。
        </div>
      )}

      {/* Grid of Victories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {victories.length === 0 ? (
          <div className="col-span-full text-center py-6 text-xs text-muted card p-4">
            目前還沒有人留下今天的勝利，換你當第一個！
          </div>
        ) : (
          victories.map((v) => (
            <div
              key={v.id}
              className="card p-3 bg-surface border border-line hover:border-accent/40 transition-colors flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <Avatar name={v.user.nickname} size="sm" />
                    <span className="font-medium text-fg">{v.user.nickname}</span>
                  </div>
                  <time className="text-[0.7rem]">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-xs sm:text-sm text-fg leading-relaxed whitespace-pre-wrap">
                  {v.content}
                </p>
              </div>

              <div className="pt-2 border-t border-line/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.7rem] text-muted">拿回了一點生活</span>
                </div>
                <SupportReactions
                  targetType="VICTORY"
                  targetId={v.id}
                  initialCounts={
                    v.reactionCounts || {
                      UNDERSTAND: 0,
                      HOLD_ON: 0,
                      RELATABLE: 0,
                      GRATEFUL: 0,
                      RESISTED: 0,
                      userReacted: [],
                    }
                  }
                  signedIn={signedIn}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
