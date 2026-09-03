/**
 * End-to-end smoke test through a real browser.
 *
 * Covers the path no unit test reaches: a person filling in forms, server
 * actions running, cookies and redirects behaving, mail links working. It is
 * the check to run before opening registration, and after any change to auth.
 *
 *   1. register -> auto login -> unverified-email banner
 *   2. redeem the verification link from the mail transport
 *   3. create a post, reply to it
 *   4. a second account reports the post (fires the admin alert)
 *   5. change password (all sessions invalidated), log back in
 *   6. forgot password -> reset link -> log in with the new password
 *   7. download the JSON data export
 *   8. delete the account keeping content, confirm it is anonymised
 *
 * ## Running it
 *
 *   npm run smoke                          # against http://localhost:3000
 *   SMOKE_BASE_URL=https://staging… npm run smoke
 *
 * Playwright is intentionally NOT a dependency of this project — it would add
 * ~300MB to every install of a small forum. Install it once where you run the
 * smoke test:
 *
 *   npm i -D playwright && npx playwright install chromium
 *
 * ## Capturing the emailed links
 *
 * Steps 2 and 6 need the URL that was mailed out. Point the app at a local
 * catcher and tell this script where to read it:
 *
 *   MAIL_WEBHOOK_URL=http://127.0.0.1:3999/mail   # app env
 *   SMOKE_MAIL_LOG=/tmp/mail.log                  # this script
 *
 * where the catcher appends each JSON payload it receives to that file. With
 * no transport configured at all the app logs the body instead, so
 * SMOKE_MAIL_LOG can also point at the server's own log file. If neither is
 * available those two steps are skipped and reported as skipped, never as
 * passed.
 *
 * Run it against a scratch database. It creates accounts and posts, and the
 * last step deletes one of them.
 */

import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const MAIL_LOG = process.env.SMOKE_MAIL_LOG ?? "";
const BOARD = process.env.SMOKE_BOARD ?? "contamination";
const HEADLESS = process.env.SMOKE_HEADED !== "1";

const stamp = Date.now();
const alice = {
  email: `smoke-alice-${stamp}@example.test`,
  password: "smoke-Passw0rd-alice",
  newPassword: "smoke-Passw0rd-alice-2",
  resetPassword: "smoke-Passw0rd-alice-3",
  nickname: `煙霧測試 ${stamp}`,
};
const bob = {
  email: `smoke-bob-${stamp}@example.test`,
  password: "smoke-Passw0rd-bob",
  nickname: `煙霧測試 B ${stamp}`,
};
const postTitle = `煙霧測試貼文 ${stamp}`;
const replyBody = `煙霧測試回覆 ${stamp}`;

/**
 * Just enough of Playwright's surface to type this script without depending on
 * its type definitions — the package is loaded dynamically and is not a
 * dependency of the project, so `import type` from it would break `tsc`.
 */
type LaunchOptions = {
  headless?: boolean;
  executablePath?: string;
  channel?: string;
};
type Locator = {
  count(): Promise<number>;
  first(): Locator;
  fill(value: string): Promise<void>;
  click(): Promise<void>;
  locator(selector: string, options?: { hasText?: string }): Locator;
};
type Page = {
  goto(url: string): Promise<unknown>;
  fill(selector: string, value: string): Promise<void>;
  click(selector: string): Promise<void>;
  check(selector: string): Promise<void>;
  selectOption(selector: string, value: string): Promise<unknown>;
  textContent(selector: string): Promise<string | null>;
  waitForURL(url: string | RegExp, options?: { timeout?: number }): Promise<void>;
  waitForFunction(
    fn: (arg: string) => boolean,
    arg: string,
    options?: { timeout?: number },
  ): Promise<unknown>;
  locator(selector: string, options?: { hasText?: string }): Locator;
  url(): string;
  request: { get(url: string): Promise<{ ok(): boolean; status(): number; json(): Promise<unknown> }> };
};
type BrowserContext = {
  newPage(): Promise<Page>;
  close(): Promise<void>;
};
type Browser = {
  newContext(options?: { baseURL?: string; locale?: string }): Promise<BrowserContext>;
  close(): Promise<void>;
};
type Chromium = { launch(options?: LaunchOptions): Promise<Browser> };

