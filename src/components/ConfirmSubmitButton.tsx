"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className = "btn btn-danger btn-sm",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
  children: ReactNode;
}) {
  return (
    <button
      {...props}
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
