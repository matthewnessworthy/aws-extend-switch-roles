<!-- GSD:project-start source:PROJECT.md -->
## Project

**AWS Extend Switch Roles**

A browser extension (Chrome MV3, Firefox MV2, Edge) that extends AWS IAM role switching beyond the console's built-in 5-role history. Users configure a list of switchable roles in INI format (mirroring `~/.aws/config`) and switch via a popup menu. **This milestone modernizes the look and feel** — a visual and interaction redesign of every UI surface, aligned to AWS's current console (Cloudscape) design language, with light/dark theming — without changing any underlying behavior.

**Core Value:** A modern, AWS-console-native extension UI with **zero regression** on any must-keep capability.

### Constraints

- **Tech stack**: Stay vanilla — hand-written CSS + minimal JS, **zero new runtime dependencies**. Preserves minimal footprint, simpler store review, and the low-permission ethos stated in the README.
- **No design-framework packages**: Emulate the Cloudscape design *language* by hand; do **not** import `@cloudscape-design/*` (including the CSS-only `design-tokens`).
- **Backward compatibility**: No regression in role-switch flow, saved configs, popup keyboard nav, or per-profile color/image. Existing stored data must keep working without reconfiguration.
- **MV3 / CSP**: Hand-written CSS must comply with extension CSP — keep styles in bundled/static CSS files; no policy-violating inline-style injection.
- **Cross-browser**: Must render correctly on Chrome (MV3), Firefox (MV2), and Edge.
- **Accessibility**: New/changed UI meets WCAG 2.1 AA contrast, provides visible focus indicators, and preserves keyboard operability.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ES Modules) - All extension source code (`src/js/**/*.js`)
- TypeScript - Playwright test config only (`playwright.config.ts`)
- Bash - Build and archive scripts (`bin/build.sh`, `bin/archive.sh`, `bin/build_test.sh`)
## Runtime
- Browser extension runtime (Chrome MV3 / Firefox MV2 background scripts)
- Node.js 24 (CI target; local dev constraint: `^20.19.0 || ^22.12.0 || >=24.0.0`)
- npm
- Lockfile: `package-lock.json` present
## Frameworks
- None — vanilla JS browser extension, no UI framework
- Mocha 11.7.5 — unit test runner (`src/js/**/*.test.js`)
- Chai 6.2.2 — assertion library
- Playwright 1.58.2 — browser emulator / integration tests (`test/emulator/*.spec.js`)
- jsdom 28.1.0 — DOM simulation for unit tests
- Rollup 4.59.0 — JS bundler (bundles ESM source into browser-consumable files)
- `@rollup/plugin-node-resolve` 16.0.3 — resolves `node_modules` imports during bundle
## Key Dependencies
- `aesr-config` 0.6.0 — AWS config INI parser (`src/js/lib/profile_db.js`, `src/js/options.js`); provides `ConfigParser`
- `lz-string` (vendored as `src/js/lib/lz-string.min.js`) — LZ-based string compression for compacting config stored in `chrome.storage.sync`
- `diff` pinned to `^8.0.3`
- `serialize-javascript` pinned to `^7.0.4`
## Configuration
- `manifest.json` — shared manifest fields (MV3)
- `manifest_chrome.json` — Chrome-specific overrides (service worker, min Chrome 89, optional `tabGroups`)
- `manifest_firefox.json` — Firefox-specific overrides (gecko ID, min Firefox 109, background scripts array)
- `bin/setup_manifest.mjs` — merges shared + browser-specific manifests into `dist/`
- `rollup.config.js` — minimal config, only enables `node-resolve` plugin
- `bin/build.sh` — orchestrates Rollup per entry point, copies assets to `dist/chrome/` and `dist/firefox/`
- Extension `chrome.storage.sync` (cross-device, 8 × 2700-char LZ-compressed chunks)
- Extension `chrome.storage.local` (per-device, 1 × 10MB LZ-compressed chunk)
- Extension `chrome.storage.session` (in-memory OAuth state; falls back to local if unavailable)
- IndexedDB (`profiles` object store, `profilePath` keyPath) — role profile cache (`src/js/lib/db.js`)
## Platform Requirements
- Node.js >=20.19.0 (Node 24 used in CI)
- npm (lockfile committed)
- Playwright browser binaries (Chrome, Firefox, Edge) for emulator tests
- `xvfb-run` on Linux for headless browser tests (CI uses Ubuntu)
- Chrome >=89 (Manifest V3 service worker)
- Firefox >=109 (background scripts, no service worker)
- Microsoft Edge (Chromium-based; treated same as Chrome)
- No server-side component; fully client-side browser extension
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Source modules: `snake_case.js` (e.g., `storage_repository.js`, `create_role_list_item.js`, `data_profiles_splitter.js`)
- Test files co-located with source use same stem: `current_context.test.js` alongside `current_context.js`
- Handlers subdirectory uses `snake_case.js` (e.g., `update_profiles.js`, `remote_connect.js`)
- Remote subdirectory uses `kebab-case.js` (e.g., `oauth-client.js`, `code-util.js`) — inconsistent with rest of codebase
- PascalCase always: `StorageRepository`, `DBManager`, `CurrentContext`, `CompressedTextSplitter`, `OAuthClient`, `ColorPicker`
- camelCase for exported functions: `findTargetProfiles`, `writeProfileItemsToTable`, `updateProfilesTable`, `externalConfigReceived`
- camelCase for private/local functions: `matchSourceProfile`, `convertComplexTarget`, `brushAccountId`, `adjustDisplayNameColor`
- Event handler local variables use `function` keyword (not arrow functions) for `onclick` assignments
- camelCase throughout: `configStorageArea`, `profilesLastUpdated`, `syncStorageRepo`, `sessionMemory`
- Constants that are module-level singletons: `const brw = chrome || browser` — lowercase, abbreviated
- `snake_case` for data properties: `aws_account_id`, `role_name`, `source_profile`, `aws_account_alias`, `target_region`
## Code Style
- No Prettier or ESLint config detected — no enforced formatter
- Tabs for indentation (observed in `db.js`, `rollup.config.js`)
- 2-space indentation also present (mixed in some files like `options.js`, `popup.js`)
- Single quotes preferred for string literals; backtick template literals used for error messages and formatted strings
- Semicolons inconsistently applied: `background.js` omits them, `options.js` includes them — no enforced rule
- No ESLint or Biome config present — code is not linted automatically
- `package.json` has no lint script
## Import Organization
- `.js` extension required on all relative imports (ES modules, `"type": "module"` in `package.json`)
- Inconsistency: `src/js/lib/target_profiles.js` imports `'./config_ini'` without `.js` — this is a bug
- Single quotes dominant in `background.js` and `lib/` files
- Double quotes appear in `options.js` line 6 (`"./lib/profile_db.js"`) — inconsistent
## Error Handling
- Fire-and-forget async calls use `.catch(err => { console.error(err) })` — prevents unhandled rejection but swallows errors silently in most cases
- Internal functions throw `Error` with descriptive messages: `throw new Error('Invalid action')`, `throw new Error('Invalid dataType')`
- Callers that need to surface errors to UI use `.catch(err => updateMessage(..., err.message, 'warn'))`
- `try { } catch (_) {}` used to swallow IndexedDB unavailability in `target_profiles.js` line 13 — intentional fallback, documented with comment
- `try {} catch {}` used in `content.js` line 37 for `adjustPrismDisplayNameColor` — no comment, fully silent
- IndexedDB wrapped manually in `new Promise((resolve, reject) => {...})` inside `db.js`
- `chrome.storage` API wrapped in Promise in `StorageRepository` — consistent pattern
- No use of `async/await` inside Promise constructors (correct)
## Logging
- `console.error(err)` for caught errors in background/popup event listeners
- `console.error(\`Error: ${err}\`)` template form in popup helper functions
- `console.warn(...)` for non-fatal degraded states (e.g., Config Hub fetch failure)
- `console.log(...)` for informational lifecycle events (e.g., profile reload, last role saved)
- `console.info(...)` used once for tab logout event (`background.js` line 79)
- Commented-out `console.log` present in `src/js/lib/content.js` line 21 — leftover debug statement
## Comments
- Comments explain non-obvious browser compatibility issues (Firefox container tabs fallback in `target_profiles.js`)
- Comments explain business logic decisions (why `target_region` is not applied when `region` is specified — in test file inline comments)
- Semicolons at start of line (`; comment`) used in INI config examples within test data
- No JSDoc/TSDoc annotations anywhere in the codebase
- Inline comments use `//` for single-line explanations
- Block `/* */` not observed
## Function Design
- Destructured object parameters for context objects: `function({ page, expect })`, `const { baseAccount, loginRole, filterByTargetRole } = ctx`
- Options objects passed as last parameter: `createRoleListItem(document, item, url, region, { hidesAccountId }, selectHandler)`
- Async functions return resolved values or throw — no sentinel return values like `null` for errors (errors propagate)
- `matchSourceProfile` returns boolean inline — no early return refactoring needed
## Module Design
- Named exports used exclusively — no default exports in library files
- Entry point scripts (`background.js`, `popup.js`, `options.js`, `content.js`) export nothing — they are browser script entry points
- None — each module is imported directly by path
- All source is native ESM (`"type": "module"` in `package.json`)
- Rollup bundles for browser distribution (no module syntax in built output)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| background.js | Service worker: startup, install events, inter-tab messaging, tab groups | `src/js/background.js` |
| popup.js | Extension popup UI: role list, filter, keyboard nav, role switching dispatch | `src/js/popup.js` |
| options.js | Options page: config editing, storage area selection, remote hub connect/disconnect | `src/js/options.js` |
| content.js | Content script injected into AWS console pages: extracts account info, submits role switch form | `src/js/content.js` |
| attach_target.js (WAR) | Web-accessible resource injected into page context: reads AWS console DOM globals (ConsoleNavService, AWSC) inaccessible from isolated extension context | `src/js/war/attach_target.js` |
| prism_switch_dest.js (WAR) | Web-accessible resource: performs Prism (IAM Identity Center) API call for switch, returns redirect URL | `src/js/war/prism_switch_dest.js` |
| target_profiles.js | Profile lookup: queries IndexedDB first, falls back to LZText storage | `src/js/lib/target_profiles.js` |
| profile_db.js | IndexedDB write operations: write profile sets and items, refresh DB from config | `src/js/lib/profile_db.js` |
| db.js | IndexedDB abstraction: DBManager and DBTable classes wrapping IDB API | `src/js/lib/db.js` |
| storage_repository.js | Browser storage abstraction: SyncStorageRepository, LocalStorageRepository, SessionMemory, StorageProvider | `src/js/lib/storage_repository.js` |
| config_ini.js | Config text persistence: load/save through CompressedTextSplitter | `src/js/lib/config_ini.js` |
| compressed_text_splitter.js | LZ-string compress/decompress config text; splits across multiple storage keys to respect sync quotas | `src/js/lib/compressed_text_splitter.js` |
| current_context.js | Derives baseAccount and loginRole from AWS console user info for profile matching | `src/js/lib/current_context.js` |
| create_role_list_item.js | Creates DOM `<li>` elements for the popup role list | `src/js/lib/create_role_list_item.js` |
| set_icon.js | Sets the extension action icon via browser API | `src/js/lib/set_icon.js` |
| handlers/external.js | Handles external extension messages (`updateConfig` action) | `src/js/handlers/external.js` |
| handlers/update_profiles.js | Startup migration and sync logic: migrates old storage format → IndexedDB, syncs config across storage areas | `src/js/handlers/update_profiles.js` |
| handlers/remote_connect.js | OAuth2 PKCE flow initiation and callback handling for AESR Config Hub | `src/js/handlers/remote_connect.js` |
| remote/oauth-client.js | OAuthClient class: PKCE, token exchange, refresh, user config API call | `src/js/remote/oauth-client.js` |
| lib/reload-config.js | Refreshes profiles from Config Hub using stored refresh token | `src/js/lib/reload-config.js` |
## Pattern Overview
- No shared module singleton state between extension contexts — each context instantiates its own `StorageProvider`/`SessionMemory`
- Content script communicates with popup via `chrome.tabs.sendMessage` (not direct import)
- WAR scripts bridge the content script's isolated context to the AWS page's JS globals (`ConsoleNavService`, `AWSC`)
- Profile data has two parallel storage paths: IndexedDB (primary) and LZText-compressed browser storage (fallback/legacy)
- ESM modules bundled by Rollup per entry point; content script and WAR scripts are copied unbundled
## Layers
- Purpose: Renders popup and options pages, handles user interaction
- Location: `src/js/popup.js`, `src/js/options.js`
- Contains: DOM manipulation, event handlers, UI state
- Depends on: lib layer, handlers layer
- Used by: Browser (directly loaded via manifest HTML pages)
- Purpose: Runs in AWS console page context (isolated from page JS), injects WAR scripts, handles messages from popup
- Location: `src/js/content.js`
- Contains: Message listener, form injection, WAR script injection
- Depends on: WAR scripts (indirectly via script injection)
- Used by: Browser (injected by manifest content_scripts declaration)
- Purpose: Runs in the AWS page's own JS context to access console globals not available to the isolated content script
- Location: `src/js/war/attach_target.js`, `src/js/war/prism_switch_dest.js`
- Contains: Direct DOM reads of AWS global objects, fetch calls to AWS switch APIs
- Depends on: AWS console globals (`ConsoleNavService`, `AWSC`)
- Used by: content.js (injected via dynamic `<script>` tags)
- Purpose: Orchestrates multi-step business operations
- Location: `src/js/handlers/`
- Contains: External message handling, profile migration/sync, remote OAuth flow
- Depends on: lib layer
- Used by: background.js, popup.js, options.js
- Purpose: Reusable utilities and data access abstractions
- Location: `src/js/lib/`
- Contains: Storage repositories, IndexedDB manager, config text I/O, profile lookup, DOM helpers
- Depends on: `aesr-config` npm package, browser APIs
- Used by: UI layer, handler layer, service worker
- Purpose: Background processing: startup, install, external messages, tab group management
- Location: `src/js/background.js`
- Contains: Event listeners for runtime lifecycle and inter-extension messages
- Depends on: lib/storage_repository, handlers/external, handlers/update_profiles, lib/set_icon
- Used by: Browser (registered as service_worker in Chrome manifest)
## Data Flow
### Role Switch (Standard IAM)
### Role Switch (Prism / IAM Identity Center)
### Config Save (Options Page)
### Remote Config Hub Flow
- Persistent settings: `chrome.storage.sync` (user preferences, config text if sync mode)
- Persistent profiles (primary): IndexedDB `aesr` database, `profiles` object store
- Persistent profiles (fallback): `chrome.storage.local` LZText-compressed config text
- Session/ephemeral state: `chrome.storage.session` (falls back to `chrome.storage.local` for Firefox): switch count, golden key flag, PKCE params, tab group keys
## Key Abstractions
- Purpose: Wraps `chrome.storage.*` API into promise-based get/set/delete; `StorageProvider` is a lazy singleton factory
- Examples: `src/js/lib/storage_repository.js`
- Pattern: Class hierarchy — base `StorageRepository`, concrete `SyncStorageRepository`, `LocalStorageRepository`, `SessionStorageRepository`; `SessionMemory` auto-falls-back from session to local
- Purpose: Wraps IndexedDB open/transaction/cursor/insert/truncate in promises
- Examples: `src/js/lib/db.js`
- Pattern: `DBManager.transaction(storeName, async fn, permission)` — passes a `DBTable` to the callback and commits on resolution
- Purpose: LZ-compresses config text and chunks it across multiple storage keys to fit within browser storage quotas (sync: 2700 chars × 8 keys; local: 10MB × 1 key)
- Examples: `src/js/lib/compressed_text_splitter.js`
- Pattern: Stateless class, constructed with storage area kind; encodes to/from `lztext`, `lztext_1`, ..., `lztext_7`
- Purpose: Enables prefix-range queries in IndexedDB without secondary indexes
- Pattern: `[SINGLE];{6-digit-num}` for standalone profiles, `[COMPLEX];{num}` for source/base profiles, `{source_profile_name};{num}` for target profiles
- Used in: `src/js/lib/profile_db.js`, `src/js/lib/target_profiles.js`
## Entry Points
- Location: `src/js/background.js`
- Triggers: `chrome.runtime.onStartup`, `chrome.runtime.onInstalled`, `chrome.runtime.onMessageExternal`, `chrome.runtime.onMessage`
- Responsibilities: Profile table initialization/migration, external config ingestion, tab group management
- Location: `src/js/popup.js`
- Triggers: Loaded when user clicks extension icon or presses Ctrl+Shift+,
- Responsibilities: Renders role list, handles role selection, initiates switch
- Location: `src/js/options.js`
- Triggers: Loaded via `chrome.runtime.openOptionsPage()` or browser settings
- Responsibilities: Config editing, storage area switching, remote hub connect/disconnect, feature flags
- Location: `src/js/content.js`
- Triggers: Injected at `document_end` on all `*.console.aws.amazon.com/*` (and gov/cn variants) pages
- Responsibilities: Message listener for `loadInfo`/`switch`, DOM injection of AESR form and WAR scripts
## Architectural Constraints
- **Threading:** Single-threaded event-loop per context (service worker, popup, options, content script all separate threads). No shared memory between them.
- **Global state:** `sessionMemory` instances created at module level in `background.js` and `popup.js`; `listeningTabGroupsRemove` boolean in `background.js` prevents duplicate tab group listeners. `StorageProvider._local` and `StorageProvider._sync` are static singletons.
- **Circular imports:** None detected.
- **WAR isolation:** `attach_target.js` and `prism_switch_dest.js` run in the page's JS context (not the extension's isolated world) and cannot import extension modules. They communicate via DOM element attributes/values.
- **Firefox compatibility:** Firefox does not support `chrome.storage.session` — `SessionMemory` falls back to `chrome.storage.local`. Firefox does not support `tabGroups` API — disabled in options UI. Firefox uses `background.scripts` (not `service_worker`).
- **Content script is not bundled:** `content.js` is copied verbatim (no Rollup), so it cannot use `import` statements. Shared logic that was once in `src/js/lib/content.js` and `src/js/lib/auto_assume_last_role.js` appears legacy (these files exist but are not referenced by the current manifest pipeline).
## Anti-Patterns
### Legacy lib/content.js and lib/auto_assume_last_role.js
### Direct `chrome.*` calls in WAR scripts
## Error Handling
- Service worker and popup use `.catch(err => console.error(err))` for async operations
- `updateProfilesTable` in handlers swallows Config Hub reload errors with `console.warn`
- `target_profiles.js` catches IndexedDB errors and falls back to LZText path silently
- `OAuthClient` throws typed `RefreshTokenError` for expired refresh tokens, caught by `reload-config.js` to invalidate stored token
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
