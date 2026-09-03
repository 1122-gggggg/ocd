"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="zh-Hant">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff",
          color: "#1a1a1a",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            margin: "4rem auto",
            padding: "1.5rem",
            textAlign: "center",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <p
            role="alert"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
            }}
          >
            若你或身邊的人有立即危險，請立即撥打{" "}
            <a href="tel:1925" style={{ fontWeight: 700 }}>
              安心專線 1925
            </a>
            （24 小時免費），或撥打 <a href="tel:119">119</a> 前往急診。
          </p>
          <p style={{ fontWeight: 600 }}>這個頁面出了點問題</p>
          <p style={{ fontSize: "0.875rem", color: "#666" }}>
            剛剛的操作沒有完成。可以再試一次，如果一直失敗請告訴站務。
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              錯誤代碼：<code>{error.digest}</code>
            </p>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              paddingTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#0070f3",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              再試一次
            </button>
            <Link
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                color: "#1a1a1a",
                textDecoration: "none",
              }}
            >
              回到首頁
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
