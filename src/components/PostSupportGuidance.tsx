import React from "react";
import type { PostSupportMode } from "@prisma/client";

interface PostSupportGuidanceProps {
  supportMode?: PostSupportMode | string | null;
  className?: string;
}

export function PostSupportGuidance({
  supportMode,
  className = "",
}: PostSupportGuidanceProps) {
  if (!supportMode) return null;

  switch (supportMode) {
    case "EMPATHY":
      return (
        <div
          className={`p-3 rounded-xl bg-accent-soft/40 border border-accent/30 text-xs text-fg flex items-start gap-2.5 ${className}`}
        >
          <span className="text-base shrink-0">💬</span>
          <div className="space-y-0.5">
            <p className="font-bold text-accent text-xs">陪伴比解答更重要</p>
            <p className="text-muted text-[0.75rem] leading-relaxed">
              發文者選擇了「純心情・不需解答」模式。請以溫柔同理與傾聽回覆，避免替對方分析、給答案或保證「沒事啦」。
            </p>
          </div>
        </div>
      );

    case "LOOKING_FOR_EXPERIENCE":
      return (
        <div
          className={`p-3 rounded-xl bg-surface-2 border border-line text-xs text-fg flex items-start gap-2.5 ${className}`}
        >
          <span className="text-base shrink-0">🔍</span>
          <div className="space-y-0.5">
            <p className="font-bold text-fg text-xs">
              分享你的經驗，而不是替對方判斷
            </p>
            <p className="text-muted text-[0.75rem] leading-relaxed">
              發文者正在尋求病友真實歷程。分享你過去如何與類似焦慮共處、如何實踐 ERP 或奪回生活的經驗，但不代替醫生下結論。
            </p>
          </div>
        </div>
      );

    case "FACING_OCD":
      return (
        <div
          className={`p-3 rounded-xl bg-warning-soft/60 border border-warning/30 text-xs text-fg flex items-start gap-2.5 ${className}`}
        >
          <span className="text-base shrink-0">🛡️</span>
          <div className="space-y-0.5">
            <p className="font-bold text-fg text-xs">
              鼓勵面對不確定，而不是要求立即消除焦慮
            </p>
            <p className="text-muted text-[0.75rem] leading-relaxed">
              發文者正在當下抵抗強迫行為。請給予「我陪你一起撐過這波焦慮浪潮」的支持，避免給予「絕對沒危險」等短暫保證。
            </p>
          </div>
        </div>
      );

    case "SHARE_EXPERIENCE":
      return (
        <div
          className={`p-3 rounded-xl bg-surface-2 border border-line text-xs text-fg flex items-start gap-2.5 ${className}`}
        >
          <span className="text-base shrink-0">📖</span>
          <div className="space-y-0.5">
            <p className="font-bold text-fg text-xs">致敬奪回生活的每一步</p>
            <p className="text-muted text-[0.75rem] leading-relaxed">
              謝謝病友分享復原實錄。歡迎留下一句溫暖的「為你感到驕傲」，讓每一步抵抗都成為社群同行的勇氣。
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
