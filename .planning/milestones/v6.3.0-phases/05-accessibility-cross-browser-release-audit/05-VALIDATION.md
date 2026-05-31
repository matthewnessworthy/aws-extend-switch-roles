---
phase: 5
slug: accessibility-cross-browser-release-audit
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-29
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Mocha 11.7.5 (unit) + Playwright 1.58.2 (emulator) |
| **Config file** | `package.json` (scripts: test, test_emulator) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test && npm run test_emulator` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run test_emulator`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | A11Y-02 | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 5-01-02 | 01 | 1 | A11Y-03 | — | N/A | unit | `npm test` | ✅ | ⬜ pending |
| 5-02-01 | 02 | 2 | A11Y-04 | — | N/A | automated | `npm test && npm run test_emulator` | ✅ | ⬜ pending |
| 5-02-02 | 02 | 2 | A11Y-01 | — | N/A | manual | Manual smoke test Chrome/Firefox/Edge | — | ⬜ pending |
| 5-03-01 | 03 | 3 | A11Y-04 | — | N/A | manual | Manual release prep checklist | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual parity Chrome/Firefox/Edge both themes | A11Y-05 | Playwright emulator is Chrome-only (fixtures.js chromium) | Load popup + options in each browser, both themes; check scrollbars, checkboxes, textarea |
| Release screenshots/tiles re-shot | A11Y-04 | Cannot automate screenshot capture for store listings | Screenshot all popup + options states in light/dark; verify 1280×800 dimensions for Chrome |
| AMO source package + build steps | A11Y-04 | Manual packaging process | Prepare source zip, write pinned build steps doc per Extension Workshop requirements |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
