"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/boards", label: "版區說明" },
  { href: "/admin/applications", label: "開版申請" },
  { href: "/admin/clinicians", label: "臨床申請" },
  { href: "/admin/reports", label: "舉報" },
];

/**
 * `badges` maps a nav href to a count worth showing. Passed in from the server
 * layout because this component is client-side and cannot query the database.
 */
export function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-line pb-px"
      aria-label="後台導覽"
    >
      {ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        const count = badges[item.href] ?? 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-sm transition-colors inline-flex items-center gap-1.5 ${
              active
                ? "border-accent text-accent font-medium"
                : "border-transparent text-muted hover:text-fg hover:bg-surface-3"
            }`}
          >
            {item.label}
            {count > 0 && (
              <span className="badge badge-warning" aria-label={`${count} 件待處理`}>
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
