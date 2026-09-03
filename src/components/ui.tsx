"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { formatDateTime, formatRelative, initialOf } from "@/lib/format";

/* ── Avatar ──────────────────────────────────────────────────── */

export function Avatar({
  name,
  anonymous = false,
  size = "md",
}: {
  name: string;
  anonymous?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "avatar",
        size === "sm" ? "avatar-sm" : "",
        anonymous ? "avatar-anon" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {anonymous ? "＊" : initialOf(name)}
    </span>
  );
}

/* ── Author line ─────────────────────────────────────────────── */

export function AuthorMeta({
  label,
  badge,
  anonymous,
  at,
  relative = false,
  extra,
}: {
  label: string;
  badge?: string | null;
  anonymous?: boolean;
  at?: Date | string | number;
  relative?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted min-w-0">
      <Avatar name={label} anonymous={anonymous} size="sm" />
      <span className="font-medium text-fg name-clip-1" title={label}>
        {label}
      </span>
      {badge && <span className="badge badge-accent">{badge}</span>}
      {at && (
        <time
          dateTime={new Date(at).toISOString()}
          title={formatDateTime(at)}
          className="text-subtle shrink-0"
        >
          {relative ? formatRelative(at) : formatDateTime(at)}
        </time>
      )}
      {extra}
    </div>
  );
}

/* ── Page header ─────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        {eyebrow && <div className="text-xs font-medium text-accent">{eyebrow}</div>}
        <h1 className="text-2xl font-bold tracking-tight name-clip" title={title}>{title}</h1>
        {description && (
          <div className="text-sm text-muted leading-relaxed">{description}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card card-pad text-center space-y-2 py-10">
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/* ── Pagination ──────────────────────────────────────────────── */

export function Pagination({
  currentPage,
  totalPages,
  hrefFor,
  summary,
}: {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  summary?: string;
}) {
  if (totalPages <= 1) return null;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-3 pt-2"
      aria-label="分頁"
    >
      {hasPrev ? (
        <Link href={hrefFor(currentPage - 1)} className="btn btn-secondary btn-sm btn-touch" rel="prev">
          ← 上一頁
        </Link>
      ) : (
        <button type="button" disabled className="btn btn-secondary btn-sm btn-touch">
          ← 上一頁
        </button>
      )}
      <span className="text-xs text-muted tabular-nums">
        第 {currentPage} / {totalPages} 頁{summary ? `・${summary}` : ""}
      </span>
      {hasNext ? (
        <Link href={hrefFor(currentPage + 1)} className="btn btn-secondary btn-sm btn-touch" rel="next">
          下一頁 →
        </Link>
      ) : (
        <button type="button" disabled className="btn btn-secondary btn-sm btn-touch">
          下一頁 →
        </button>
      )}
    </nav>
  );
}

/* ── Breadcrumbs ─────────────────────────────────────────────── */

export function Breadcrumbs({
  items,
  label = "麵包屑",
}: {
  items: { label: string; href?: string }[];
  label?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} className="text-xs text-subtle">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            // Static trail: position is a stable key.
            <li key={`${i}-${item.label}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="select-none">
                  /
                </span>
              )}
              {last || !item.href ? (
                <span aria-current="page" className="text-muted">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-accent">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ── Password input with show/hide toggle ────────────────────── */

export function PasswordInput({
  id,
  name,
  autoComplete = "current-password",
  required,
  minLength,
  placeholder,
  invalid = false,
  describedBy,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        id={id}
        name={name}
        type={shown ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="input min-w-0 flex-1"
      />
      <button
        type="button"
        aria-pressed={shown}
        aria-controls={id}
        onClick={() => setShown((v) => !v)}
        className="btn btn-secondary btn-touch shrink-0"
      >
        {shown ? "隱藏" : "顯示"}
      </button>
    </div>
  );
}

/* ── Group label ─────────────────────────────────────────────── */

export const GROUP_LABELS: Record<string, string> = {
  SYMPTOM: "症狀",
  TREATMENT: "治療",
  COMMUNITY: "社群",
};

export const GROUP_ORDER = ["SYMPTOM", "TREATMENT", "COMMUNITY"] as const;
