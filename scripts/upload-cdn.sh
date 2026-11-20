#!/usr/bin/env bash
# CDN'e yükleme — doğru bayraklarla, tek yerde.
#
# Hız sınırı ZORUNLU, süs değil: hattın yükleme tavanı ~2,5–3 MB/s ve
# tamamı doldurulduğunda internet kullanılamaz hâle geliyor (yaşandı).
# Varsayılan 1 MB/s; `BWLIMIT=1.5M` ile değiştirilebilir.
#
# `--s3-disable-checksum` ve yüksek yeniden deneme: R2 ilk istekte
# sıklıkla `501 Not Implemented` dönüyor, ikinci denemede geçiyor.
#
# Kullanım:
#   scripts/upload-cdn.sh mushaf
#   scripts/upload-cdn.sh ses
#   scripts/upload-cdn.sh ses/husary
#   BWLIMIT=1.5M scripts/upload-cdn.sh ses
set -euo pipefail

SRC_ROOT="${SRC_ROOT:-/media/abdullah/F929-FA97/alaturka}"
BUCKET="${BUCKET:-r2:alaturkavakitler-assets}"
BWLIMIT="${BWLIMIT:-1M}"

what="${1:-}"
if [ -z "$what" ]; then
  echo "Kullanım: $0 <mushaf|ses|ses/<kari>>" >&2
  exit 1
fi

src="$SRC_ROOT/$what"
[ -d "$src" ] || { echo "Dizin yok: $src" >&2; exit 1; }

echo "→ $src"
echo "→ $BUCKET/$what   (hız sınırı $BWLIMIT)"

exec rclone copy "$src" "$BUCKET/$what" \
  --bwlimit "$BWLIMIT" \
  --transfers 2 \
  --s3-disable-checksum \
  --retries 10 \
  --low-level-retries 20 \
  --progress
