#!/bin/bash
#--
# build_test.sh
#--
set -euo pipefail

destdir=test/extension

cp src/*.html $destdir/
cp -r src/css $destdir/

mkdir -p $destdir/js
for file in src/js/*; do
  if [ -f "$file" ]; then
    fname="${file##*/}"
    if [ "$fname" = "theme-init.js" ]; then continue; fi   # ship verbatim, not Rollup-bundled
    rollup -c ./rollup.config.js src/js/$fname --file $destdir/js/$fname
  fi
done

rollup -c ./rollup.config.js src/js/lib/profile_db.js --file $destdir/js/lib/profile_db.js
cp src/js/theme-init.js $destdir/js/theme-init.js
cp -r test/preview $destdir/preview

mkdir -p $destdir/tests
for file in src/tests/*; do
  fname="${file##*/}"
  rollup -c ./rollup.config.js src/tests/$fname --file $destdir/tests/$fname
done
