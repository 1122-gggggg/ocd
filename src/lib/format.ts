const TZ = "Asia/Taipei";

const dateTimeFmt = new Intl.DateTimeFormat("zh-TW", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFmt = new Intl.DateTimeFormat("zh-TW", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Absolute timestamps are formatted in the site's own timezone so the string
 * does not depend on whichever region the server happens to run in.
 */
export function formatDateTime(value: Date | string | number): string {
  return dateTimeFmt.format(new Date(value));
}

export function formatDate(value: Date | string | number): string {
  return dateFmt.format(new Date(value));
}

/** Coarse "how long ago", for list rows where the exact minute is noise. */
export function formatRelative(value: Date | string | number): string {
  const then = new Date(value).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(diff)) return "";

  const min = Math.floor(diff / 60_000);
  if (min < 1) return "剛剛";
  if (min < 60) return `${min} 分鐘前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小時前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} 天前`;
  return formatDate(value);
}

/**
 * First visible character of a free-form nickname, for the avatar circle.
 * Uses code points so an emoji or CJK name yields one whole glyph.
 */
export function initialOf(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  return Array.from(trimmed)[0] ?? "?";
}
