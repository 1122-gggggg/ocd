#!/usr/bin/env bash
set -euo pipefail

# neon-to-r2.sh — dump Neon (DIRECT_URL, not pooled) → gzip → Cloudflare R2 (S3 compat)
#
# Required env:
#   DIRECT_URL            Neon direct connection string (NOT the -pooler/pgbouncer URL)
#   R2_ACCOUNT_ID         Cloudflare account ID
#   R2_ACCESS_KEY_ID      R2 S3 access key
#   R2_SECRET_ACCESS_KEY  R2 S3 secret key
#   R2_BUCKET             R2 bucket name (e.g. ocd-proofs)
#
# Usage:
#   DIRECT_URL=postgresql://... R2_ACCOUNT_ID=xxx R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx R2_BUCKET=ocd-proofs ./scripts/backup/neon-to-r2.sh
#   # or with env already exported:
#   ./scripts/backup/neon-to-r2.sh
#
# Cron: vercel.json triggers GET /api/cron/backup daily 03:00; this script is for manual / CI cron.

: "${DIRECT_URL:?DIRECT_URL is required — use Neon Direct URL (not pooled -pooler URL)}"
: "${R2_ACCOUNT_ID:?R2_ACCOUNT_ID is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
: "${R2_BUCKET:?R2_BUCKET is required}"

if [[ "$DIRECT_URL" == *"pooler"* ]] || [[ "$DIRECT_URL" == *"pgbouncer=true"* ]]; then
  echo "ERROR: DIRECT_URL looks like a pooled URL (contains pooler/pgbouncer). Use Neon's Direct connection string." >&2
  exit 1
fi

for cmd in pg_dump gzip aws; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: required command '$cmd' not found in PATH" >&2
    exit 1
  fi
done

ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
DATE="$(date +%Y%m%d)"
# Allow explicit date override for testing: BACKUP_DATE=20260101
if [[ -n "${BACKUP_DATE:-}" ]]; then
  DATE="$BACKUP_DATE"
fi
KEY="backups/neon-${DATE}.sql.gz"
DEST="s3://${R2_BUCKET}/${KEY}"

echo "→ pg_dump --no-owner (DIRECT_URL) | gzip | aws s3 cp - ${DEST} --endpoint-url ${ENDPOINT}"

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
# R2 is region auto; aws cli still requires a region value
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"

pg_dump "$DIRECT_URL" --no-owner | gzip | aws s3 cp - "$DEST" --endpoint-url "$ENDPOINT"

echo "✓ backup uploaded: $DEST"
