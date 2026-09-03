import { logger } from "./src/lib/logger";
import { checkEnvConfig, configSummary } from "./src/lib/config-check";

/**
 * Next.js instrumentation hook — runs once when the server starts.
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 *
 * Keep lightweight: only init logger / observability. Heavy work here blocks
 * boot, which is why the config audit is env-only and never touches the
 * database.
 */

export async function register() {
  // Node.js runtime only — edge runtime has no console drain / async_hooks.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logger.info("instrumentation: register", {
      runtime: process.env.NEXT_RUNTIME,
      vercel: process.env.VERCEL ?? "0",
      ...configSummary(),
    });

    // Surface half-configured deploys in the boot log, where a log drain alert
    // can catch them, instead of waiting for a member to hit the broken path.
    for (const issue of checkEnvConfig()) {
      const line = `config: ${issue.key} — ${issue.message}`;
      if (issue.severity === "error") logger.error(line, { fix: issue.fix });
      else logger.warn(line, { fix: issue.fix });
    }

    // TODO Sentry: when @sentry/nextjs is installed, init here:
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
  }
}
