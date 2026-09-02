# 部署到 Vercel Hobby + Neon Free (東京, <40ms)

本指南對應 `vercel.json` 已提交，`hnd1` (東京) 區域、`DATABASE_URL` pooled + `DIRECT_URL` direct 雙連線。

## 1. 建立 Neon Postgres (Free)

1. 到 https://neon.tech → Sign in → New Project
2. **Region** 選 `ap-northeast-1` / `AWS Tokyo (ap-northeast-1)` — 離台灣最近，`hnd1` Vercel 同區延遲最低
3. 建好後 → `Dashboard → Connection Details`
   - 選 `Pooled` 取得 `DATABASE_URL` (含 `?sslmode=require&channel_binding=require`，Neon 會給 `...-pooler...`)
     `postgresql://user:pass@ep-xxx-pooler.ap-northeast-1.aws.neon.tech/neondb?sslmode=require`
     自行加上 `&pgbouncer=true&connection_limit=10` 尾綴 (Prisma 建議)
     例: `postgresql://.../neondb?sslmode=require&channel_binding=require&pgbouncer=true&connection_limit=10`
   - 選 `Direct` 取得 `DIRECT_URL` (不含 pooler)
     `postgresql://user:pass@ep-xxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require`
   - 兩條都要，500人 Free 的 10GB / 190CU 夠用，自動休眠省 CU

## 2. 推到 GitHub

```bash
cd /home/cihcilab/ocd
git init # 已有則跳過
git add -A
git commit -m "feat: vercel+neon ready (hnd1, directUrl)"
git branch -M main
git remote add origin https://github.com/<you>/ocd.git
git push -u origin main
```

## 3. Vercel 建立專案

1. https://vercel.com/new → Import `ocd` repo
2. `Framework Preset: Next.js` 會自動讀 `vercel.json`
   - Build Command 已覆蓋為 `npx prisma generate && npx prisma migrate deploy && npm run build`
   - Region 已鎖 `hnd1`
3. **Environment Variables** (全部 `Production` + `Preview` 都加):
   ```
   DATABASE_URL=  postgresql://...-pooler...?sslmode=require&pgbouncer=true&connection_limit=10
   DIRECT_URL=    postgresql://...direct...?sslmode=require
   AUTH_SECRET=   openssl rand -base64 32  (本地: dev-insecure-... 改掉)
   AUTH_URL=      https://ocd.yourdomain.tw
   AUTH_GOOGLE_ID=       (若用 Google 登入，否則留空)
   AUTH_GOOGLE_SECRET=
   SEED_ADMIN_PASSWORD=  <強密碼，首次 seed 用>
   R2_ACCOUNT_ID=        <Cloudflare R2 account ID>
   R2_ACCESS_KEY_ID=     <R2 API access key>
   R2_SECRET_ACCESS_KEY= <R2 API secret key>
   R2_BUCKET=            ocd-proofs
   CRON_SECRET=          openssl rand -base64 32  (每日備份 cron 用，未設定則備份端點直接 503)
   ```
   **重要**: `DATABASE_URL` 必須是 pooled (`-pooler` + `pgbouncer=true&connection_limit=10`)，`DIRECT_URL` 必須是 direct (不含 `pgbouncer=true`)，否則 `migrate deploy` 會報 `prepared statement` 錯誤。`AUTH_SECRET` 用 `openssl rand -base64 32` 產生，至少 32 字元。

4. `Deploy` → 觀察 log 應見 `1 migration found ... No pending migrations` + `Seed completed` + `✓ Compiled`

## 4. 網域 (選擇性，Hobby 免費)

1. Vercel → Project → Settings → Domains → Add `ocd.yourdomain.tw`
2. Vercel 會給 `cname.vercel-dns.com` → 到你的 DNS (Cloudflare/Route53) 加
   ```
   CNAME ocd -> cname.vercel-dns.com
   ```
3. 等待 `Valid Configuration` + 自動 HTTPS。Hobby 支援自訂域 (不限數量)。

## 5. 驗證 (同本地 `Verification` 章節)

