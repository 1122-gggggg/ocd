/**
 * Next.js instrumentation hook — runs once when the server starts.
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 *
 * Keep lightweight: only init logger / observability. Heavy work here blocks boot.
 *
 * NOTE: no static imports of Node.js modules here — this file is also
 * compiled for the Edge runtime, where node:async_hooks (used by
 * src/lib/logger) is unavailable. The dynamic import below is the documented
 * exception (platform-specific module): it only executes on nodejs runtime.
 */

export async function register() {
  // Node.js runtime only — edge runtime has no console drain / async_hooks.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("./src/lib/logger");
    logger.info("instrumentation: register", {
      runtime: process.env.NEXT_RUNTIME,
      vercel: process.env.VERCEL ?? "0",
    });

    // TODO Sentry: when @sentry/nextjs is installed, init here:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}
