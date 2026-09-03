import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "強迫症互助坊",
    short_name: "強迫症互助坊",
    description: "病友、家屬與臨床工作者的經驗交流與支持空間",
    start_url: "/",
    scope: "/",
    display: "standalone",
    lang: "zh-Hant",
    dir: "ltr",
    // 取自 src/app/globals.css 設計代幣：淺色 --bg #f7f4ee（深色為 #14181b）。
    background_color: "#f7f4ee",
    theme_color: "#f7f4ee",
    icons: [
      // 待辦：日後新增 src/app/icon.tsx；以下僅引用「/icon」路徑，不在此建立圖檔。
      { src: "/icon", sizes: "any" },
    ],
  };
}
