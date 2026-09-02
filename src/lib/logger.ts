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
// Core formatter
// ---------------------------------------------------------------------------

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
    ...rest,
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
