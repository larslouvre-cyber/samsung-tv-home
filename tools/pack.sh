#!/usr/bin/env bash
# Pakker app/ til en .wgt (en zip med bestemt rod-layout).
# BEMÆRK: en .wgt skal SIGNERES for at kunne installeres paa TV'et.
# Se docs/02-install.md -- signaturen kraever Tizen Studio.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist"
mkdir -p "$OUT"

# Sanity: alt koerer ES5-sikker JS? Ingen arrow functions / klasser.
if grep -rnE '=>|\bclass\s+[A-Z]|\bconst\s+[A-Za-z]|\blet\s+[A-Za-z]|\bawait\b' \
     "$ROOT/app/js" --include='*.js' | grep -v 'config.js' ; then
  echo "ADVARSEL: mulig ES6+ syntaks ovenfor -- M47 kan fejle paa det." >&2
fi

NAME="Home-$(date +%Y%m%d-%H%M).wgt"
rm -f "$OUT"/Home-*.wgt
( cd "$ROOT/app" && zip -qr "$OUT/$NAME" . -x '.*' -x '*/.*' )
echo "→ $OUT/$NAME"
echo "  usigneret -- skal igennem Tizen Studio foer install:"
echo "  tizen package -t wgt -s <cert-profil> -- $ROOT/app"
