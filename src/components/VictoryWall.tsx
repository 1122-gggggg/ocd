"use client";

import { useState } from "react";
import { VictoryItem, createVictory, cheerVictory } from "@/app/actions/recovery";
import { Avatar } from "@/components/ui";

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

  const handleCheer = async (id: string) => {
    if (!signedIn) return;

    // Optimistic cheer
    setVictories((prev) =>
      prev.map((v) => (v.id === id ? { ...v, cheersCount: v.cheersCount + 1 } : v))
    );

    try {
      await cheerVictory(id);
    } catch {
      // quiet fail
    }
  };

  return (
    <div className="space-y-4">
      {/* Input box */}
      {signedIn ? (
        <form onSubmit={handlePost} className="card p-3 sm:p-4 bg-surface-2/70 border border-line space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
              <span>✨ 今天，你抵抗了什麼強迫行為？</span>
            </span>
            <span className="text-[0.7rem] text-muted">{input.length}/500</span>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例：今天想到那個可怕的念頭，但我沒有去 Google，我深呼吸去洗碗了…"
              rows={2}
              maxLength={500}
              className="input flex-1 resize-none py-1.5 text-xs sm:text-sm"
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

              <div className="pt-2 border-t border-line/40 flex items-center justify-between">
                <span className="text-[0.7rem] text-muted">拿回了一點生活</span>
                <button
                  type="button"
                  disabled={!signedIn}
                  onClick={() => handleCheer(v.id)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-soft text-accent hover:bg-accent hover:text-white transition-colors"
                  title={signedIn ? "為他感到驕傲！" : "登入後可鼓勵"}
                >
                  <span>❤️</span>
                  <span className="font-mono font-bold">{v.cheersCount}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
