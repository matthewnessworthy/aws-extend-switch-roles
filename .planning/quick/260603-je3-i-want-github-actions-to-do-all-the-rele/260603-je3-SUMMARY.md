---
phase: quick-260603-je3
plan: 01
subsystem: ci
tags: [ci, release, github-actions, packaging, store-publish]
dependency_graph:
  requires: []
  provides:
    - tag-driven-release-pipeline
    - reproducible-source-zip
    - per-store-conditional-publish
    - release-operator-runbook
  affects:
    - .github/workflows/
    - bin/
    - root-docs
tech_stack:
  added: []
  patterns:
    - tag-trigger workflow with workflow_dispatch fallback
    - dual-gate publish (repo var + repo secret) with in-job guard for asymmetric config
    - prerelease detection via hyphen presence in version
    - shared Playwright browser cache key with test.yml
    - chrome→edge zip copy as explicit-named artifact for self-documenting release inventory
key_files:
  created:
    - bin/source_zip.sh
    - .github/workflows/release.yml
    - RELEASE.md
  modified:
    - package.json
decisions:
  - "archive:source mirrors archive's shape (`npm run build; ./bin/script`) so local invocation doesn't require a pre-step"
  - "Source-zip uses dynamic input list + `-x` exclusion globs so future input additions cannot bypass exclusions"
  - "Edge consumes the Chrome MV3 zip copied as `aesr-edge-<v>.zip` rather than a separate build target — explicit name documents the release inventory and gives the edge publish job a stable filename"
  - "Publish jobs gated on `vars.*_ID` (public) for cheap visibility, plus an in-job secret-presence guard that fails loudly on asymmetric configuration (var set but secret missing)"
  - "Workflow-level concurrency uses `cancel-in-progress: false` so a fresh tag does not abort an in-flight publish"
  - "Tag-vs-package.json version guard step prevents accidental releases from unbumped commits; uses tag base (strip `-rc.N` suffix) for the comparison so prerelease tags work"
  - "Prerelease detection: hyphen in version part (covers `-rc.N`, `-beta.N`, `-alpha.N`, and any future suffix scheme)"
metrics:
  duration_minutes: "~25"
  completed: "2026-06-03"
  tasks_completed: 3
  files_touched: 4
---

# Quick Task 260603-je3: CI Release Pipeline — Summary

Automated AESR release end-to-end via GitHub Actions. Pushing a `v*.*.*` tag (or `-rc.N` / `-beta.N` / `-alpha.N` prerelease tag) to the fork now drives build → unit tests → emulator tests → archive → source-archive → GitHub Release → conditional per-store publish (Chrome / Firefox / Edge).

## Per-task results

### Task 1 — Reproducible source-zip script + npm wiring (commit 06306f6)

- New `bin/source_zip.sh` (executable). Reads `dist/version` (same precondition as `bin/archive.sh`), removes any prior zip, then runs `zip -r dist/aesr-source-$version.zip src bin manifest.json manifest_chrome.json manifest_firefox.json package.json package-lock.json rollup.config.js BUILD.md README.md [LICENSE] -x 'dist/*' 'node_modules/*' 'test/*' '.git/*' '.github/*' '.planning/*' '.claude/*' '.idea/*' '.vscode/*' 'coverage/*' '*.zip' '*.DS_Store'`. Inputs are built dynamically (`[ -f LICENSE ] && inputs+=(LICENSE)`); exclusions are passed to `-x` so future additions to the input list still respect them. Header comment documents the build precondition.
- `package.json` gained `"archive:source": "npm run build; ./bin/source_zip.sh"`. Matches the existing `archive` script's single-line semicolon shape (no formatting drift). `archive` and `archive:dev` are unchanged.

Verification: `npm run archive:source` produced `dist/aesr-source-6-3-0.zip` containing `rollup.config.js` and `package-lock.json` and excluding `node_modules/`, `.planning/`, and `test/`. All four plan-required containment / absence checks pass.

### Task 2 — Tag-triggered release workflow (commit a94bc41)

`.github/workflows/release.yml` created. Structure:

- **Triggers:** `push.tags: ['v*.*.*', 'v*-rc*', 'v*-beta.*', 'v*-alpha.*']` + `workflow_dispatch` with optional `tag` input.
- **Workflow-level:** `permissions: contents: write` (required for Release creation); `concurrency: release-${{ github.ref }}` with `cancel-in-progress: false`.
- **`build-and-release` job (ubuntu-latest):**
  1. Compute step derives `tag`, `version` (strip `v`), and `prerelease` (true iff version contains a hyphen) into job outputs.
  2. `actions/checkout@v4` with `ref: ${{ steps.compute.outputs.tag }}` so `workflow_dispatch` with a tag input checks that tag.
  3. `actions/setup-node@v6` (Node 24, `cache: npm`).
  4. `npm ci`.
  5. Playwright browser cache — same key as `test.yml` (`${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}`) for cache-share.
  6. `npx playwright install --with-deps` gated on cache miss.
  7. `npm test` (mocha unit tests).
  8. `xvfb-run npm run test_emulator` (Playwright emulator tests).
  9. Tag-vs-package.json version guard — compares `node -p "require('./package.json').version"` against `${tag#v%%-*}` (strips both the leading `v` and any prerelease suffix); fails with a clear error on mismatch.
  10. `npm run archive` (Chrome + Firefox store zips).
  11. `npm run archive:source` (source zip).
  12. Stage step copies zips into `release-artifacts/` and creates `aesr-edge-<v>.zip` as a copy of the Chrome MV3 zip.
  13. `actions/upload-artifact@v4` uploads all four zips as `release-zips-${{ tag }}` (30-day retention, `if-no-files-found: error`).
  14. `softprops/action-gh-release@v2` creates/updates the GH Release; `prerelease: ${{ steps.compute.outputs.prerelease == 'true' }}`; `generate_release_notes: true`; `files:` is an explicit four-line list (not a glob) so the Chrome MV3 zip is never attached twice.
