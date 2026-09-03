import { ImageResponse } from "next/og";

// PWA／favicon 共用圖示：512px PNG（manifest.ts 以 sizes "any" 引用「/icon」）。
export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  // 色票取自 src/app/globals.css（淺色）：底色 --accent、圖案 --accent-fg。
  // 圖案沿用 src/components/SiteHeader.tsx LogoMark 的形狀（光暈圓＋微笑弧＋雙眼圓點）。
  const accent = "#2f6f6a";
  const onAccent = "#ffffff";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent,
        }}
      >
        <svg width="352" height="352" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill={onAccent} opacity="0.18" />
          <path
            d="M8 13.5c1.2 1.6 2.5 2.4 4 2.4s2.8-.8 4-2.4"
            fill="none"
            stroke={onAccent}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="9" cy="9.6" r="1.15" fill={onAccent} />
          <circle cx="15" cy="9.6" r="1.15" fill={onAccent} />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
