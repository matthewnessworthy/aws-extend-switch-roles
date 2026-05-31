---
phase: 4
slug: theme-toggle-per-profile-color
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-28
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Mocha 11.7.5 + Chai 6.2.2 (unit); Playwright 1.58.2 (integration) |
| **Config file** | `package.json` scripts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test_emulator` |
| **Estimated runtime** | ~10 seconds (unit); ~60 seconds (emulator) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test_emulator`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (unit), ~60 seconds (emulator wave gate)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | THM-02 | — | applyTheme removes data-theme for 'default' | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | THM-02 | — | applyTheme unit tests: all 6 behaviors green | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-01-03 | 01 | 1 | THM-04 | — | visual_mode.spec.js created; Test 1 passes (Tests 2-4 RED pending Plan 02) | integration | `npm run test_emulator -- --grep "visual mode: light radio writes"` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 2 | THM-02/04 | — | import + installVisualModeListener wired; unit green | unit + integration | `npm test && npm run test_emulator -- --grep "visual mode: light radio writes"` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 2 | THM-02/04 | — | write-through + reconcile; all 4 visual mode specs pass | unit + integration | `npm test && npm run test_emulator -- --grep "visual mode"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `test/emulator/visual_mode.spec.js` — all four test bodies written in Plan 01 Task 3; spec file exists before any wiring
- [x] `src/js/lib/theme.test.js` — unit tests for applyTheme correctness (Plan 01 Task 2)
- [x] jsdom `document.documentElement` attribute assertions via existing test infrastructure (no extra setup needed)

*Wave 0 complete: spec and test files created in Plan 01 before wiring plans execute.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Popup live-updates when options page toggles theme | THM-04 | Requires two live extension pages open simultaneously | Open popup + options; toggle Visual Mode; verify popup updates without reload |
| Per-profile color renders acceptably in dark theme | THM-04 (SC #4) | Visual AA check (full verify in Phase 5) | Switch to dark; inspect role cards with colored profiles |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s (unit); emulator gate at wave boundary
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
