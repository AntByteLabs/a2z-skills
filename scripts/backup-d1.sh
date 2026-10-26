#!/usr/bin/env bash
# Export the live D1 database to a timestamped SQL file.
#
# D1 has Time Travel, which restores any point in the last 30 days without
# this. That covers a bad migration. It does not cover losing the Cloudflare
# account, so the subscriber list, which is the one thing here that cannot be
# rebuilt from the repo, also gets an export you hold yourself.
#
# Usage: npm run backup
set -euo pipefail

DIR="${A2Z_BACKUP_DIR:-$HOME/a2z-skills-backups}"
STAMP="$(date -u +%Y-%m-%dT%H%M%SZ)"
OUT="$DIR/a2z-skills-$STAMP.sql"

mkdir -p "$DIR"
npx wrangler d1 export a2z-skills --remote --output "$OUT"

if [ ! -s "$OUT" ]; then
  echo "Export produced an empty file. Nothing was written." >&2
  rm -f "$OUT"
  exit 1
fi

SUBS=$(grep -c "INSERT INTO subscribers" "$OUT" || true)
echo "Wrote $OUT"
echo "  $(wc -c <"$OUT" | tr -d ' ') bytes, $SUBS subscriber insert statement(s)"

# Keep the last 14. An unbounded backup directory is its own problem.
ls -1t "$DIR"/a2z-skills-*.sql 2>/dev/null | tail -n +15 | while read -r old; do
  rm -f "$old"
done
