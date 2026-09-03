"use client";

import { Markdown } from "@/lib/markdown";

export default function MarkdownPreview({ content }: { content: string }) {
  return <Markdown>{content}</Markdown>;
}
