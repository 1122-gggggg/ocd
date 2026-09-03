import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/**
 * Detect a seeded admin account still using a password that appears in this
 * repository, the docker-compose file, or the deploy guide.
 *
 * Deliberately *not* run at boot: each bcrypt comparison costs ~100ms by
 * design, and this list would add a second to every cold start. The admin
 * dashboard is the right place to run it — it is seen by exactly the person who
 * can fix it, and only when they are already logged in.
 */

const KNOWN_WEAK_ADMIN_PASSWORDS = [
  "changeme-admin", // docker-compose.yml default
  "changeme",
  "admin",
  "admin123",
  "admin1234",
  "password",
  "password123",
  "12345678",
  "ocd12345",
];

export type AdminPasswordVerdict =
  | { status: "ok" }
  | { status: "no-admin" }
  | { status: "no-password" }
  | { status: "weak" };

export async function checkAdminPassword(
  email = process.env.SEED_ADMIN_EMAIL || "admin@ocd.local",
): Promise<AdminPasswordVerdict> {
  const admin = await prisma.user.findFirst({
    where: { email, role: "ADMIN" },
    select: { passwordHash: true },
  });
  if (!admin) return { status: "no-admin" };
  if (!admin.passwordHash) return { status: "no-password" };

  const candidates = new Set(KNOWN_WEAK_ADMIN_PASSWORDS);
  // Whatever the deploy seeded with is, by definition, a value written down in
  // an env file somewhere — treat it as compromised for an admin account.
  if (process.env.SEED_ADMIN_PASSWORD) candidates.add(process.env.SEED_ADMIN_PASSWORD);

  for (const candidate of candidates) {
    if (await bcrypt.compare(candidate, admin.passwordHash)) {
      // The matched value is never returned or logged: it is a live credential.
      return { status: "weak" };
    }
  }
  return { status: "ok" };
}
