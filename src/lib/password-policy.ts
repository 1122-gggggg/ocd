/**
 * Password rules, kept in their own module with no imports.
 *
 * Registration, the emailed reset flow and the signed-in change form all call
 * `validatePassword`, so the three can never drift apart — and because nothing
 * here touches the database or the mailer, both the client-facing pages and the
 * unit tests can import it freely.
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;

export type PasswordContext = {
  email?: string | null;
  nickname?: string | null;
};

/** Returns a member-facing reason to reject, or null when the password is fine. */
export function validatePassword(
  password: string,
  context?: PasswordContext,
): string | null {
  if (password.length < PASSWORD_MIN) return `密碼至少 ${PASSWORD_MIN} 字`;
  if (password.length > PASSWORD_MAX) return "密碼過長";

  const lowered = password.toLowerCase();

  // The local part of the address is the single most common thing people
  // reuse, and it is public to anyone who has ever received their mail.
  const local = context?.email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && lowered.includes(local)) {
    return "密碼不能包含你的 Email";
  }

  // Nicknames are unrestricted and shown on every post, so one used as a
  // password is effectively public too.
  const nick = context?.nickname?.trim().toLowerCase();
  if (nick && nick.length >= 4 && lowered.includes(nick)) {
    return "密碼不能包含你的暱稱";
  }

  if (/^(.)\1+$/.test(password)) return "密碼不能是同一個字元重複";

  return null;
}
