"use client";

import { useState } from "react";
import Link from "next/link";
import { analyzeTextSupport } from "@/app/actions/ocd-engine";
import { SupportEngineAnalysis } from "@/lib/ocd/engine";

export function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SupportEngineAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || analyzing) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeTextSupport(input);
      if (!res.ok) {
        setError(res.message || "分析失敗");
      } else if (res.analysis) {
        setResult(res.analysis);
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
          aria-label="開啟 AI 支持助手"
        >
          <span className="text-base">🤖</span>
          <span>AI 支持助手</span>
        </button>
      </div>

      {/* Slide-in / Modal panel */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] flex flex-col card shadow-2xl border border-accent/40 bg-surface overflow-hidden fade-in">
          {/* Header */}
          <div className="p-3.5 bg-accent text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-sm leading-tight">AI 支持助手</h3>
                <p className="text-[0.7rem] text-white/80">
                  辨認強迫循環・不提供虛假保證・陪伴面對不確定
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
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Disclaimer banner */}
            <div className="p-2.5 rounded-lg bg-surface-2 border border-line text-muted text-[0.75rem] leading-relaxed">
              💡 <strong>不是心理醫生，也不提供診斷或答案。</strong>
              <br />
              當大腦逼你尋求「到底有沒有事」的保證時，我會陪伴你辨認這是否是強迫症的警報，並引導你回到真實當下。
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
                  {analyzing ? "分析循環中…" : "辨認念頭與循環"}
                </button>
              </div>
            </form>

            {/* Analysis Result */}
            {result && (
              <div className="p-3.5 rounded-xl bg-surface-2 border border-accent/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-accent">{result.title}</span>
                  <span className="text-[0.65rem] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-mono">
                    {result.detectedType}
                  </span>
                </div>
                <p className="text-fg leading-relaxed whitespace-pre-wrap">{result.message}</p>

                {/* Next action options */}
                {result.options.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-line/50">
                    <span className="text-[0.7rem] font-semibold text-muted block">
                      建議的當下應對步驟：
                    </span>
                    {result.options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-2 rounded-lg bg-surface border border-line flex flex-col gap-0.5"
                      >
                        <span className="font-semibold text-fg text-xs">{opt.label}</span>
                        <span className="text-muted text-[0.7rem]">{opt.hint}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct quick links */}
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    href="/chat"
                    onClick={() => setOpen(false)}
                    className="btn btn-secondary btn-xs flex-1 text-center"
                  >
                    前往陪伴大廳
                  </Link>
                  <Link
                    href="/recovery"
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost btn-xs flex-1 text-center"
                  >
                    記錄在非強迫日記
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
