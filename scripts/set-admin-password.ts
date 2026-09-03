/**
 * Set an admin account's password without going through the web UI.
 *
 *   npm run admin:password                    # prompts for admin@ocd.local
 *   npm run admin:password -- you@example.org # prompts for that account
 *
 * The password is read from stdin with echo off and never appears in argv, so
 * it does not end up in shell history, `ps` output, or a CI log. Setting it
 * also stamps `sessionsInvalidBefore`, which signs out every existing session
 * for that account — the right behaviour when you are rotating a password you
 * suspect has leaked.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();
const MIN_LENGTH = 12;

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    if (!input.isTTY) {
      // Piped input: read one line as-is. Useful for `openssl rand … | npm run …`
      // in a provisioning script.
      const rl = createInterface({ input });
      rl.once("line", (line) => {
        rl.close();
        resolve(line);
      });
      rl.once("close", () => resolve(""));
      return;
    }

    output.write(question);
    const rl = createInterface({ input, output, terminal: true });
    // Suppress echo by swallowing the write the readline interface would make.
    const muted = rl as unknown as { _writeToOutput: (s: string) => void };
    muted._writeToOutput = () => {};
    rl.question("", (answer) => {
      rl.close();
      output.write("\n");
      resolve(answer);
    });
    rl.on("error", reject);
  });
}

async function main() {
  const email = (process.argv[2] || process.env.SEED_ADMIN_EMAIL || "admin@ocd.local")
    .trim()
    .toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true, nickname: true },
  });
  if (!user) {
    console.error(`找不到帳號：${email}`);
    process.exit(1);
  }
  if (user.role !== "ADMIN") {
    console.error(`${email} 不是管理員帳號，這個腳本只用於管理員密碼輪替。`);
    process.exit(1);
  }

  console.log(`帳號：${email}（${user.nickname}）`);
  const suggestion = randomBytes(18).toString("base64url");
  console.log(`如果需要一組隨機密碼可以用：${suggestion}`);

  const first = await promptHidden("新密碼（輸入不會顯示）：");
  if (first.length < MIN_LENGTH) {
    console.error(`密碼太短，管理員密碼至少 ${MIN_LENGTH} 字。`);
    process.exit(1);
  }
  if (process.stdin.isTTY) {
    const second = await promptHidden("再輸入一次：");
    if (first !== second) {
      console.error("兩次輸入不一致，未變更。");
      process.exit(1);
    }
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(first, 12),
      // Any JWT minted before now is refused on its next refresh.
      sessionsInvalidBefore: now,
    },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log("密碼已更新，該帳號所有既有登入狀態都已失效。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
