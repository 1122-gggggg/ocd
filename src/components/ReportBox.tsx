"use client";

import { useState, useTransition, useRef } from "react";
import { createReport } from "@/app/actions/reports";

type Props = {
  targetType: "POST" | "REPLY";
  targetId: string;
};

export function ReportBox({ targetType, targetId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<{ ok?: boolean; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setStatus({ ok: false, message: "理由至少需要 10 個字。" });
      return;
    }
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await createReport(fd);
        if (res && res.ok === false) {
          setStatus({
            ok: false,
            message: res.message || "舉報失敗，請稍後再試。",
          });
        } else {
          setStatus({
            ok: true,
            message: "已收到舉報，感謝你的協助，管理員將會進行審核。",
          });
          setReason("");
        }
      } catch {
        setStatus({ ok: false, message: "連線異常，請稍後再試。" });
      }
    });
  }

  return (
    <details
      ref={detailsRef}
      className="w-full"
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="btn btn-ghost btn-sm cursor-pointer list-none inline-flex items-center gap-1">
        <span>⚑</span>
        <span>舉報</span>
      </summary>

      <form
        onSubmit={handleSubmit}
        className="mt-3 space-y-2 rounded-lg border border-line bg-surface-2 p-3"
      >
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />

        {status && (
          <p
            role={status.ok ? "status" : "alert"}
            className={status.ok ? "alert alert-success text-xs" : "alert alert-error text-xs"}
          >
            {status.message}
          </p>
        )}

        <textarea
          name="reason"
          required
          minLength={10}
          maxLength={500}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (status) setStatus(null);
          }}
          disabled={isPending}
          placeholder="請說明舉報理由（10–500 字，例如：人身攻擊、廣告垃圾訊息、鼓吹危險行為）"
          className="textarea"
          rows={3}
          aria-label="舉報理由"
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-subtle">
            {reason.length < 10 ? `還差 ${10 - reason.length} 字` : `${reason.length}/500 字`}
          </span>
          <button
            type="submit"
            disabled={isPending || reason.trim().length < 10}
            className="btn btn-secondary btn-sm"
          >
            {isPending ? "送出中…" : "送出舉報"}
          </button>
        </div>
      </form>
    </details>
  );
}
