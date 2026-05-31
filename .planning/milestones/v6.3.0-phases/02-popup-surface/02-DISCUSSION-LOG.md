# Phase 2: Popup Surface - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 2-popup-surface
**Areas discussed:** Color swatch rule, Role item anatomy, Sidebar nav panel, Empty & loading state content

---

## Color Swatch Rule

| Option | Description | Selected |
|--------|-------------|----------|
| Option E — exact hex + contrast border | Render stored hex as-is; 1px theme-aware border owns contrast. Zero color math, zero data mutation. ROADMAP lean. | ✓ |
| Option A — luminance adjust per theme | Keep hue, shift lightness via color-mix() or JS. Automatic but adds complexity, risks destroying gray/neutral profiles, requires Firefox ≥113. | |
| Option C — solid neutral fallback in dark | Ignore stored hex in dark theme, show neutral gray swatch. No color math, but loses personalization in dark mode. | |

**User's choice:** Option E — exact hex + contrast border
**Notes:** Border implementation details (semi-transparent alpha vs explicit hex per theme) deferred to planner; either approach acceptable. This rule is shared with OPT-06 (Phase 3) — not to be re-litigated there.

Follow-up on border specifics:

| Option | Description | Selected |
|--------|-------------|----------|
| Semi-transparent white / dark-gray via token | `rgba(255,255,255,0.4)` in dark, `rgba(0,0,0,0.25)` in light. Adapts automatically. | |
| Fixed hex per theme | Concrete hex per theme from WCAG-verified STACK.md. Explicit, no alpha surprises. | |
| You decide | Either works — planner chooses. | ✓ |

**Notes:** Planner picks border approach from STACK.md.

---

## Role Item Anatomy

| Option | Description | Selected |
|--------|-------------|----------|
| Two-line: role name + account ID stacked | Role name bold line 1, account ID smaller/muted line 2. Cloudscape-native for two-piece identifiers. Minor create_role_list_item.js change. | ✓ |
| Single row, restyled | Keep [swatch][name + account inline] structure, apply tokens. Minimal JS change. | |
| You decide | Planner picks layout for Cloudscape treatment. | |

**User's choice:** Two-line layout
**Notes:** create_role_list_item.js needs DOM update to wrap the two pieces separately. hidesAccountId: second line simply absent when set.

Swatch shape follow-up:

| Option | Description | Selected |
|--------|-------------|----------|
| Rounded square (~4px radius) | Matches Cloudscape avatar/badge style. Uses token radius-xs. | ✓ |
| Keep hard square | No border-radius. Simpler, consistent with current. | |
| Full circle | border-radius: 50%. More avatar-like. Changes visual language significantly. | |

**User's choice:** Rounded square (~4px, `var(--radius-xs)`)

---

## Sidebar Nav Panel

| Option | Description | Selected |
|--------|-------------|----------|
| Keep two-column layout, reskin only | mainPane + sidebar flex structure stays. .optionMenu DOM unchanged. Apply tokens only. Lower risk. | ✓ |
| Replace with compact icon toolbar or header row | Consolidate 6 nav links into header bar or icon row. Frees horizontal space. Bigger change. | |
| You decide | Planner picks structure for Cloudscape-native popup. | |

**User's choice:** Keep two-column layout, reskin only

Grouping follow-up:

| Option | Description | Selected |
|--------|-------------|----------|
| Plain token-styled list, no grouping | Apply tokens only. No added sections, dividers, or icons. Least regression risk. | |
| Add subtle divider after Configuration | 1px token divider separating primary from secondary links. Small structural addition. | |
| You decide | Planner picks based on what reads Cloudscape-native at that column width. | ✓ |

**User's choice:** You decide (planner's call)

---

## Empty & Loading State Content

"Not on AWS page" message:

| Option | Description | Selected |
|--------|-------------|----------|
| "Navigate to the AWS console to switch roles" | Clear, actionable, one sentence. No outbound link. | ✓ |
| "Open the AWS console first…" with link | Adds outbound link to console.aws.amazon.com. Friendly for new users but more DOM complexity. | |
| Custom copy | User specifies exact text. | |

**User's choice:** "Navigate to the AWS console to switch roles."

"On AWS, no matching roles" message:

| Option | Description | Selected |
|--------|-------------|----------|
| Message + CTA link to Configuration | Short message + clickable CTA to open options page. Reuses #openOptionsLink navigation. Actionable. | ✓ |
| Message only, no CTA | Plain text only. Simpler. User knows Configuration is in sidebar. | |
| Custom copy | User specifies. | |

**User's choice:** Message + CTA link to Configuration

Loading state:

| Option | Description | Selected |
|--------|-------------|----------|
| Spinner + "Loading roles…" text | CSS-only spinner from components.css + label. Cloudscape-native pattern. | ✓ |
| Text only — "Loading…" | Just muted text label. Roles typically resolve in <200ms. | |
| Skeleton rows | 2–3 placeholder role-item shapes. More polished but may be over-engineering. | |

**User's choice:** CSS-only spinner + "Loading roles…" text

---

## Claude's Discretion

- Swatch contrast border implementation (token approach vs hex per theme, exact values)
- Sidebar grouping/dividers (plain list vs subtle divider after "Configuration")
- Two-line item DOM structure (wrapper class names, element types in create_role_list_item.js)
- Exact state container structure (#noMain reused with state classes, or separate elements)
- popup.css class naming convention (follow aesr- prefix from components.css)

## Deferred Ideas

None — discussion stayed within phase scope.

Already deferred elsewhere: theme-toggle placement and shape → Phase 4; per-profile color × console-header → out of scope for milestone; a11y audit → Phase 5; v2 popup polish items (POP-07/08/09) → REQUIREMENTS.md v2.
