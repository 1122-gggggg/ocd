# OCD 互助坊 (ocd)

強迫症病友、家屬與臨床工作者的經驗交流論壇。Next.js 15 + Auth.js v5 (JWT) + Prisma + Postgres。

> ⚠️ 本站內容僅供經驗交流，不是醫療診斷或治療建議。緊急狀況請撥打 1925。

## 需求

- Node.js 20.x + npm 10 (`engines` / `packageManager` 已鎖定)
- Docker (跑本地 Postgres) 或一組可連線的 Postgres
- `openssl` (產生 `AUTH_SECRET` / `CRON_SECRET`)

## 快速開始 (本地)

```bash
# 1. 環境變數
cp .env.example .env
# 至少確認: DATABASE_URL / DIRECT_URL (本地預設 localhost:5433),
# AUTH_SECRET (32 字元以上), AUTH_URL=http://localhost:3001,
# SEED_ADMIN_PASSWORD (管理員初始密碼)

# 2. 啟動 (Postgres 5433, Web 3001 — 因 5432/3000 本機常被佔用)
docker compose up --build -d
# web 容器會自動: prisma migrate deploy → seed → next dev
# 首頁: http://localhost:3001

# 3. 不用 Docker 的手動流程
npm ci
npx prisma migrate deploy
npx prisma db seed
npm run dev   # http://localhost:3001 (compose 映射 3001:3000)
```

埠位對照：`docker-compose.yml` 把 db 映射為 `5433:5432`、web 為 `3001:3000`。
`DATABASE_URL` / `DIRECT_URL` 本地預設 `postgresql://ocd:ocd@localhost:5433/ocd?schema=public`，
`AUTH_URL` 為 `http://localhost:3001`。

## 常用指令

```bash
npm test          # vitest run (單元測試)
npm run test:ci   # vitest run --coverage
npm run typecheck # tsc --noEmit
npm run lint      # eslint . --max-warnings=0
npx prisma validate
npx prisma migrate deploy
npx prisma db seed
```

## 管理員登入

seed (`prisma/seed.ts`) 會建立管理員並寫入三組版區 + 歡迎公告：

- 帳號：`admin@ocd.local`
- 密碼：`$SEED_ADMIN_PASSWORD` (本地預設 `changeme-admin`)
- 登入後進 `/admin` (版區 / 臨床驗證 / 檢舉 / 公告管理)

## 主要路徑

| 路徑 | 說明 |
|---|---|
| `/` | 首頁，三組版區 (症狀 / 治療 / 社群) |
| `/b/[slug]` | 版區文章列表，`/b/[slug]/new` 發文 (需登入) |
| `/login` `/register` | 登入 / 註冊 |
| `/admin` | 後台 (ADMIN) |
| `/api/health` | 健康檢查 (DB + R2 狀態) |
| `/api/cron/backup` | 每日邏輯備份 (需 `CRON_SECRET`) |

## 部署

見 [DEPLOY_VERCEL_NEON.md](./DEPLOY_VERCEL_NEON.md) — Vercel `hnd1` + Neon `ap-northeast-1` (Tokyo)，
`DATABASE_URL` (pooled) + `DIRECT_URL` (direct) 雙連線，`R2_*` 上傳，`CRON_SECRET` 每日備份。
