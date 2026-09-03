import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Cloudflare R2 (S3-compatible) client for Vercel serverless.
 *
 * Required Vercel envs (see .env.example / DEPLOY_VERCEL_NEON.md §3):
 * - R2_ACCOUNT_ID        Cloudflare account ID (xxx in https://xxx.r2.cloudflarestorage.com)
 * - R2_ACCESS_KEY_ID     R2 API token access key
 * - R2_SECRET_ACCESS_KEY R2 API token secret
 * - R2_BUCKET            bucket name (default: "ocd-proofs")
 *
 * r2Enabled is true only when all three credentials are present; when false,
 * `r2` is null and callers should fall back or return 503.
 * Endpoint is `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` with region "auto".
 */
export const r2Enabled =
  !!process.env.R2_ACCOUNT_ID &&
  !!process.env.R2_ACCESS_KEY_ID &&
  !!process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET || "ocd-proofs";

export const r2 = r2Enabled
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

/**
 * Prove the credentials actually work, rather than just that they are present.
 *
 * `r2Enabled` only checks that three env vars are non-empty, which is exactly
 * the state a misconfigured deploy is in: uploads look wired up until the first
 * clinician tries to submit a proof and gets a 500. HeadBucket is the cheapest
 * call that exercises signing, endpoint and permissions together.
 *
 * Kept out of the default health response because it costs a network round trip
 * to Cloudflare; /api/health?deep=1 opts in.
 */
export async function checkR2(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!r2) return { ok: false, reason: "NOT_CONFIGURED" };
  try {
    await r2.send(new HeadBucketCommand({ Bucket: R2_BUCKET }));
    return { ok: true };
  } catch (err) {
    const e = err as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
    const status = e.$metadata?.httpStatusCode;
    return {
      ok: false,
      reason: `${e.name ?? "Error"}${status ? ` (HTTP ${status})` : ""}: ${(e.message ?? "").slice(0, 200)}`,
    };
  }
}