```bash
# 1. 首頁三組版區
curl -s https://ocd.yourdomain.tw/ | grep -q "污染與清洗" && echo ok

# 2. 未登入打開發文跳 /login
curl -s -D - https://ocd.yourdomain.tw/b/newcomers/new | grep -q "location: /login"

# 3. 管理員登入: admin@ocd.local / $SEED_ADMIN_PASSWORD → 見 後台
```

本地已驗證的 8 步在線上同樣成立 (見 `local://ocd-support-forum-plan.md` Verification)。

## 6. 維運

- **備份**: 三層，缺一不可
  1. Neon Dashboard → `Branches` 自動 PITR，Free 方案保留 7 天
  2. **每日自動**：`vercel.json` 的 `crons` 每天 03:00 打 `GET /api/cron/backup`（`src/app/api/cron/backup/route.ts`）。它用 Prisma 把所有持久資料表 dump 成 JSON、gzip 後上傳到 `s3://$R2_BUCKET/backups/logical-YYYYMMDD.json.gz`。
     - **需要 `CRON_SECRET`**：Vercel 會帶 `Authorization: Bearer $CRON_SECRET`。沒設這個變數，端點會直接回 `503 CRON_SECRET_NOT_CONFIGURED` 而不是放行 —— 未授權的全庫 dump 絕不能對外開放。
     - R2 沒設定則回 `503 STORAGE_NOT_CONFIGURED`。
     - 內容含 email 與 bcrypt 密碼雜湊（還原帳號所需），**R2 bucket 必須維持私有**。
     - 不含 `Session` / `VerificationToken`：session 是 JWT，那些列還原了也沒意義。
  3. **手動 / CI**：`scripts/backup/neon-to-r2.sh` 走 `DIRECT_URL` + `pg_dump --no-owner | gzip | aws s3 cp`，輸出到 `backups/neon-YYYYMMDD.sql.gz`。這是完整的 SQL dump，還原度最高，但 `pg_dump` / `aws` 在 Vercel serverless 裡不存在，所以只能在本機或 CI 跑。兩者副檔名不同，不會互相覆蓋。

  驗證每日備份有在跑：Vercel → Logs 搜 `cron/backup: uploaded`，或到 R2 看 `backups/` 有沒有當天的 `logical-*.json.gz`。
- **升級**: Vercel Hobby 100GB 頻寬足 500人，爆了再 `Vercel Pro $20`，Neon 自動 scale 不需手動
- **上傳**: 已切 `R2` (`src/lib/r2.ts` + `R2_*` 環境變數)。`uploads/clinician-proof` 不再寫本地磁碟 (Vercel 無持久磁碟)，改由 `S3Client` 上傳至 `R2_BUCKET` (預設 `ocd-proofs`)，`proofPath` 存 R2 URL/key。
- **日誌**: Vercel → Logs, Neon → Monitoring
- **本地仍可用**: `echo "ab19696a" | sudo -S docker compose up --build -d` 仍在 `http://localhost:3001` (5433/3001 映射，因 5432/3000 本機被佔)

## 7. 一鍵指令 (已配好)

```bash
# 本地模擬 Vercel 建置
npm run build            # 已含 prisma generate
npx prisma migrate deploy
npx prisma db seed

# 檢查
npx vitest run           # 16 tests
```

## 常見坑

| 現象 | 解法 |
|---|---|
| `Can't reach database ... pooler` | `DATABASE_URL` 少 `?pgbouncer=true` 或用 direct 應改 pooled |
| `prepared statement ... does not exist` | `migrate deploy` 用了 pooled，改用 `DIRECT_URL` |
| `JWTSessionError edge` | 已修 `src/auth.ts` 的 `isEdge`  guard，確保 `vercel.json` 為 `hnd1` |
| `uploads` 404 | Vercel 無持久磁碟，必須切 R2 — 確認 `R2_*` 已設且 `r2Enabled` 為 true |

有問題貼 `Vercel Deploy Logs` 前 50 行即可定位。
