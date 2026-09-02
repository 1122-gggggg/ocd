import { S3Client } from "@aws-sdk/client-s3";

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
