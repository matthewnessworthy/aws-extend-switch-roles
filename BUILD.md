# Reproducible Build

This document describes how to reproduce the distributed extension bundle from source.

## Build Environment

- Node.js >= 20.19.0 (CI uses Node 24)
- npm (lockfile: package-lock.json)

## Steps

Install dependencies from the committed lockfile:

```
npm ci
```

Build the extension bundles:

```
npm run build
```

Output: `dist/chrome/` and `dist/firefox/`

Produce the store zips:

```
npm run archive
```

Output: the store zips in `dist/chrome/` and `dist/firefox/` (`aesr-chrome-<version>.zip`, `aesr-firefox-<version>.zip`)
