# Release

This document describes how to cut an AESR release. Releases are driven by GitHub Actions on tag push; the only manual step is bumping the version and creating the tag.

## How to release

Bump the version in `manifest.json`, `package.json`, and `package-lock.json` to the new `X.Y.Z`, commit, then tag and push to the fork:

```
git tag -a vX.Y.Z -m "release vX.Y.Z"
git push fork main && git push fork vX.Y.Z
```

The `Release` workflow triggers on the tag push and runs build → unit tests → emulator tests → archive → archive:source → GitHub Release → conditional per-store publish. When the workflow completes, the GitHub Release appears under the repo's Releases page with all four zip artifacts attached.

## Tag conventions

- `vX.Y.Z` — production release. Creates a GitHub Release and runs each store-publish job whose secrets and variables are configured.
- `vX.Y.Z-rc.N`, `vX.Y.Z-beta.N`, `vX.Y.Z-alpha.N` — prerelease. Creates a GitHub Release flagged as prerelease and skips every store-publish job. Use these to dry-run the full pipeline before a real release.

A prerelease tag is any tag whose version part contains a hyphen.

## Secrets and variables

Each store-publish job is gated on a public repo variable (the store-side ID) and a corresponding repo secret (the credentials blob). Both must be set for that store's job to run. Set them under `Settings → Secrets and variables → Actions`.

| Store   | Repo variable               | Repo secret                  | Where to obtain                                                                                                                              |
| ------- | --------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Chrome  | `` `CHROME_EXTENSION_ID` + `CHROME_PUBLISHER_ID` `` | `secrets.CHROME_PUBLISH_KEYS`  | Variables: `CHROME_EXTENSION_ID` is the "Item id" (Developer Dashboard → the extension's edit page, or from the URL); `CHROME_PUBLISHER_ID` is your publisher id (Developer Dashboard → account), required by the Web Store API **v2**. The job still gates on `CHROME_EXTENSION_ID`. Secret: JSON blob `{ "clientId": "...", "clientSecret": "...", "refreshToken": "..." }` — create an OAuth2 client with Chrome Web Store API access in Google Cloud Console; full flow at https://developer.chrome.com/docs/webstore/using-api/. |
| Firefox | `vars.FIREFOX_EXTENSION_ID` | `` `FIREFOX_JWT_ISSUER` + `FIREFOX_JWT_SECRET` `` | Variable: the Firefox add-on id used to gate this job (matches `browser_specific_settings.gecko.id` in `manifest_firefox.json`). Secrets: `FIREFOX_JWT_ISSUER` is the AMO JWT issuer (aka "API key") and `FIREFOX_JWT_SECRET` is the AMO JWT secret — both generated at AMO Developer Hub → Manage API Keys: https://addons.mozilla.org/en-US/developers/addon/api/key/. |
| Edge    | `vars.EDGE_PRODUCT_ID`      | `secrets.EDGE_PUBLISH_KEYS`    | Variable: Microsoft Partner Center → the add-on's product page; product ID is in the URL. Secret: JSON `{ "apiKey": "...", "clientId": "..." }` for the **Edge Add-ons API v1.1** (Partner Center → Publish API; the older `clientSecret`/`accessTokenUrl` OAuth shape is obsolete). ⚠️ This path is **untested** — it has never run (no `EDGE_PRODUCT_ID`); verify on the first real release after wiring it. API ref: https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api. |

Publish jobs skip when either the var or the secret is missing — you can roll out one store at a time. The workflow includes an in-job guard that fails clearly if the variable is set but the secret is empty, so the misconfiguration is loud rather than silent.

**Publish mechanics.** Chrome publishes via a self-contained `curl` step against the **current Chrome Web Store API v2** (`chromewebstore.googleapis.com`; refresh-token → upload → publish) — no third-party publish action, and credentials stay as ephemeral shell locals. v2 requires your **publisher id** in the request path, so `vars.CHROME_PUBLISHER_ID` (Developer Dashboard → account) must be set in addition to `CHROME_EXTENSION_ID`. Edge publishes via the maintained `wdzeng/edge-addon` action (Edge Add-ons API v1.1). The previously-used `PlasmoHQ/bpp` action was **removed** — it is dormant (last release Feb 2025) and stuck on the deprecated Node 20 action runtime. Firefox is unchanged (`web-ext`, see below).

**Firefox distribution model (UNLISTED self-distribution).** Unlike Chrome and Edge, Firefox is **not** published to the public AMO listing. Each tagged release signs the add-on with Mozilla `web-ext` (`web-ext sign --channel=unlisted`) and attaches the resulting signed `.xpi` to the GitHub Release — users install that `.xpi` directly. The **first** unlisted version must be submitted manually once at the AMO Developer Hub (choose "On your own" / self-distribution); every release thereafter must bump the version, because AMO rejects a duplicate version number.

## What still must be manual

- Initial store-developer registration: Chrome Web Store ($5 one-time fee), Firefox AMO (free), Edge Add-ons via Microsoft Partner Center (free).
- First-time submission of the extension to each store. The publish API updates existing listings; it does not create new ones.
- Editing the store listing copy (description, screenshots, category, support URLs). Screenshots could in theory be auto-uploaded but listing copy edits go through each store's dashboard.
- Privacy policy hosting and DSA trader-info attestation.
- Responding to store reviewer feedback or rejections.
- Bumping `manifest.json` + `package.json` + `package-lock.json` and creating the git tag — kept manual on purpose (see "How to release").

## Rollback

**Tag pushed but the build failed before the GitHub Release was created.** Fix the issue on `main`, then either re-tag with a fresh version (`git tag -d vX.Y.Z && git push fork :refs/tags/vX.Y.Z` to delete the bad tag remotely, then re-tag the fixed commit and push), or re-run via `workflow_dispatch` with the same tag once main is fixed.

**GitHub Release published but you don't want to publish to stores yet.** Stores only publish on non-prerelease tags. If you tagged `vX.Y.Z` instead of `vX.Y.Z-rc.1` by mistake, the publish jobs may have already started — cancel the workflow run from the Actions UI immediately. If a Chrome/Firefox/Edge publish API call has already completed, the store dashboard is the only rollback path — no publish-API rollback exists. Use the store's "unpublish" or "revert to previous version" UI.

**Stuck or expired release-zips artifact.** Workflow artifacts retain for 30 days. Re-run the build via `workflow_dispatch` against the same tag to regenerate.

## Workflow file

See `.github/workflows/release.yml`.
