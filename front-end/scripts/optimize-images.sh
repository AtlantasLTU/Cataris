#!/usr/bin/env bash
# Re-encode oversized PNG art as WebP at the width it is actually displayed at.
# Usage: scripts/optimize-images.sh <max-width> <file.png>...
set -euo pipefail

width=${1:?usage: optimize-images.sh <max-width> <file.png>...}
shift

total_before=0 total_after=0
for src in "$@"; do
  dst="${src%.png}.webp"
  before=$(stat -c%s "$src")
  magick "$src" -resize "${width}x>" -strip -quality 88 -define webp:method=6 "$dst"
  after=$(stat -c%s "$dst")
  total_before=$((total_before + before)) total_after=$((total_after + after))
  printf '%-40s %7d KB -> %6d KB\n' "$(basename "$src")" $((before / 1024)) $((after / 1024))
  rm "$src"
done

printf '\ntotal: %d KB -> %d KB (%dx smaller)\n' \
  $((total_before / 1024)) $((total_after / 1024)) $((total_before / total_after))
