const SENSITIVE_KEYWORDS = [
  "自傷",
  "自残",
  "自殺",
  "自杀",
  "想死",
  "性侵",
  "暴力",
];

export function shouldHidePost(
  { title, bodyMd }: { title: string; bodyMd: string },
  pref: { hideSensitiveTopics: boolean } | null
): boolean {
  if (!pref?.hideSensitiveTopics) return false;
  const hay = `${title ?? ""}\n${bodyMd ?? ""}`;
  return SENSITIVE_KEYWORDS.some((k) => hay.includes(k));
}
