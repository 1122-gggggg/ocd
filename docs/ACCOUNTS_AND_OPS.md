# 帳號、隱私與維運

這份文件說明帳號生命週期（重設密碼、Email 驗證、刪除帳號、資料匯出）、
跨執行個體的限流，以及舉報通知怎麼設定與驗證。

---

## 1. 新增的環境變數

以下區塊可直接貼進 `.env.example` 與 Vercel 的 Environment Variables。
**沒有設定郵件服務時，忘記密碼、Email 驗證、通知信全部不會運作**，站台其他部分照常。

```bash
# ── 郵件 ────────────────────────────────────────────────────────────────
# 二選一。兩者皆未設定時，寄信功能會停用（開發環境會把信件內容印在 log）。
#
# (A) Resend：最省事，HTTP API，適合 Vercel serverless
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
# 寄件者，網域需先在 Resend 驗證過
MAIL_FROM="強迫症互助坊 <no-reply@your-domain.tw>"
#
# (B) 自建 webhook：把 { to, subject, text, html, from } POST 給你自己的服務
#     （Postmark / SES / Cloudflare Worker / n8n 都可以）
MAIL_WEBHOOK_URL=https://mail.example.tw/send
MAIL_WEBHOOK_TOKEN=optional-bearer-token

# ── 站台網址 ─────────────────────────────────────────────────────────────
# 信件裡的連結用這個組。未設定時，請求中的 Host 會被拿來用；
# 但排程（cron）沒有請求可用，所以正式環境務必設定。
PUBLIC_SITE_URL=https://ocd.example.tw

# ── Email 驗證 ───────────────────────────────────────────────────────────
# true = 未驗證 Email 的帳號不能發文或回覆（仍可閱讀、登入、刪除帳號）。
# 沒有郵件服務時會自動失效，避免整站變成唯讀。預設關閉。
REQUIRE_EMAIL_VERIFICATION=false

# ── 舉報通知 ─────────────────────────────────────────────────────────────
# 收件者，逗號分隔。未設定時會寄給所有 role=ADMIN 且有 Email 的帳號。
ADMIN_ALERT_EMAIL=admin@example.tw,mod@example.tw
# Slack 或 Discord 的 Incoming Webhook 都可以直接貼（payload 同時帶 text 與 content）
REPORT_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# ── 排程 ─────────────────────────────────────────────────────────────────
# 備份與夜間清理共用。未設定時兩支排程都會拒絕執行（fail closed）。
CRON_SECRET=$(openssl rand -base64 32)

# ── 站務帳號 ─────────────────────────────────────────────────────────────
# 只在 seed 時使用。上線後請用 `npm run admin:password` 換掉。
SEED_ADMIN_EMAIL=admin@ocd.local
SEED_ADMIN_PASSWORD=change-me-before-going-live
```

---

## 2. 忘記密碼

`/forgot-password` → 收信 → `/reset-password?token=…` → 回 `/login`。

- 連結 **1 小時**有效、**只能用一次**，資料庫只存 SHA-256 雜湊，備份外洩也無法重放。
- 再次申請會讓前一條連結立刻失效。
- **不會**透露 Email 是否存在。無論帳號存不存在、是不是 Google 登入、信有沒有寄成功，
  畫面都顯示同一句話。對一個精神健康社群來說，「這個 Email 有沒有在這裡註冊」本身就是隱私。
- 限流：每 IP 5 次/小時、每 Email 3 次/小時、送出新密碼每 IP 10 次/小時。
- 重設成功後，**其他裝置上的登入狀態全部失效**（見下方 §7），並寄出一封「密碼已變更」通知信。

登入頁的「忘記密碼？」連結會在沒有郵件服務時改為顯示請聯絡站務。

## 3. Email 驗證

- 註冊當下就會寄出驗證信；連結 **24 小時**有效、只能用一次。
- 未驗證的帳號，全站頁首會有一條提示條，`/settings#email` 可重寄（每小時 3 次）。
- `REQUIRE_EMAIL_VERIFICATION=true` 時，未驗證不能發文或回覆，但仍可閱讀、登入、匯出與刪除帳號。
- 寄信後才改 Email 的話，舊連結會失效（token 綁定當時的地址）。
- 只用 Google 登入、沒有存 Email 的帳號不會被卡住。

## 4. 刪除帳號與資料匯出（個資法）

