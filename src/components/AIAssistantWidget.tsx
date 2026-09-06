"use client";

import { useState } from "react";
import Link from "next/link";
import {
  analyzeTextSupport,
  submitSupportFeedback,
  AssistantAnalysisResult,
} from "@/app/actions/ocd-engine";

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AssistantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Feedback state
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  // 2-min Urge Surfing timer inside widget
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || analyzing) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setFeedbackSent(false);

    try {
      const res = await analyzeTextSupport(input);
      if (!res.ok) {
        setError(res.message || "分析失敗");
      } else if (res.result) {
        setResult(res.result);
      }
    } catch {
      setError("連線異常，請稍候重試");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
    setError(null);
    setFeedbackSent(false);
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!result?.interactionId || feedbackLoading || feedbackSent) return;
    setFeedbackLoading(true);
    try {
      await submitSupportFeedback(result.interactionId, helpful);
      setFeedbackSent(true);
    } catch {
      // quiet fail
    } finally {
      setFeedbackLoading(false);
    }
  };

  const startUrgeSurf = () => {
    setSecondsLeft(120);
    setTimerActive(true);
  };

  return (
    <>
      {/* Floating launcher button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-primary shadow-lg flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:scale-105 transition-transform"
          aria-expanded={open}
          aria-label="開啟 OCD 支持導航助手"
        >
          <span className="text-base">🧭</span>
          <span>支持導航助手</span>
        </button>
      </div>

      {/* Slide-in / Modal panel */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] max-h-[82vh] flex flex-col card shadow-2xl border border-accent/40 bg-surface overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-accent text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧭</span>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  OCD 支持導航助手
                </h3>
                <p className="text-[0.7rem] text-white/80">
                  辨認強迫循環・不提供虛假保證・引導同儕陪伴與復原
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white text-lg p-1"
              aria-label="關閉"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
            {/* Mission disclaimer */}
            <div className="p-2.5 rounded-lg bg-surface-2 border border-line text-muted text-[0.75rem] leading-relaxed">
              💡 <strong>非醫療診斷・不提供「你一定沒事」的保證</strong>
              <br />
              此助手陪伴你辨認強迫警報（Trigger → Obsession → Anxiety → Compulsion）並練習耐受不確定性。
            </div>

            {/* Input form */}
            <form onSubmit={handleAnalyze} className="space-y-2">
              <label className="block font-semibold text-fg">
                說說你腦袋裡現在卡住的念頭或想確認的事：
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例：我剛才碰了門把洗了三次手，會不會把致命病毒帶給家人？我是不是壞人？"
                rows={3}
                className="input w-full resize-none text-xs py-2 leading-relaxed"
                disabled={analyzing}
              />
              {error && <p className="text-danger">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted hover:text-fg text-[0.75rem]"
                >
                  清空
                </button>
                <button
                  type="submit"
                  disabled={analyzing || !input.trim()}
                  className="btn btn-primary btn-xs px-3 py-1"
                >
                  {analyzing ? "辨認循環中…" : "辨認念頭與循環"}
                </button>
              </div>
            </form>

            {/* 2-minute urge surfing timer banner if started */}
            {timerActive && (
              <div className="p-3 bg-warning-soft/70 border border-warning/30 rounded-xl space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-fg flex items-center gap-1.5">
                    <span>⏳ 衝動衝浪計時中：</span>
                    <span className="font-mono text-accent">
                      {Math.floor(secondsLeft / 60)}:
                      {String(secondsLeft % 60).padStart(2, "0")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTimerActive(false)}
                    className="text-muted hover:text-fg text-[0.7rem] underline"
                  >
                    結束練習
                  </button>
                </div>
                <p className="text-muted text-[0.7rem] leading-relaxed">
                  大腦正在催促你立刻尋求保證或檢查。試著緩慢深長吐氣，讓焦慮像海浪一樣經過你，不採取任何強迫反應。
                </p>
              </div>
            )}

            {/* Analysis Result */}
            {result && (
              <div className="p-3.5 rounded-xl bg-surface-2 border border-accent/30 space-y-3 animate-fadeIn">
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-accent">
                    {result.intervention.title}
                  </span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
                    {result.detectedType === "CRISIS"
                      ? "⚠️ 需即時支援"
                      : result.detectedType === "REASSURANCE_SEEKING"
                      ? "💡 求保證模式"
                      : result.detectedType === "COMPULSION_LOOP"
                      ? "🔄 強迫循環"
                      : "🌱 一般抒發"}
                  </span>
                </div>

                <p className="text-fg leading-relaxed whitespace-pre-wrap text-xs">
                  {result.intervention.message}
                </p>

                {/* OCD Cycle Diagram if stages detected */}
                {result.cycleStages && (
                  <div className="p-2.5 bg-surface rounded-lg border border-line space-y-1.5 text-[0.75rem]">
                    <span className="font-bold text-muted block text-[0.7rem] uppercase tracking-wider">
                      🔄 辨認出的強迫循環階段 (OCD Cycle)
                    </span>
                    <div className="space-y-1 text-fg pl-1 border-l-2 border-accent/60">
                      <div>
                        <span className="text-muted">1. 誘發刺激：</span>
                        <span className="font-medium">{result.cycleStages.trigger}</span>
                      </div>
                      <div>
                        <span className="text-muted">2. 執念懷疑：</span>
                        <span className="font-medium">{result.cycleStages.obsession}</span>
                      </div>
                      <div>
                        <span className="text-muted">3. 焦慮不確定：</span>
                        <span className="font-medium">{result.cycleStages.anxiety}</span>
                      </div>
                      <div>
                        <span className="text-muted">4. 強迫衝動：</span>
                        <span className="font-medium text-danger">{result.cycleStages.compulsion}</span>
                      </div>
                      <div>
                        <span className="text-muted">5. 短暫假安心：</span>
                        <span className="font-medium text-muted">{result.cycleStages.temporaryRelief}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested actions */}
                {result.intervention.options.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-line/50">
                    <span className="text-[0.7rem] font-semibold text-muted block">
                      建議的當下應對：
                    </span>
                    <div className="space-y-1">
                      {result.intervention.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-2 rounded-lg bg-surface border border-line flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold text-fg text-xs">{opt.label}</p>
                            {opt.hint && <p className="text-muted text-[0.7rem]">{opt.hint}</p>}
                          </div>
                          {opt.actionType === "URGE_SURFING" && (
                            <button
                              type="button"
                              onClick={startUrgeSurf}
                              className="btn btn-secondary btn-xs shrink-0"
                            >
                              開始衝浪
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct quick links to Peer Support & Recovery */}
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href="/chat"
                    onClick={() => setOpen(false)}
                    className="btn btn-primary btn-xs flex-1 text-center"
                  >
                    💬 前往互助大廳尋求陪伴
                  </Link>
                  <Link
                    href="/recovery"
                    onClick={() => setOpen(false)}
                    className="btn btn-secondary btn-xs flex-1 text-center"
                  >
                    📝 記錄非強迫日記
                  </Link>
                </div>

                {/* Feedback Loop (Phase 17) */}
                {result.interactionId && (
                  <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[0.7rem] text-muted">
                    <span>這個辨認與導引有幫助嗎？</span>
                    {feedbackSent ? (
                      <span className="text-accent font-medium">感謝你的回饋！</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={feedbackLoading}
                          onClick={() => handleFeedback(true)}
                          className="px-2 py-0.5 rounded border border-line bg-surface hover:border-accent hover:text-accent"
                        >
                          👍 有幫助
                        </button>
                        <button
                          type="button"
                          disabled={feedbackLoading}
                          onClick={() => handleFeedback(false)}
                          className="px-2 py-0.5 rounded border border-line bg-surface hover:border-danger hover:text-danger"
                        >
                          👎 不太有
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