type Status = "pass" | "fail" | "skip";
const results: { name: string; status: Status; detail?: string }[] = [];

function record(name: string, status: Status, detail?: string) {
  results.push({ name, status, detail });
  const mark = status === "pass" ? "✓" : status === "skip" ? "–" : "✗";
  console.log(`${mark} ${name}${detail ? `  (${detail})` : ""}`);
}

/**
 * Wait for a registration to land, and turn a rejection into a useful message.
 *
 * Registration is limited to 5/hour per IP against a counter shared by every
 * instance, so running this script repeatedly against one database will trip
 * it — which looks like a mysterious timeout unless it is named.
 */
async function settleRegistration(page: Page): Promise<void> {
  await page.waitForURL(/(\/$)|(\/register\?err=)/, { timeout: 15_000 });
  const url = page.url();
  if (url.includes("/register?err=")) {
    const code = decodeURIComponent(url.split("err=")[1]?.split("&")[0] ?? "");
    throw new Error(
      code === "RATE_LIMITED"
        ? "registration rate limited (5/hour per IP) — use a fresh database or wait"
        : `registration rejected: ${code}`,
    );
  }
}

/** Pull the newest link matching `pathPrefix` out of the captured mail. */
function latestMailLink(pathPrefix: string): string | null {
  if (!MAIL_LOG) return null;
  let text: string;
  try {
    text = readFileSync(MAIL_LOG, "utf8");
  } catch {
    return null;
  }
  // The payload carries the same link twice — once in the plain-text body and
  // once inside the HTML. Angle brackets must be excluded or the HTML copy
  // matches `…token=abc</span>` and the trailing tag is sent as part of the
  // token. Quotes and backslashes bound the JSON-escaped copies.
  const pattern = new RegExp(
    `https?:\\\\?/\\\\?/[^"'<>\\s\\\\]+${pathPrefix}[^"'<>\\s\\\\]*`,
    "g",
  );
  const found = text.match(pattern);
  if (!found?.length) return null;
  return found[found.length - 1]!.replace(/\\\//g, "/");
}

async function main() {
  // SMOKE_PLAYWRIGHT lets a globally-installed copy be used instead of a local
  // devDependency (ESM ignores NODE_PATH, so a path is the only way in).
  const specifiers = [
    ...(process.env.SMOKE_PLAYWRIGHT ? [process.env.SMOKE_PLAYWRIGHT] : []),
    "playwright",
  ];
  let chromium: Chromium | undefined;
  for (const spec of specifiers) {
    try {
      ({ chromium } = (await import(spec)) as { chromium: Chromium });
      break;
    } catch {
      // try the next specifier
    }
  }
  if (!chromium) {
    console.error(
      "playwright is not installed. Run:\n" +
        "  npm i -D playwright && npx playwright install chromium\n" +
        "or point SMOKE_PLAYWRIGHT at an existing install, e.g.\n" +
        "  SMOKE_PLAYWRIGHT=/usr/lib/node_modules/playwright npm run smoke",
    );
    process.exit(2);
  }

  // Fail fast with a useful message rather than a wall of timeouts.
  const health = await fetch(`${BASE}/api/health`).catch(() => null);
  if (!health?.ok) {
    console.error(`${BASE}/api/health is not responding — is the server running?`);
    process.exit(2);
  }
  const healthBody = (await health.json()) as { mail?: boolean; db?: boolean };
  console.log(`base=${BASE} db=${healthBody.db} mail=${healthBody.mail}\n`);

  // Prefer Playwright's own download; fall back to a system Chrome so the
  // script still runs on a machine that has a browser but no downloaded
  // Playwright build (CI images and dev laptops both hit this).
  const browser = await chromium
    .launch({
      headless: HEADLESS,
      ...(process.env.SMOKE_CHROME_PATH
        ? { executablePath: process.env.SMOKE_CHROME_PATH }
        : {}),
    })
    .catch(async (err) => {
      if (process.env.SMOKE_CHROME_PATH) throw err;
      console.log("bundled chromium unavailable, falling back to system Chrome");
      return chromium.launch({ headless: HEADLESS, channel: "chrome" });
    });
  const context = await browser.newContext({ baseURL: BASE, locale: "zh-TW" });
  const page = await context.newPage();

  const fail = (name: string, err: unknown) =>
    record(name, "fail", err instanceof Error ? err.message.split("\n")[0] : String(err));

  try {
    // ---- 1. register -----------------------------------------------------
    try {
      await page.goto("/register");
      await page.fill("#reg-email", alice.email);
      await page.fill("#reg-password", alice.password);
      await page.fill("#reg-nickname", alice.nickname);
      await page.selectOption("#reg-member", "PATIENT");
      await page.click('button[type="submit"]');
      await settleRegistration(page);
      const body = await page.textContent("body");
      if (!body?.includes(alice.nickname)) {
        throw new Error("registered but the header does not show the new nickname");
      }
      record("register + auto login", "pass");
    } catch (e) {
      fail("register + auto login", e);
      throw e; // nothing downstream works without an account
    }

    // ---- 1b. unverified banner ------------------------------------------
    try {
      const banner = await page.textContent("body");
      if (healthBody.mail && !banner?.includes("Email 還沒驗證")) {
        throw new Error("expected the unverified-email banner");
      }
      record("unverified-email banner", healthBody.mail ? "pass" : "skip", healthBody.mail ? undefined : "no mail transport");
    } catch (e) {
      fail("unverified-email banner", e);
    }

    // ---- 2. verify email -------------------------------------------------
    try {
      await sleep(500); // the mail is sent during the register action
      const link = latestMailLink("/verify-email");
      if (!link) {
        record("verify email link", "skip", "no captured mail (set SMOKE_MAIL_LOG)");
      } else {
        await page.goto(link);
        const text = await page.textContent("body");
        if (!text?.includes("Email 驗證完成")) {
          throw new Error(`verification page said: ${text?.slice(0, 80)}`);
        }
        record("verify email link", "pass");
      }
    } catch (e) {
      fail("verify email link", e);
    }

    // ---- 3. post + reply -------------------------------------------------
    try {
      await page.goto(`/b/${BOARD}/new`);
      // PostForm gives its fields stable ids; the per-item edit forms further
      // down the post page reuse name="bodyMd", so ids are the safe selector.
      await page.fill("#pf-title", postTitle);
      await page.fill("#pf-body", `這是一則自動化煙霧測試貼文。${stamp}`);
      await page.click('#post-form button[type="submit"]');
      await page.waitForURL(new RegExp(`/b/${BOARD}/p/`), { timeout: 15_000 });
      if (!(await page.textContent("body"))?.includes(postTitle)) {
        throw new Error("post page does not show the title");
      }
      record("create post", "pass");
    } catch (e) {
      fail("create post", e);
    }

    const postUrl = page.url();

    try {
      await page.fill("#pf-body", replyBody);
      await page.click('#post-form button[type="submit"]');
      await page.waitForFunction(
        (body) => document.body.innerText.includes(body),
        replyBody,
        { timeout: 15_000 },
      );
      record("create reply", "pass");
    } catch (e) {
      fail("create reply", e);
    }

    // ---- 4. second account reports the post ------------------------------
    try {
      const bobContext = await browser.newContext({ baseURL: BASE, locale: "zh-TW" });
      const bobPage = await bobContext.newPage();
      await bobPage.goto("/register");
      await bobPage.fill("#reg-email", bob.email);
      await bobPage.fill("#reg-password", bob.password);
      await bobPage.fill("#reg-nickname", bob.nickname);
      await bobPage.click('button[type="submit"]');
      await settleRegistration(bobPage);

      await bobPage.goto(postUrl);
      // The report form lives inside a collapsed <details>; open it first.
      const reportToggle = bobPage.locator("summary", { hasText: "舉報" }).first();
      if ((await reportToggle.count()) === 0) {
        record("report a post", "skip", "no report form on the post page");
      } else {
        await reportToggle.click();
        const reportForm = bobPage.locator('form:has(textarea[name="reason"])').first();
        await reportForm
          .locator('textarea[name="reason"]')
          .fill(`煙霧測試舉報理由，長度需超過十個字 ${stamp}`);
        await reportForm.locator('button[type="submit"]').click();
        await sleep(1500);
        record("report a post", "pass");
      }
      await bobContext.close();
    } catch (e) {
      fail("report a post", e);
    }

    // ---- 5. change password ---------------------------------------------
    try {
      await page.goto("/settings");
      await page.fill("#cur-pw", alice.password);
      await page.fill("#new-pw", alice.newPassword);
      await page.fill("#confirm-pw", alice.newPassword);
      await page.click('#password button[type="submit"]');
      await page.waitForURL(/\/login/, { timeout: 15_000 });

      await page.fill("#login-email", alice.email);
      await page.fill("#login-password", alice.newPassword);
      await page.click('form:has(#login-password) button[type="submit"]');
      await page.waitForURL(`${BASE}/`, { timeout: 15_000 });
      record("change password + re-login", "pass");
    } catch (e) {
      fail("change password + re-login", e);
    }

    // ---- 6. forgot password ---------------------------------------------
    try {
      await page.goto("/forgot-password");
      const form = page.locator("#forgot-email");
      if ((await form.count()) === 0) {
        record("forgot password", "skip", "mail not configured on the server");
      } else {
        await form.fill(alice.email);
        await page.click('form:has(#forgot-email) button[type="submit"]');
        await page.waitForURL(/sent=1/, { timeout: 15_000 });
        await sleep(800);

        const link = latestMailLink("/reset-password");
        if (!link) {
          record("forgot password", "skip", "no captured mail (set SMOKE_MAIL_LOG)");
        } else {
          await page.goto(link);
          await page.fill("#reset-password", alice.resetPassword);
          await page.fill("#reset-confirm", alice.resetPassword);
          await page.click('form:has(#reset-password) button[type="submit"]');
          await page.waitForURL(/reset=1/, { timeout: 15_000 });

          await page.fill("#login-email", alice.email);
          await page.fill("#login-password", alice.resetPassword);
          await page.click('form:has(#login-password) button[type="submit"]');
          await page.waitForURL(`${BASE}/`, { timeout: 15_000 });
          record("forgot password -> reset -> login", "pass");
        }
      }
    } catch (e) {
      fail("forgot password -> reset -> login", e);
    }

    // ---- 7. data export --------------------------------------------------
    try {
      const res = await page.request.get("/api/me/export");
      if (!res.ok()) throw new Error(`HTTP ${res.status()}`);
      const data = (await res.json()) as {
        user?: { email?: string };
        posts?: { title: string }[];
      };
      if (data.user?.email !== alice.email) throw new Error("export is for the wrong user");
      if (!data.posts?.some((p) => p.title === postTitle)) {
        throw new Error("export does not contain the smoke post");
      }
      record("data export", "pass");
    } catch (e) {
      fail("data export", e);
    }

    // ---- 8. delete account, keep content ---------------------------------
    try {
      await page.goto("/settings#danger");
      await page.check('input[name="mode"][value="ANONYMIZE"]');
      const delPw = page.locator("#del-pw");
      if ((await delPw.count()) > 0) await delPw.fill(alice.resetPassword);
      await page.fill("#del-confirm", "刪除我的帳號");
      await page.click('#danger button[type="submit"]');
      await page.waitForURL(/deleted=1/, { timeout: 20_000 });

      // The post must survive, attributed to nobody.
      await page.goto(postUrl);
      const after = await page.textContent("body");
      if (!after?.includes(postTitle)) throw new Error("post disappeared under ANONYMIZE");
      if (after.includes(alice.nickname)) throw new Error("post still shows the deleted nickname");

      // And the old password must no longer work.
      await page.goto("/login");
      await page.fill("#login-email", alice.email);
      await page.fill("#login-password", alice.resetPassword);
      await page.click('form:has(#login-password) button[type="submit"]');
      await page.waitForURL(/error=invalid/, { timeout: 15_000 });
      record("delete account (keep content)", "pass");
    } catch (e) {
      fail("delete account (keep content)", e);
    }
  } catch {
    // A thrown step already recorded itself; fall through to the summary.
  } finally {
    await context.close();
    await browser.close();
  }

  const failed = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skip");
  console.log(
    `\n${results.length - failed.length - skipped.length} passed, ${failed.length} failed, ${skipped.length} skipped`,
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