`/settings` 最下方。刪除有三道關卡：輸入「刪除我的帳號」、輸入目前密碼（有密碼的帳號）、
選擇內容怎麼處理。

| 選項 | 結果 |
| --- | --- |
| **一併刪除** | User 連同發文、回覆、舉報、各項申請一起消失（外鍵 cascade）。 |
| **保留內容，但完全匿名** | 發文與回覆改掛內建的「已刪除的使用者」帳號並強制匿名，別人回過的討論串不會出現空洞；User 本身仍然刪除。 |

兩種都會刪掉 Email、密碼雜湊、OAuth 連結、session 與 token，並嘗試刪除 R2 上的臨床證明檔
（失敗會寫 `logger.error`，需要人工補刪）。最後一位管理員無法刪除自己。

匯出：`/settings` 的「下載我的資料」或直接 `GET /api/me/export`，回傳一份 JSON
（帳號、發文、回覆、舉報、開版申請、臨床申請），每小時 3 次。

備份檔裡的舊資料會隨備份輪替消失，這點在刪除確認信裡有寫明。

## 5. 限流

原本的 `src/lib/rate-limit.ts` 是行程內的 Map，在 Vercel 上每個 instance 各自獨立，
多開連線就能繞過。現在改成兩層都要通過：

1. **行程內滑動視窗**（原本那層，免費、擋掉單一用戶的連續點擊）
2. **`RateLimitCounter` 資料表**（跨 instance，一次 round trip 完成 upsert + 讀前一個視窗）

第二層用兩個固定視窗做滑動視窗近似：

```
estimated = 前一個視窗的計數 × (前一個視窗還在範圍內的比例) + 目前視窗的計數
```

這樣就不會出現「視窗交界處可以用掉兩倍額度」的問題（`src/lib/rate-limit-window.test.ts` 有覆蓋）。

資料庫查詢失敗時 **不阻擋** 請求（第一層仍然生效）——不能讓限流把整站跟著資料庫一起拖垮。

過期的視窗由 `/api/cron/maintenance` 每晚清掉。

目前的額度：

| 動作 | 額度 |
| --- | --- |
| 註冊 | 每 IP 5 次/小時 |
| 發文 | 每人 5 次/分 |
| 回覆 | 每人 10 次/分 |
| 舉報 | 每人 5 次/分 |
| 申請重設密碼 | 每 IP 5 次/小時、每 Email 3 次/小時 |
| 送出新密碼 | 每 IP 10 次/小時 |
| 變更密碼 | 每人 5 次/小時 |
| 重寄驗證信 | 每人 3 次/小時 |
| 資料匯出 | 每人 3 次/小時 |
| 刪除帳號 | 每人 5 次/小時 |

middleware 那層（POST 60 次/分）仍是行程內的，因為它跑在 edge runtime，用不到 Prisma。

## 6. 舉報通知

有人送出舉報時會**立刻**推出通知，兩條管道各自獨立，其中一條掛掉不影響另一條：

- **Email** → `ADMIN_ALERT_EMAIL`，未設定則寄給所有 ADMIN 帳號。
- **Webhook** → `REPORT_WEBHOOK_URL`。payload 同時帶 `text`（Slack）與 `content`（Discord），
  所以同一個變數兩邊都能用。

內容命中危機關鍵字時，主旨與訊息會標記 `⚠ 危機關鍵字`。

通知成功會寫 `Report.notifiedAt`。沒寫上的（郵件當機、設定通知前就存在的舊舉報）
由 `/api/cron/maintenance` 每晚補一封摘要信。後台總覽會顯示還有幾件沒通知出去。

通知失敗**不會**讓舉報本身失敗——`notifyNewReport` 把所有錯誤吞進 log。

## 7. 密碼變更後的登入狀態

Session 是 JWT，刪 `Session` 資料列沒有用。改成在 `User.sessionsInvalidBefore` 蓋一個時間戳，
JWT 裡帶著 `loginAt`；比這個時間早的 token 在下一次 refresh（最多 60 秒）時會被拒絕。

重設密碼、變更密碼、`npm run admin:password` 都會蓋這個戳記。
帳號被刪除時 token 也會直接失效（找不到對應的 User 就結束 session）。

## 8. 部署設定自我檢查

- **開機時**：`instrumentation.ts` 會把設定問題寫進 log（`config: AUTH_SECRET — …`），
  可以在 log drain 上設告警。
