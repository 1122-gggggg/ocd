"use client";

import { useState } from "react";
import { containsCrisisKeyword } from "@/lib/crisis-keywords";
import { Markdown } from "@/lib/markdown";

type Props = {
  boardSlug?: string;
  postId?: string;
  action: (formData: FormData) => Promise<any>;
  isReply?: boolean;
  replyToFloor?: number | null;
  submitLabel?: string;
};

export function PostForm({ boardSlug, postId, action, isReply, replyToFloor, submitLabel = "發文" }: Props) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const targetBody = body;
    if (containsCrisisKeyword(targetBody) && !checked) {
      setShowModal(true);
      return;
    }
    // also need to check title contains? spec says crisis keywords in body? We'll check both title and body
    const combined = title + " " + body;
    if (containsCrisisKeyword(combined) && !checked) {
      setShowModal(true);
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    // ensure confirmCrisis
    fd.set("confirmCrisis", checked ? "1" : "0");
    // for reply replyToFloor ensure
    setPending(true);
    setError(null);
    try {
      const result = await action(fd);
      if (result && result.ok === false && result.code === "CRISIS_CONFIRM") {
        setShowModal(true);
        setPending(false);
        return;
      }
      if (result && result.ok === false) {
        setError(result.message || result.code || "發生錯誤");
        setPending(false);
        return;
      }
      // if action redirects, it will throw NEXT_REDIRECT; let it propagate
    } catch (err: unknown) {
      // Next.js redirect throws; rethrow
      const isRedirect = err && typeof err === "object" && "digest" in err && String((err as any).digest).includes("NEXT_REDIRECT");
      if (isRedirect) throw err;
      setError(String(err));
    } finally {
      setPending(false);
    }
  }

  function handleConfirm() {
    if (!checked) return;
    setShowModal(false);
    // set hidden and submit again programmatically
    // We'll trigger form submit again by calling handleSubmit with checked true
    // Instead, find form and dispatch
    const form = document.getElementById("post-form") as HTMLFormElement | null;
    if (form) {
      const fd = new FormData(form);
      fd.set("confirmCrisis", "1");
      // set pending and call action
      setPending(true);
      action(fd).catch((err: unknown) => {
        const isRedirect = err && typeof err === "object" && "digest" in err && String((err as any).digest).includes("NEXT_REDIRECT");
        if (isRedirect) throw err;
        setError(String(err));
        setPending(false);
      });
    }
  }

  return (
    <>
      <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
        {!isReply && (
          <div>
            <label className="block text-sm font-medium">標題（≤80 字）</label>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="標題"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">正文（Markdown，≤20000 字）</label>
          <textarea
            name="bodyMd"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={20000}
            required
            rows={8}
            className="mt-1 w-full border rounded px-3 py-2 font-mono text-sm"
            placeholder="支援 Markdown：**粗體**、*斜體*、列表、連結等（不支援圖片）"
          />
          {replyToFloor != null && <input type="hidden" name="replyToFloor" value={String(replyToFloor)} />}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isAnonymous" value="1" />
            本篇以匿名顯示（站務仍可追蹤）
          </label>
        </div>
        <input type="hidden" name="confirmCrisis" value={checked ? "1" : "0"} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          >
            {preview ? "隱藏預覽" : "預覽"}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55] disabled:opacity-50"
          >
            {pending ? "送出中..." : submitLabel}
          </button>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        {preview && (
          <div className="border rounded p-4 bg-white prose prose-sm max-w-none">
            <Markdown>{body || "*（無內容）*"}</Markdown>
          </div>
        )}
      </form>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-lg">求助資源</h3>
            <p className="text-sm text-gray-700">
              偵測到您的文中可能包含需要關注的字詞。若您或身邊的人有困擾，請參考以下資源：
            </p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>衛生福利部安心專線 <strong>1925</strong>（24 小時）</li>
              <li>
                <a
                  href="https://www.iasp.info/suicidalthoughts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#2F6F6A]"
                >
                  https://www.iasp.info/suicidalthoughts/
                </a>
              </li>
            </ul>
            <label className="flex items-center gap-2 text-sm border rounded p-2 bg-gray-50">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              我已閱讀求助資源，仍要送出
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                返回修改
              </button>
              <button
                onClick={handleConfirm}
                disabled={!checked}
                className="px-4 py-2 rounded bg-[#2F6F6A] text-white disabled:opacity-40"
              >
                確認送出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
