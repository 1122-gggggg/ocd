import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Structured JSON logger — observability for Vercel sin1 / pooled Neon.
 *
 * Each line is a single JSON object written to stdout/stderr so Vercel log
 * drains / Datadog / Axiom can parse without a sidecar.
 *
 * Fields:
 * - timestamp  ISO-8601
 * - level      info | warn | error
 * - message    human-readable msg
 * - requestId  per-request correlation (via AsyncLocalStorage or explicit)
 * - userId     authenticated user id when available
 * - ...meta    caller-supplied extras
 */

// ---------------------------------------------------------------------------
// Request context (AsyncLocalStorage)
// ---------------------------------------------------------------------------

export type RequestContext = {
  requestId?: string;
  userId?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

/** Run `fn` with a bound request/user id (e.g. from middleware `x-request-id`). */
export function withRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return requestContext.run(ctx, fn);
}

/** Merge current ALS store with explicit fields — explicit wins. */
function mergedContext(fields?: RequestContext): RequestContext {
  const store = requestContext.getStore();
  return { ...store, ...fields };
}

// ---------------------------------------------------------------------------
// PII redaction — logs must never print emails / hashes / tokens.
// ---------------------------------------------------------------------------

const REDACTED = "[REDACTED]";

const SENSITIVE_KEYS: Record<string, true> = {
  email: true,
  passwordhash: true,
  token: true,
  secret: true,
  authorization: true,
  cookie: true,
};

const SENSITIVE_SUBSTRINGS = [
  "email",
  "password",
  "token",
  "secret",
  "authoriz",
  "cookie",
  "setcookie",
];

/** Case-insensitive match: exact key or substring (covers refresh_token, etc.). */
function isSensitiveKey(key: string): boolean {
  const n = key.toLowerCase().replace(/[_-]/g, "");
  if (SENSITIVE_KEYS[n]) return true;
  for (const s of SENSITIVE_SUBSTRINGS) {
    if (n.includes(s)) return true;
  }
  return false;
}

/** Deep-clone `value`, replacing sensitive keys with [REDACTED]. */
function redact(value: unknown, depth = 0): unknown {
  if (depth > 8) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = isSensitiveKey(k) ? REDACTED : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

export type LogFields = RequestContext & Record<string, unknown>;

function format(
  level: "info" | "warn" | "error",
  message: string,
  fields: LogFields = {},
): string {
  const { requestId, userId, ...rest } = mergedContext(fields) as LogFields & {
    requestId?: string;
    userId?: string;
  };
  // fields may contain requestId/userId that should override ALS; re-merge
  // explicit fields after ALS so last-write wins even if caller passed them
  // inside rest (already merged, but keep for clarity).
  const explicit = fields as LogFields;
  const finalRequestId = explicit.requestId ?? requestId;
  const finalUserId = explicit.userId ?? userId;

  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(finalRequestId ? { requestId: finalRequestId } : {}),
    ...(finalUserId ? { userId: finalUserId } : {}),
    ...((redact(rest) as Record<string, unknown> | null) ?? {}),
  };

  // Remove duplicate requestId/userId from rest if they leaked
  // (already extracted, but rest excludes them via destructuring of merged)
  return JSON.stringify(entry);
}

function log(
  level: "info" | "warn" | "error",
  message: string,
  fields?: LogFields,
): void {
  const line = format(level, message, fields);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const logger = {
  info(message: string, fields?: LogFields): void {
    log("info", message, fields);
  },
  warn(message: string, fields?: LogFields): void {
    log("warn", message, fields);
  },
  error(message: string, fields?: LogFields): void {
    log("error", message, fields);
  },
  /** Create a child logger with bound context (convenience for route handlers). */
  child(base: LogFields) {
    return {
      info: (m: string, f?: LogFields) => log("info", m, { ...base, ...f }),
      warn: (m: string, f?: LogFields) => log("warn", m, { ...base, ...f }),
      error: (m: string, f?: LogFields) => log("error", m, { ...base, ...f }),
    };
  },
};

export default logger;
