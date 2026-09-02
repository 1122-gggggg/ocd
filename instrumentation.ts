import { logger } from "./src/lib/logger";

/**
 * Next.js instrumentation hook — runs once when the server starts.
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 *
 * Keep lightweight: only init logger / observability. Heavy work here blocks boot.
 */

export async function register() {
  // Node.js runtime only — edge runtime has no console drain / async_hooks.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logger.info("instrumentation: register", {
      runtime: process.env.NEXT_RUNTIME,
      vercel: process.env.VERCEL ?? "0",
    });

    // TODO Sentry: when @sentry/nextjs is installed, init here:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}
