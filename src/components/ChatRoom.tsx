"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatMessageItem, sendChatMessage } from "@/app/actions/chat";
import { Avatar } from "@/components/ui";
import { authorBadge } from "@/lib/display";
import { CRISIS_HELP_TEXT } from "@/lib/crisis-keywords";

const SUPPORT_PRESETS = [
  { label: "🤝 我懂這種感覺", text: "我懂那種腦袋一直逼你確認的感覺，真的辛苦了。" },
  { label: "🛡️ 陪你一起撐過", text: "不需要現在解決它，我陪你待在這裡一起面對不確定性。" },
  { label: "🔄 辨識強迫警報", text: "這可能是大腦的強迫警報又在響了，試著先不跳下去跟它辯論。" },
  { label: "✨ 今天也有做到", text: "即使很焦慮，你今天也抵抗了一次強迫行為，為你感到驕傲！" },
];

export function ChatRoom({
  initialMessages,
  user,
}: {
  initialMessages: ChatMessageItem[];
  user: { id: string; nickname: string; memberType: string } | null;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isNoAnswerNeeded, setIsNoAnswerNeeded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);
  const [inlineIntervention, setInlineIntervention] = useState<{
    type: string;
    title: string;
    message: string;
    options?: Array<{ id: string; label: string; actionType: string }>;
  } | null>(null);

  // 2-minute urge surfing / delay timer
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const latestMessageTimeRef = useRef<string>(
    initialMessages.length > 0 ? (initialMessages[initialMessages.length - 1]?.createdAt ?? "") : ""
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const afterParam = latestMessageTimeRef.current
          ? `&after=${encodeURIComponent(latestMessageTimeRef.current)}`
          : "";
        const res = await fetch(`/api/chat?channel=general${afterParam}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.ok && Array.isArray(json.messages) && json.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = json.messages.filter((m: ChatMessageItem) => !existingIds.has(m.id));
            if (newOnes.length === 0) return prev;
            const updated = [...prev, ...newOnes];
            latestMessageTimeRef.current = updated[updated.length - 1].createdAt;
            return updated;
          });
        }
      } catch (e) {
        // quiet fail on network blips
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 2-minute timer countdown
  useEffect(() => {
    if (!timerActive) return;
    if (secondsLeft <= 0) {
      setTimerActive(false);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, secondsLeft]);

  const handleStartTimer = () => {
    setSecondsLeft(120);
    setTimerActive(true);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);

    const messageContent = isNoAnswerNeeded
      ? `【🔕 純心情・不需解答】\n${trimmed}`
      : trimmed;

    try {
      const res = await sendChatMessage("general", messageContent);
      if (!res.ok) {
        setError(res.message || "發送失敗");
      } else if (res.data) {
        setMessages((prev) => [...prev, res.data!]);
        latestMessageTimeRef.current = res.data.createdAt;
        setInput("");
        setIsNoAnswerNeeded(false);
        if (res.intervention && (res.intervention.severity === "CRITICAL" || res.intervention.severity === "HIGH")) {
          setCrisisAlert(res.crisisHelp || res.intervention.message);
          setInlineIntervention(null);
        } else if (res.crisisHelp) {
          setCrisisAlert(res.crisisHelp);
          setInlineIntervention(null);
        } else if (res.intervention && res.intervention.severity !== "NONE" && res.intervention.type !== "NONE") {
          setInlineIntervention({
            type: res.intervention.type,
            title: res.intervention.title,
            message: res.intervention.message,
            options: res.intervention.options,
          });
          setCrisisAlert(null);
        } else {
          setCrisisAlert(null);
          setInlineIntervention(null);
        }
      }
    } catch (err) {
      setError("網路連線不穩定，請稍候重試");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] max-h-[850px] min-h-[550px] card overflow-hidden border border-line bg-surface">
      {/* Support ≠ Reassurance Guideline Header */}
      <div className="p-3 sm:p-4 bg-accent-soft/40 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-accent text-sm sm:text-base">
              💬 即時互助陪伴大廳
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-medium">
              支持 ≠ 保證
            </span>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            我們陪伴彼此耐受焦慮與不確定性，不提供「不會怎樣啦」等短暫保證（那會助長強迫循環）。
          </p>
        </div>

        {/* 2-min Urge Surfing Tool */}
        <div className="shrink-0">
          {!timerActive ? (
            <button
              type="button"
              onClick={handleStartTimer}
              className="btn btn-secondary btn-xs text-xs flex items-center gap-1.5"
              title="當下想瘋狂確認或反芻時，讓自己停下 2 分鐘，呼吸並等待衝動浪潮自然過去"
            >
              ⏳ 我現在卡住了（2分鐘不求答案練習）
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-warning-soft px-2.5 py-1 rounded-md border border-warning/30 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-warning animate-ping" />
              <span className="font-mono font-bold text-fg">
                衝動衝浪中：{Math.floor(secondsLeft / 60)}:
                {String(secondsLeft % 60).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setTimerActive(false)}
                className="text-muted hover:text-fg text-xs underline ml-1"
              >
                結束
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timer banner when active */}
      {timerActive && (
        <div className="bg-warning-soft/70 p-3 border-b border-warning/30 text-xs text-fg flex items-start gap-2.5 animate-fadeIn">
          <span className="text-base">🌊</span>
          <div>
            <p className="font-semibold">
              現在大腦正在催促你立刻尋找 100% 確定的答案。
            </p>
            <p className="text-muted mt-0.5">
              試著不查資料、不反覆確認、不跟念頭辯論。專注於緩慢深長的吐氣，讓焦慮像海浪一樣經過你。我們陪你撐過這
              2 分鐘。
            </p>
          </div>
        </div>
      )}

      {/* Crisis banner if triggered */}
      {crisisAlert && (
        <div className="bg-danger-soft p-3 border-b border-danger/30 text-xs text-danger flex items-start justify-between gap-2">
          <div>
            <p className="font-bold">⚠️ 需要即時專業協助提醒</p>
            <p className="whitespace-pre-line mt-1">{CRISIS_HELP_TEXT}</p>
          </div>
          <button
            type="button"
            onClick={() => setCrisisAlert(null)}
            className="text-danger hover:underline text-xs"
          >
            關閉
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
            <span className="text-3xl mb-2">🌱</span>
            <p className="font-medium text-fg">陪伴大廳已準備好</p>
            <p className="text-xs max-w-sm mt-1">
              說說你今天卡住的片刻，或是留下一句溫暖的「我懂、陪你撐過」。
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = user?.id === m.sender.id;
            const isNoAnswer = m.content.startsWith("【🔕 純心情・不需解答】");
            const displayBody = isNoAnswer
              ? m.content.replace("【🔕 純心情・不需解答】\n", "")
              : m.content;

            return (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="shrink-0 mt-0.5">
                  <Avatar name={m.sender.nickname} size="sm" />
                </div>
                <div
                  className={`max-w-[82%] sm:max-w-[70%] space-y-1 ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-xs text-muted ${
                      isMe ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <span className="font-medium text-fg">{m.sender.nickname}</span>
                    {authorBadge(m.sender.memberType, m.sender.clinicianStatus) && (
                      <span className="text-[0.7rem] px-1.5 py-0.5 rounded bg-surface-3 text-muted">
                        {authorBadge(m.sender.memberType, m.sender.clinicianStatus)}
                      </span>
                    )}
                    <time dateTime={m.createdAt}>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>

                  <div
                    className={`p-3 rounded-2xl whitespace-pre-wrap break-words leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-accent text-white rounded-tr-none"
                        : "bg-surface-2 text-fg border border-line rounded-tl-none"
                    }`}
                  >
                    {isNoAnswer && (
                      <div
                        className={`inline-block text-[0.7rem] px-2 py-0.5 mb-1.5 rounded-full font-medium ${
                          isMe
                            ? "bg-white/20 text-white"
                            : "bg-accent-soft text-accent"
                        }`}
                      >
                        🔕 純抒發・不需提供解答
                      </div>
                    )}
                    <p>{displayBody}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Support Chips */}
      {user && (
        <div className="px-3 py-2 bg-surface-2/60 border-t border-line flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
          <span className="text-muted shrink-0 text-[0.75rem]">快速陪伴：</span>
          {SUPPORT_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput(p.text)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-surface border border-line hover:border-accent hover:text-accent transition-colors text-xs text-fg"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Private Inline Support Intervention (Visible only to sender) */}
      {inlineIntervention && (
        <div className="mx-3 mt-2 p-3 rounded-xl bg-surface-2 border border-accent/30 text-xs flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-accent text-xs flex items-center gap-1.5">
              <span>💡</span>
              <span>{inlineIntervention.title}</span>
              <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-surface-3 text-muted">
                個人專屬提示・僅你看得見
              </span>
            </span>
            <button
              type="button"
              onClick={() => setInlineIntervention(null)}
              className="text-muted hover:text-fg text-xs p-0.5"
              aria-label="關閉提示"
            >
              ✕
            </button>
          </div>
          <p className="text-fg leading-relaxed text-[0.75rem]">{inlineIntervention.message}</p>
          {inlineIntervention.options &&
            inlineIntervention.options.some((o) => o.actionType === "URGE_SURFING") && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    handleStartTimer();
                    setInlineIntervention(null);
                  }}
                  className="btn btn-secondary btn-xs"
                >
                  ⏳ 開啟 2 分鐘衝浪練習
                </button>
              </div>
            )}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 bg-surface border-t border-line">
        {user ? (
          <form onSubmit={handleSend} className="space-y-2">
            {error && <p className="text-xs text-danger font-medium">{error}</p>}
            <div className="flex items-center justify-between text-xs text-muted">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-fg select-none">
                <input
                  type="checkbox"
                  checked={isNoAnswerNeeded}
                  onChange={(e) => setIsNoAnswerNeeded(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span>🔕 我只想說說，不需任何建議或分析</span>
              </label>
              <span>{input.length} / 1000</span>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="寫下你的感受，或給予他人不評判的同理與陪伴… (Enter 發送，Shift+Enter 換行)"
                rows={2}
                maxLength={1000}
                className="input flex-1 resize-none py-2 text-sm leading-relaxed"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="btn btn-primary shrink-0 h-[58px] px-5 flex items-center justify-center font-medium"
              >
                {sending ? "發送中…" : "發送"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-2 text-xs text-muted flex items-center justify-center gap-2">
            <span>登入後即可加入即時互助陪伴聊天室</span>
            <Link href="/login" className="btn btn-primary btn-xs">
              登入
            </Link>
            <Link href="/register" className="btn btn-ghost btn-xs">
              註冊
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
