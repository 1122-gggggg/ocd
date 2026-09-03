"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { containsCrisisKeyword } from "@/lib/crisis-keywords";

const MarkdownPreview = dynamic(() => import("@/components/MarkdownPreview"), {
  ssr: false,
  loading: () => <p className="hint">載入預覽中⋯</p>,
});

const TITLE_MAX = 80;
const BODY_MAX = 20000;

type ActionResult = { ok?: boolean; code?: string; message?: string } | void;

type Props = {
  boardSlug?: string;
  postId?: string;
  action: (formData: FormData) => Promise<ActionResult>;
  isReply?: boolean;
  replyToFloor?: number | null;
  submitLabel?: string;
};

function isRedirectError(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "digest" in err &&
    String((err as { digest?: unknown }).digest).includes("NEXT_REDIRECT")
  );
}

export function PostForm({
  action,
  isReply,
  replyToFloor,
  submitLabel = "發文",
}: Props) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // Move focus into the crisis dialog and restore it on close, so keyboard
  // users are not stranded behind the overlay.
  useEffect(() => {
    if (!showModal) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [showModal]);

  async function submitFormData(fd: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await action(fd);
      if (result && result.ok === false) {
        if (result.code === "CRISIS_CONFIRM") {
          setShowModal(true);
        } else {
          setError(result.message || result.code || "發生錯誤，請稍後再試。");
        }
        setPending(false);
        return;
      }
      // Success ({ok:true} / void): redirecting actions throw NEXT_REDIRECT
      // below; non-redirect actions (reply/update) land here — clear the
      // composer and refresh revalidated content.
      setPending(false);
      setTitle("");
      setBody("");
      setChecked(false);
      formRef.current?.reset();
      router.refresh();
      return;
    } catch (err: unknown) {
      if (isRedirectError(err)) throw err;
      setError(err instanceof Error ? err.message : String(err));
      setPending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (containsCrisisKeyword(`${title} ${body}`) && !checked) {
      setShowModal(true);
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("confirmCrisis", checked ? "1" : "0");
    await submitFormData(fd);
  }

  async function handleConfirm() {
    if (!checked || !formRef.current) return;
    setShowModal(false);
    const fd = new FormData(formRef.current);
    fd.set("confirmCrisis", "1");
    await submitFormData(fd);
  }

  const titleLeft = TITLE_MAX - title.length;
  const bodyLeft = BODY_MAX - body.length;

  return (
    <>
      <form ref={formRef} id="post-form" onSubmit={handleSubmit} className="space-y-4">
        {!isReply && (
          <div>
            <div className="flex items-baseline justify-between">
              <label className="label" htmlFor="pf-title">
                標題
              </label>
              <span className={`hint mt-0 ${titleLeft < 10 ? "text-warning" : ""}`}>
                {title.length} / {TITLE_MAX}
              </span>
            </div>
            <input
              id="pf-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              required
              className="input"
              placeholder="一句話說明你想聊什麼"
            />
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label className="label" htmlFor="pf-body">
              {isReply ? "回覆內容" : "正文"}
              <span className="ml-1.5 font-normal text-subtle">支援 Markdown</span>
            </label>
            <span className={`hint mt-0 ${bodyLeft < 200 ? "text-warning" : ""}`}>
              {body.length} / {BODY_MAX}
            </span>
          </div>
          <textarea
            id="pf-body"
            name="bodyMd"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={BODY_MAX}
            required
            rows={isReply ? 6 : 10}
            className="textarea mono"
            placeholder={
              isReply
                ? "寫下你的回應⋯⋯"
                : "**粗體**、*斜體*、- 列表、> 引用、[連結](https://…)（不支援圖片）"
            }
          />
          {replyToFloor != null && (
            <input type="hidden" name="replyToFloor" value={String(replyToFloor)} />
          )}
        </div>

        <label className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-2 p-3 text-sm cursor-pointer">
          <input type="checkbox" name="isAnonymous" value="1" className="checkbox mt-0.5" />
          <span>
            <span className="font-medium text-fg">以匿名顯示</span>
            <span className="block hint mt-0.5">
              其他人看不到你的暱稱；站務人員仍可追蹤，以處理違規與求助情況。
            </span>
          </span>
        </label>

        <input type="hidden" name="confirmCrisis" value={checked ? "1" : "0"} />

        {error && <p className="alert alert-error">{error}</p>}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "送出中⋯" : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="btn btn-secondary"
            aria-expanded={preview}
          >
            {preview ? "隱藏預覽" : "預覽"}
          </button>
        </div>
        {preview && (
          <div className="card p-4 space-y-2">
            <div className="text-xs font-medium text-subtle">預覽</div>
            {!isReply && title && <div className="text-lg font-bold">{title}</div>}
            <div className="prose prose-sm">
              <MarkdownPreview content={body || "*（尚無內容）*"} />
            </div>
          </div>
        )}
      </form>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crisis-title"
        >
          <div className="card w-full max-w-md card-pad space-y-4 fade-in" style={{ boxShadow: "var(--shadow-pop)" }}>
            <h3 id="crisis-title" className="text-lg font-bold">
              先陪你看一下這些資源
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              你的文字裡出現了一些讓我們想多關心一下的字詞。若你或身邊的人正在難受，
              下面的管道隨時都在：
            </p>
            <ul className="space-y-2 text-sm">
              <li className="alert alert-info">
                <span aria-hidden="true">☎</span>
                <span>
                  衛生福利部安心專線 <strong>1925</strong>（24 小時免費）
                </span>
              </li>
              <li className="alert">
                <span aria-hidden="true">🌐</span>
                <a
                  href="https://www.iasp.info/suicidalthoughts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 break-all"
                >
                  iasp.info/suicidalthoughts
                </a>
              </li>
            </ul>
            <label className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-2 p-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="checkbox mt-0.5"
              />
              <span>我已看過上面的求助資源，仍要送出這篇內容。</span>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                返回修改
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={handleConfirm}
                disabled={!checked || pending}
                className="btn btn-primary"
              >
                {pending ? "送出中⋯" : "確認送出"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