- **後台總覽 `/admin`**：同一份檢查會用中文列在最上面，附帶處理方式。
  另外會用 bcrypt 比對站務帳號的密碼是不是還停在 docker-compose / 文件裡寫死的那幾組。
- **`/api/health`**：

  ```bash
  curl -s https://your-site/api/health | jq
  # r2 只看環境變數有沒有設；要真的驗證憑證用 deep：
  curl -s "https://your-site/api/health?deep=1" | jq .r2Live
  # { "ok": true }  或  { "ok": false, "reason": "…" }
  ```

  回應同時包含 `mail` / `mailTransport` / `reportAlerts` / `reportWebhook` /
  `emailVerificationEnforced` / `authSecret`。只有 `db` 會影響 HTTP 狀態碼。

### 站務密碼與 AUTH_SECRET

```bash
npm run admin:password                 # 換 admin@ocd.local 的密碼
npm run admin:password -- a@b.tw       # 換指定管理員
```

密碼從 stdin 讀取且不回顯，不會進 shell history、`ps` 或 CI log；至少 12 字；
換完該帳號所有登入狀態立即失效。

`AUTH_SECRET` 用 `openssl rand -base64 32` 產生，**設定後不要再改**——改了等於全站登出。

## 9. 排程

`vercel.json` 有兩支：

| 路徑 | 時間 (UTC) | 工作 |
| --- | --- | --- |
| `/api/cron/backup` | 03:00 | 邏輯備份上傳 R2 |
| `/api/cron/maintenance` | 03:30 | 清過期 token 與限流視窗、補寄未送出的舉報通知 |

兩支都用 `CRON_SECRET` 驗證，沒設定就拒絕執行。手動觸發：

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-site/api/cron/maintenance
```

## 10. 端對端煙霧測試

`scripts/smoke-e2e.ts` 用真實瀏覽器跑完整流程：
註冊 → 驗證 Email → 發文 → 回覆 → 舉報 → 變更密碼 → 忘記密碼重設 → 匯出資料 → 刪除帳號（保留內容）。

Playwright **不是**這個專案的相依套件（300MB 對一個小論壇太重），要跑的話另外裝：

```bash
npm i -D playwright && npx playwright install chromium
```

```bash
# 起一個收信用的假 webhook，把 payload 寫進檔案
node -e 'require("http").createServer((q,s)=>{let b="";q.on("data",c=>b+=c);q.on("end",()=>{require("fs").appendFileSync("/tmp/mail.log",b+"\n");s.end("{}")})}).listen(3999)' &

# 用一個乾淨的資料庫跑（會建立帳號與貼文，最後刪掉其中一個）
DATABASE_URL=…ocd_smoke MAIL_WEBHOOK_URL=http://127.0.0.1:3999/mail \
  PUBLIC_SITE_URL=http://localhost:3000 npm run dev

SMOKE_BASE_URL=http://localhost:3000 SMOKE_MAIL_LOG=/tmp/mail.log npm run smoke
```

| 變數 | 用途 |
| --- | --- |
| `SMOKE_BASE_URL` | 目標站台，預設 `http://localhost:3000` |
| `SMOKE_MAIL_LOG` | 收信檔案；沒設定時，需要信件的兩步會標記為 skip |
| `SMOKE_BOARD` | 用哪個版發文，預設 `contamination` |
| `SMOKE_HEADED=1` | 開有頭瀏覽器，方便看它在做什麼 |
| `SMOKE_PLAYWRIGHT` | 指向已安裝的 playwright（例如全域安裝的 `…/playwright/index.mjs`） |
| `SMOKE_CHROME_PATH` | 指定瀏覽器執行檔；未指定時會自動退回系統 Chrome |

**請用乾淨的資料庫。** 註冊限流是每 IP 5 次/小時且跨執行個體共用，
同一個資料庫連跑幾次就會被自己的限流擋下（腳本會明白說出來，不會只丟 timeout）。

## 11. 已知的取捨

- **暱稱可以完全重複**，這是刻意的。因此任何人都能取和站務或某位病友一樣的名字。
  設定頁與這份文件都有寫明；沒有加任何緩解措施。
- **驗證信的連結會被郵件掃描器點開**。對 Email 驗證來說這正好就是驗證的目的，可以接受；
  重設密碼的連結另外多一步（要輸入新密碼）才會生效，所以掃描器點到不會造成損害。
- **限流第二層會在資料庫掛掉時退回第一層**，此時額度只在單一 instance 內有效。
