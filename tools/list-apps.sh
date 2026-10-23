#!/usr/bin/env bash
# Viser de apps der FAKTISK er installeret paa TV'et, med deres
# rigtige app-ID'er. Brug dem i app/js/config.js -- gaet ikke.
#
# Forudsaetning: developer mode slaaet til + din Mac's IP angivet
# i TV'ets "Developer mode host PC IP", og:
#   ~/tizen-studio/tools/sdb connect <TV-IP>:26101
set -euo pipefail
SDB="${SDB:-$HOME/tizen-studio/tools/sdb}"

if ! [ -x "$SDB" ]; then
  echo "sdb ikke fundet ($SDB). Saet SDB=/sti/til/sdb" >&2
  exit 1
fi

"$SDB" devices

echo
echo "app_id                              title"
echo "----------------------------------- ------------------------------"
"$SDB" shell 0 vd_applist \
  | tr -d '\r' \
  | awk '/^app_id/{id=$3} /^app_title/{$1=""; sub(/^ +/,""); printf "%-35s %s\n", id, $0}'