- **`publish-chrome` / `publish-firefox` / `publish-edge` jobs:** Each `needs: build-and-release`; gated on `needs.build-and-release.outputs.prerelease != 'true' && vars.<STORE>_ID != ''`. Each job has a first step that fails loudly if the corresponding `*_PUBLISH_KEYS` secret is empty (catches the asymmetric "var set, secret missing" misconfig). Each downloads the artifact and runs `PlasmoHQ/bpp@v3` with only the relevant store key populated:
  - **Chrome:** `keys: { "chrome": <CHROME_PUBLISH_KEYS> }`, `chrome-file: …/aesr-chrome-<v>.zip`.
  - **Firefox:** `keys: { "firefox": <FIREFOX_PUBLISH_KEYS> }`, `firefox-file: …/aesr-firefox-<v>.zip`, plus `firefox-source-file: …/aesr-source-<v>.zip` (AMO requires source for bundled extensions; this project does Rollup bundling).
  - **Edge:** `keys: { "edge": <EDGE_PUBLISH_KEYS> }`, `edge-file: …/aesr-edge-<v>.zip`.

All third-party actions pinned to a major-version tag (`@v4`, `@v6`, `@v2`, `@v3`) to match the style used by `.github/workflows/test.yml`.

Verification: the plan's exact node+js-yaml structural check passed (`release.yml structure OK (yaml-parsed)`). All four jobs present; `permissions.contents == write`; all three publish jobs gate on `prerelease`. test.yml has no commits from this task.

### Task 3 — RELEASE.md operator runbook (commit bc6fc90)

`RELEASE.md` created at repo root with the six required sections in plan order: **How to release** (bump → tag → push fork), **Tag conventions** (`vX.Y.Z` vs `-rc.N` / `-beta.N` / `-alpha.N`; prerelease defined as any version part with a hyphen), **Secrets and variables** (three-row table with store / var / secret / where-to-obtain; per-vendor doc links for Chrome Web Store API, AMO API keys, and Microsoft Partner Center API), **What still must be manual** (registration, first-time submission, listing copy, privacy policy, reviewer responses, version bumps), **Rollback** (build failed before release; release published but stores triggered by mistake; artifact stuck or expired), **Workflow file** (pointer to `.github/workflows/release.yml`). Tone matches `BUILD.md` — terse, operationally focused, no marketing voice, no emoji.

Verification: every plan-required grep pattern matched.

## Deviations from plan

None — plan executed exactly as written.

The plan's automated verifier in Task 2 prefers `node -e "...require('js-yaml')..."` over a `js-yaml-cli` fallback. `js-yaml` was transitively available in the project's `node_modules/` (via Playwright's dep tree) so the primary verifier path ran cleanly and the `npx --yes` fallback was not invoked.

## Known stubs

None — every artifact is wired end-to-end. The store-publish jobs are functionally complete; they will simply skip themselves until the operator configures the corresponding `vars.*_ID` + `secrets.*_PUBLISH_KEYS` pairs documented in `RELEASE.md`. That's by-design opt-in, not a stub.

## Operator next steps

1. Push the three new commits to the fork: `git push fork main`.
2. Optional dry-run: tag a prerelease (`git tag -a v6.3.0-rc.0 -m 'pipeline dry-run' && git push fork v6.3.0-rc.0`) to confirm the workflow runs, the GH Release is created as prerelease, and all four zips attach — without triggering any store publish.
3. When the three store-publish API credentials are obtained, set the `vars.*_ID` + `secrets.*_PUBLISH_KEYS` pairs per `RELEASE.md`. Stores can be enabled one at a time.
4. For the real v6.3.0 cut, push the existing `v6.3.0` tag to the fork to trigger the full release.

## Self-Check: PASSED

Created files exist:
- `FOUND: bin/source_zip.sh`
- `FOUND: .github/workflows/release.yml`
- `FOUND: RELEASE.md`

Modified file diffs present:
- `FOUND: package.json` (added `archive:source` script)

Commits present in `git log`:
- `FOUND: 06306f6` (Task 1)
- `FOUND: a94bc41` (Task 2)
- `FOUND: bc6fc90` (Task 3)

Built artifacts present:
- `FOUND: dist/chrome/aesr-chrome-6-3-0.zip`
- `FOUND: dist/firefox/aesr-firefox-6-3-0.zip`
- `FOUND: dist/aesr-source-6-3-0.zip`

Plan-level constraints respected:
- `.github/workflows/test.yml` unchanged (no commits from this task).
- Root `aesr-source.zip` (Phase-5 leftover) left untouched — task 1 produces versioned `dist/aesr-source-<v>.zip`, not the root one.
