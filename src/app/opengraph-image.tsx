import { ImageResponse } from "next/og";

// 社群分享圖：1200x630 PNG（layout.tsx 的 openGraph／twitter images 引用「/opengraph-image」）。
export const alt = "強迫症互助坊";

export const size = {
  width: 1200,
  height: 630,
};

// satori（此環境綁定的 fontkit）不支援 woff2，只吃 TTF；因此不送現代瀏覽器 UA，
// 讓 Google 回傳 format('truetype')，並以 text= 只擷取圖上實際出現的字（單檔、體積極小）。
const OG_TEXT = "強迫症互助坊病友、家屬與臨床工作者的經驗交流與支持空間";

type FontSubset = { url: string; ranges: Array<number | [number, number]> | null };

// 解析 css2 的 @font-face 區塊：只收 truetype；有 text= 時通常是無 unicode-range 的單一子集（視為全覆蓋），
// 無 text= 回退時則以 unicode-range 逐字挑檔。
function parseFontSubsets(css: string): FontSubset[] {
  const subsets: FontSubset[] = [];
  for (const block of css.split("@font-face")) {
    const url = /url\((https:[^)]+)\)/.exec(block)?.[1];
    if (!url || !/format\(['"]?truetype['"]?\)/.test(block)) continue;
    const rangeText = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    if (!rangeText) {
      subsets.push({ url, ranges: null });
      continue;
    }
    const ranges: NonNullable<FontSubset["ranges"]> = [];
    for (const part of rangeText.split(",")) {
      const hex = part.trim().replace(/^U\+/i, "");
      if (!hex) continue;
      const [s, e] = hex.split("-");
      const start = Number.parseInt(s ?? "", 16);
      if (Number.isNaN(start)) continue;
      const end = e ? Number.parseInt(e, 16) : start;
      if (Number.isNaN(end) || start === end) ranges.push(start);
      else ranges.push([start, end]);
    }
    subsets.push({ url, ranges });
  }
  return subsets;
}

// 無範圍子集（text= 擷取）直接採用；否則為每個所需字元挑第一個覆蓋它的子集（同 url 只抓一次，最多 8 個）。
function pickSubsetUrls(subsets: FontSubset[], codePoints: number[]): string[] {
  const universal = subsets.find((s) => s.ranges === null);
  if (universal) return [universal.url];
  const urls: string[] = [];
  for (const cp of codePoints) {
    const hit = subsets.find((s) =>
      s.ranges !== null &&
      s.ranges.some((r) => (typeof r === "number" ? r === cp : cp >= r[0] && cp <= r[1])),
    );
    if (hit && !urls.includes(hit.url)) urls.push(hit.url);
    if (urls.length >= 8) break;
  }
  return urls;
}

// 依字重載入覆蓋圖上文字的 Noto Sans TC 子集；任一步驟失敗回傳空陣列，
// 由呼叫端省略 fonts 選項（改用內建字型），路由仍維持 200。
async function loadNotoSansTC(
  weight: 500 | 700,
  codePoints: number[],
): Promise<Array<{ name: string; data: ArrayBuffer; weight: 500 | 700; style: "normal" }>> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(OG_TEXT)}&display=swap`,
      { signal: AbortSignal.timeout(10_000) },
    ).then((res) => {
      if (!res.ok) throw new Error(`字體 CSS 回應異常：${res.status}`);
      return res.text();
    });

    const urls = pickSubsetUrls(parseFontSubsets(css), codePoints);
    const settled = await Promise.all(
      urls.map((url) =>
        fetch(url, { signal: AbortSignal.timeout(10_000) })
          .then((res) => {
            if (!res.ok) throw new Error(`字體檔回應異常：${res.status}`);
            return res.arrayBuffer();
          })
          .then((data) => ({ name: "Noto Sans TC", data, weight, style: "normal" as const }))
          .catch(() => null),
      ),
    );
    return settled.filter((f): f is NonNullable<typeof f> => f !== null);
  } catch {
    return [];
  }
}

export default async function OpengraphImage() {
  // 色票取自 src/app/globals.css（淺色）：背景 --bg、標題 --fg、副標 --fg-muted、品牌 --accent。
  const bg = "#f7f4ee";
  const fg = "#1f2933";
  const muted = "#5b6672";
  const accent = "#2f6f6a";
  const onAccent = "#ffffff";

  const codePoints = [...new Set([...OG_TEXT].map((ch) => ch.codePointAt(0) ?? 0))].filter((cp) => cp > 0x7f);
  const fonts = (
    await Promise.all([loadNotoSansTC(500, codePoints), loadNotoSansTC(700, codePoints)])
  ).flat();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: bg,
          padding: "0 96px",
          fontFamily: '"Noto Sans TC", sans-serif',
        }}
      >
        {/* 品牌徽章：沿用 SiteHeader LogoMark 的形狀（光暈圓＋微笑弧＋雙眼圓點）。 */}
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: 60,
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 64,
          }}
        >
          <svg width="156" height="156" viewBox="0 0 24 24">
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: 96,
              height: 10,
              borderRadius: 5,
              background: accent,
              marginBottom: 28,
            }}
          />
          <div style={{ fontSize: 92, fontWeight: 700, color: fg, lineHeight: 1.15 }}>強迫症互助坊</div>
          <div style={{ fontSize: 36, fontWeight: 500, color: muted, lineHeight: 1.5, marginTop: 20 }}>
            病友、家屬與臨床工作者的經驗交流與支持空間
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      // satori 至少需要一個字型；全數載入失敗時省略，改用內建字型渲染，維持 200。
      ...(fonts.length > 0 ? { fonts } : {}),
    },
  );
}
