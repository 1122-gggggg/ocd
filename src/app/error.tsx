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
      <p className="font-medium">這個頁面出了點問題</p>
      <p className="text-sm text-muted">
        剛剛的操作沒有完成。可以再試一次，如果一直失敗請告訴站務。
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
