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
# Optional env:
#   BACKUP_DATE           Override date stamp (YYYYMMDD) for testing
#   BACKUP_RETENTION_DAYS Retention window in days (default: 14)
#
# Usage:
#   DIRECT_URL=postgresql://... R2_ACCOUNT_ID=xxx R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx R2_BUCKET=ocd-proofs ./scripts/backup/neon-to-r2.sh
#   # or with env already exported:
#   ./scripts/backup/neon-to-r2.sh
#
# Cron: vercel.json triggers GET /api/cron/backup daily 03:00; this script is for manual / CI cron.

:: "${DIRECT_URL:?DIRECT_URL is required — use Neon Direct URL (not pooled -pooler URL)}"
:: "${R2_ACCOUNT_ID:?R2_ACCOUNT_ID is required}"
:: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
:: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
:: "${R2_BUCKET:?R2_BUCKET is required}"

if [[ "$DIRECT_URL" == *"pooler"* ]] || [[ "$DIRECT_URL" == *"pgbouncer=true"* ]]; then
  echo "ERROR: DIRECT_URL looks like a pooled URL (contains pooler/pgbouncer). Use Neon's Direct connection string." >&2
  exit 1
fi

for cmd in pg_dump gzip aws sha256sum date; do
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
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
KEY="backups/neon-${DATE}.sql.gz"
DEST="s3://${R2_BUCKET}/${KEY}"
SHA_DEST="${DEST}.sha256"

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
# R2 is region auto; aws cli still requires a region value
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-auto}"

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT
TMPFILE="$TMPDIR/neon-${DATE}.sql.gz"
SHA_FILE="$TMPDIR/neon-${DATE}.sql.gz.sha256"

echo "→ pg_dump --no-owner (DIRECT_URL) | gzip > tmpfile"
pg_dump "$DIRECT_URL" --no-owner | gzip > "$TMPFILE"

HASH="$(sha256sum "$TMPFILE" | awk '{print $1}')"
echo "${HASH}  neon-${DATE}.sql.gz" > "$SHA_FILE"

echo "→ aws s3 cp tmpfile ${DEST} --endpoint-url ${ENDPOINT}"
aws s3 cp "$TMPFILE" "$DEST" --endpoint-url "$ENDPOINT"

echo "→ aws s3 cp sha256 ${SHA_DEST} --endpoint-url ${ENDPOINT}"
aws s3 cp "$SHA_FILE" "$SHA_DEST" --endpoint-url "$ENDPOINT"

echo "✓ backup uploaded: $DEST"
echo "✓ checksum uploaded: $SHA_DEST ($HASH)"

# Retention: delete R2 keys older than $RETENTION_DAYS (default 14d).
# Best-effort — a prune failure must never fail the backup itself.
CUTOFF="$(date -d "${RETENTION_DAYS} days ago" +%Y%m%d)"
echo "→ retention: pruning backups/neon-*.sql.gz older than ${RETENTION_DAYS}d (before ${CUTOFF})"
if LISTING="$(aws s3 ls "s3://${R2_BUCKET}/backups/" --endpoint-url "$ENDPOINT" 2>&1)"; then
  PRUNED=0
  while IFS= read -r line; do
    fname="$(echo "$line" | awk '{print $4}')"
    [[ -z "$fname" ]] && continue
    if [[ "$fname" =~ ^neon-([0-9]{8})\.sql\.gz$ ]]; then
      stamp="${BASH_REMATCH[1]}"
      if [[ "$stamp" < "$CUTOFF" ]]; then
        echo "  − pruning backups/${fname} (stamp ${stamp} < ${CUTOFF})"
        aws s3 rm "s3://${R2_BUCKET}/backups/${fname}" --endpoint-url "$ENDPOINT" || echo "  ! failed to remove ${fname} — continuing" >&2
        aws s3 rm "s3://${R2_BUCKET}/backups/${fname}.sha256" --endpoint-url "$ENDPOINT" || true
        PRUNED=$((PRUNED + 1))
      fi
    fi
  done <<< "$LISTING"
  echo "✓ retention done: pruned ${PRUNED} key(s)"
else
  echo "! retention listing failed — keeping all keys (backup itself succeeded)" >&2
fi
