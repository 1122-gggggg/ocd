# Backup — Neon → R2

`neon-to-r2.sh` dumps Neon Postgres via `DIRECT_URL` (direct, not pooled) and uploads a gzipped dump to Cloudflare R2 (S3-compatible) using `--endpoint-url`.

## Manual run

```bash
DIRECT_URL=postgresql://user:pass@ep-xxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require \
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
R2_ACCESS_KEY_ID=xxx \
R2_SECRET_ACCESS_KEY=xxx \
R2_BUCKET=ocd-proofs \
./scripts/backup/neon-to-r2.sh
# → s3://ocd-proofs/backups/neon-YYYYMMDD.sql.gz
```

Equivalent one-liner with env already exported:

```bash
./scripts/backup/neon-to-r2.sh
```

Requirements: `pg_dump` (PostgreSQL client), `gzip`, `aws` (AWS CLI v2). Dump command:

```bash
pg_dump "$DIRECT_URL" --no-owner | gzip | aws s3 cp - "s3://$R2_BUCKET/backups/neon-$(date +%Y%m%d).sql.gz" --endpoint-url "https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com"
```

The script exports `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` from `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` and sets `AWS_DEFAULT_REGION=auto` for the CLI.

> Must use `DIRECT_URL` (Neon Direct, no `-pooler`, no `pgbouncer=true`). Pooled URLs fail with `prepared statement` errors under `pg_dump`.

## Vercel cron (optional)

`vercel.json` registers a daily cron:

```json
{ "crons": [{ "path": "/api/cron/backup", "schedule": "0 3 * * *" }] }
```

`GET /api/cron/backup` is a stub wired to this flow (trigger at 03:00 UTC daily). On Vercel Hobby the cron invokes the route; the route can shell out or replicate the `pg_dump | gzip | aws s3 cp` pipeline server-side. For now the cron entry ensures the schedule is provisioned — implement the handler when automated server-side dumps are needed. Until then run `neon-to-r2.sh` manually or from CI (GitHub Actions `schedule: cron: '0 3 * * *'`).

## Restore check

```bash
aws s3 cp "s3://$R2_BUCKET/backups/neon-YYYYMMDD.sql.gz" --endpoint-url "https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com" - | gunzip | psql "$DIRECT_URL" --dry-run  # verify header
# or full restore to a branch:
# gunzip -c neon-YYYYMMDD.sql.gz | psql "$DIRECT_URL_BRANCH"
```
