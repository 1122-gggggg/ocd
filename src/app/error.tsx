"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-narrow card card-pad text-center space-y-3 py-12">
      <p role="alert" className="alert alert-error text-left">
        <span aria-hidden="true">☎</span>
        <span>
          若你或身邊的人有立即危險，請立即撥打{" "}
          <a href="tel:1925" className="underline underline-offset-2 font-medium">
            安心專線 1925
          </a>
          （24 小時免費），或撥打 <a href="tel:119" className="underline underline-offset-2">119</a>。
        </span>
      </p>
      <p className="font-medium">這個頁面出了點問題</p>
      <p className="text-sm text-muted">
        剛剛的操作沒有完成。可以再試一次，如果一直失敗請告訴站務。
      </p>
      <p className="text-sm text-muted">
        需要協助？請至 <Link href="/boards/apply" className="underline underline-offset-2">申請開版</Link> 聯絡站務，
        或先閱讀 <Link href="/disclaimer" className="underline underline-offset-2">免責聲明與求助資源</Link>。
      </p>
      {error.digest && (
        <p className="hint">
          錯誤代碼：<code className="mono">{error.digest}</code>
        </p>
      )}
      <div className="flex justify-center gap-2 pt-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          再試一次
        </button>
        <Link href="/" className="btn btn-secondary">
          回到首頁
        </Link>
      </div>
    </div>
  );
}
