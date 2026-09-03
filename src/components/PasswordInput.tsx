"use client";

import { useState } from "react";

/* ── Password input with show/hide toggle (client: useState) ──── */

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
