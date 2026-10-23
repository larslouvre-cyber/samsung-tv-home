#!/usr/bin/env bash
# Lokal udvikling. Aabn http://localhost:8099 i Chrome/Safari.
# Brug piletaster + Enter -- det er praecis samme kode som paa TV'et.
set -euo pipefail
cd "$(dirname "$0")/../app"
PORT="${PORT:-8099}"
echo "→ http://localhost:$PORT"
echo "  piletaster = naviger, Enter = vaelg, Esc = tilbage"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
