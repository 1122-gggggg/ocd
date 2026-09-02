/**
 * Nicknames are unrestricted: any characters, any length, duplicates allowed.
 * The only rules are that a name cannot be blank and that it fits a generous
 * storage cap, which exists to bound the request payload — not to shape what
 * people call themselves.
 */
export const NICKNAME_MAX = 200;

export function normalizeNickname(raw: unknown): string {
  return String(raw ?? "").trim();
}
