#!/bin/bash
#--
# source_zip.sh
#
# Produces dist/aesr-source-<version>.zip containing only the inputs
# required to reproduce the bundled extension per BUILD.md.
#
# Requires a prior `npm run build` (which writes dist/version via
# bin/setup_manifest.mjs) — same precondition as bin/archive.sh.
#--
set -euo pipefail

if [ ! -f dist/version ]; then
  echo "dist/version not found; run the build first." >&2
  exit 1
fi
version=$(cat dist/version)

zipfile="dist/aesr-source-$version.zip"
if [ -e "$zipfile" ]; then
  \rm "$zipfile"
fi

inputs=(src bin manifest.json manifest_chrome.json manifest_firefox.json package.json package-lock.json rollup.config.js BUILD.md README.md)
[ -f LICENSE ] && inputs+=(LICENSE)

zip -r "$zipfile" "${inputs[@]}" \
  -x 'dist/*' 'node_modules/*' 'test/*' '.git/*' '.github/*' '.planning/*' '.claude/*' '.idea/*' '.vscode/*' 'coverage/*' '*.zip' '*.DS_Store'

echo "archived: aesr-source-$version.zip"
