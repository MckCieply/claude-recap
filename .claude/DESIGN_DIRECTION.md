# Design direction — locked

**Status: LOCKED.** This is the single source of truth for the project's visual direction. Every skill in `.claude/skills/` must read this before generating UI and follow it exactly — never re-pick a reference brand or switch generative skill per-component because of data density, screen type, or "it felt like a better fit here." Density differences are solved as *variants within the locked style* (tighter spacing, smaller type scale, denser grid — still the same design language), not by switching source.

Changing this file is a deliberate design decision, made once, with the user — not a side effect of building a particular screen.

---

**Reference brand:** [`linear.app`](../design-md/linear.app/DESIGN.md) (Linear's marketing-site design system)

**Generative skill(s) in use for this project's dashboard views:** `brutalist-skill` for the dashboard itself, `taste-skill` for any pre-data/landing page (upload screen). See routing table in [CLAUDE.md](../CLAUDE.md).

**Locked tokens** (resolved from the source `DESIGN.md` so components read these values, not the source file, and can't drift by re-interpreting it differently each time):

### Color
| Token | Hex | Use |
|---|---|---|
| `canvas` | `#010102` | Page background — near-black |
| `surface-1` | `#0f1011` | Cards, stat tiles, heatmap container |
| `surface-2` | `#141516` | Nested/alternate surfaces |
| `surface-3` | `#18191a` | Further-elevated surfaces |
| `surface-4` | `#191a1b` | Highest elevation |
| `hairline` | `#23252a` | Default border |
| `hairline-strong` | `#34343a` | Emphasized border |
| `hairline-tertiary` | `#3e3e44` | Subtle divider |
| `ink` | `#f7f8f8` | Primary text |
| `ink-muted` | `#d0d6e0` | Secondary text |
| `ink-subtle` | `#8a8f98` | Tertiary text, captions |
| `ink-tertiary` | `#62666d` | Lowest-emphasis text |
| `primary` | `#5e6ad2` | The one accent — active states, links, primary CTA, focus rings |
| `primary-hover` | `#828fff` | Hover state on primary |
| `primary-focus` | `#5e69d1` | Focus-ring tint |
| `semantic-success` | `#27a644` | The only other chromatic color allowed — status/positive indicators |

Rule from the source: **no second chromatic color, no gradients.** Everything besides `primary` and `semantic-success` is grayscale.

**Deliberate exception (multi-file import, added 2026-08-27):** per-source identity color breaks this rule on purpose — see "Data visualization — categorical palette" below. Everywhere else in the app the single-accent rule still holds.

### Typography
- Display/heading font: Linear's proprietary cut isn't available to us — fallback stack `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`.
- Body font: same fallback family as display (source uses a separate "Linear Text" cut we don't have access to either).
- Mono (for numeric/data alignment in stat tiles): `ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace`.
- Scale (size / weight / line-height / tracking): display-xl 80px/600/1.05/-3.0px, display-lg 56px/600/1.10/-1.8px, display-md 40px/600/1.15/-1.0px, headline 28px/600/1.20/-0.6px, card-title 22px/500/1.25/-0.4px, body 16px/400/1.50/-0.05px, body-sm 14px/400/1.50/0, caption 12px/400/1.40/0, button 14px/500/1.20/0.
- Big "wrapped"-style share numbers (e.g. total messages) use the display sizes; stat-tile labels use caption; dense data (heatmap counts, timestamps) uses the mono stack.

### Spacing
`xxs` 4px · `xs` 8px · `sm` 12px · `md` 16px · `lg` 24px · `xl` 32px · `xxl` 48px · `section` 96px.

### Radius
`xs` 4px · `sm` 6px · `md` 8px · `lg` 12px · `xl` 16px · `pill` 9999px. **Brutalist-skill override:** default to `xs`/`sm` for the dashboard's own components (sharper than Linear's marketing site, which favors `lg`/`xl`); reserve `pill` for small status badges only, never for primary containers or buttons.

### Motion
Not specified in the source `DESIGN.md` (it's a marketing site, not the product UI). Default: fast, understated transitions (150–200ms, ease-out) — consistent with Linear's restrained, non-decorative feel. No spring/bounce easing, no atmospheric/gradient animation.

### Data visualization — sequential ramp (activity heatmap)
Per the `dataviz` skill: magnitude encoding is one hue, light→dark, computed and validated — not eyeballed. Level 3 is fixed at `primary` (`#5e6ad2`) exactly — the heatmap's max cell deliberately reuses the site's one accent color. Levels 1–2 are derived directly in OKLCH (not by mixing sRGB hex strings — see 2026-09-01 decision log entry below) and checked with the skill's `validate_palette.js` `--ordinal` mode against `surface-1` (all checks PASS: monotone lightness, ≥0.06 adjacent ΔL, ≥2:1 light-end contrast, single hue):

| Level | Hex | OKLCH (L / C) | Meaning |
|---|---|---|---|
| 0 (no activity) | `surface-1` (`#0f1011`) fill + `hairline` border | — | Not part of the ramp — absence, not a low magnitude |
| 1 | `#3f4666` | 0.401 / 0.087 | |
| 2 | `#4d579e` | 0.484 / 0.127 | |
| 3 (max) | `#5e6ad2` (== `primary`) | 0.567 / 0.159 | |

Only 3 nonzero levels (not the usual 4-5): the achievable lightness range between `surface-1` and `primary` is narrow, and 4 steps couldn't clear the ≥0.06 adjacent-ΔL gate at this contrast floor — validated empirically, not assumed. Adjacent ΔL is ~0.083 per step here (vs. ~0.075 in the original sRGB-mix version) — genuinely wider, but `primary`'s own lightness (L 0.567) caps how much more room exists while level 3 stays pinned to it exactly; levels 1–2 also carry a much bigger *chroma* spread now (35%/72% of level 3's chroma, vs. ~66%/83% before) so the ramp reads as "barely tinted → vivid" instead of "similarly saturated, subtly lighter" — the validator doesn't score chroma directly, but it's what actually fixed the "levels look too close together" complaint that prompted this re-derivation. Re-derive (same method) if the locked palette above ever changes.

### Data visualization — categorical palette (multi-file source identity)
Feature: importing multiple export files at once (e.g. a personal export and a work export) and telling their activity apart on the same dashboard. This is a **categorical** job (identity: which file), not sequential — per the `dataviz` skill it needs its own fixed-order hue set, validated for CVD separation, not a shade of `primary`.

| Slot | Hex | Role |
|---|---|---|
| Source 1 | `primary` (`#5e6ad2`) | Default color for the first/only file — reuses the existing accent, so a single-file import looks exactly like it does today |
| Source 2 | `#d95926` (orange) | |
| Source 3 | `#199e70` (aqua) | |

Validated as a set with `validate_palette.js` (categorical mode, adjacent pairs, dark, surface `#0f1011`): all PASS — worst adjacent CVD ΔE 9.4 (deutan, well above the 8.0 target), worst normal-vision ΔE 26.5 (well above the 15.0 floor), all ≥3:1 contrast. Values 2 and 3 are the skill's own validated dark-mode categorical steps (`palette.md`) — reused as-is since they passed against our surface too, not re-derived from scratch.

**Practical cap: 3 sources with a validated, distinguishable color.** A 4th hue was not derived — per the skill, "never solve too many series by generating more hues" on the fly. A 4th+ file is an open question (fold into a neutral "combined" bucket? require picking 3?) — revisit if it comes up; it's the explicitly rare case here.

Each source also gets its **own 3-level sequential ramp**, same OKLCH-native method as the primary ramp above (see 2026-08-30 decision log entry), so a source's color can also carry *how much* activity, not just *which file*:

| Level | Source 1 (primary) | Source 2 (orange) | Source 3 (aqua) |
|---|---|---|---|
| 1 | `#3f4666` | `#653d2f` | `#2e4e3f` |
| 2 | `#4d579e` | `#a04929` | `#267656` |
| 3 (max) | `#5e6ad2` | `#d95926` | `#199e70` |

All three ramps independently pass the same `--ordinal` checks as the primary one (monotone lightness, ≥0.06 adjacent ΔL, ≥2:1 dark-end contrast, single hue) — orange and aqua land wider gaps than primary (~0.109 and ~0.114 ΔL per step, vs. ~0.083 for primary) simply because their level-3 anchors are lighter (`L` 0.622 / 0.621 vs. primary's 0.567), leaving more room before the level-1 contrast floor.

#### Heatmap cell rendering with multiple sources
- **Day touched by one source only:** flat fill, that source's own ramp level for that day — identical to the original single-source cell.
- **Day touched by two sources:** a diagonal corner-to-corner gradient (`linear-gradient(135deg, ...)`). Each corner is that source's *own* ramp color at *that source's own* level for the day (so both "which file" and "how much" survive per corner); the center stop is an unweighted OKLCH blend of the two corner colors (hue/chroma/lightness averaged, circular mean for hue) — a genuine mixed hue in the middle. Verified against the actual implementation: lavender-blue + orange corners produce a magenta/pink center (the circular-mean hue path between ~275° and ~40° passes through ~337°, not through the warmer amber side) — a prior draft of this doc described that center as "amber-brown," which was wrong; the shipped algorithm and its magenta output are both correct and intentional. Chosen over a single flat blended fill specifically so each source stays individually identifiable at the corners — a flat blend loses source identity entirely, which is the one thing the `dataviz` skill treats as a hard rule ("color follows the entity"); the corners are the concession that keeps this deliberate rule-break from becoming unreadable.
- **Day touched by three sources:** not yet specified — the corner mechanic doesn't extend cleanly past two. Design when it's actually being built (candidates: a conic gradient touching three corners, or the two dominant sources on the diagonal plus a small marker for the third).
- **Day touched by no source:** unchanged — `surface-1` fill + `hairline` border, still outside the ramp/gradient system entirely.
- **Legend:** the existing "Less → More" scale legend needs a companion per-source key (swatch + filename/label) once more than one file is loaded, so a color can actually be looked up.

Known, accepted trade-off: this whole mechanic (corners aside) breaks the `dataviz` skill's categorical-identity rule for the *blended center* of multi-source days specifically — an overlap day's center color isn't reliably distinguishable from a different overlap combination, and CVD-safety isn't validated for blends (the validator only checks fixed identity colors, not arbitrary blend outputs). Accepted for this project because sources are capped at 3, overlap is the less common case (most days touch one source or none), and the corners preserve identity for anyone who needs it exactly.

**Decision log:**
- `2026-08-27` — Added multi-file import (e.g. personal + work exports shown together) as a planned feature. Requires a categorical per-source color, which breaks the "single accent only" rule from the source `DESIGN.md` on purpose — see "Data visualization — categorical palette" above for the validated colors and the corner-gradient heatmap mechanic, chosen (over both a flat blend and separate per-source small-multiple heatmaps) specifically to keep source identity visible at a glance while still showing overlap. User's explicit choice after seeing the identity/CVD trade-off of a flat blend.
- `2026-08-27` — Chose `linear.app` over `spotify` and `posthog`. Spotify was the initial recommendation (matches the README's own "Wrapped"-style tagline directly, strong shareable-card narrative) but its pill/rounded-everything shape language sits in real tension with `brutalist-skill`'s rigid-grid target. PostHog's playful cream/mascot-illustration identity risks visually echoing their actual hedgehog branding if not handled very deliberately. Linear's dense, single-accent, hairline-bordered, dark-canvas system is the most direct fit for a data-heavy dashboard and needs the least adaptation to work with `brutalist-skill` — user's explicit choice.
- `2026-09-01` — Re-derived all three heatmap sequential ramps (primary/orange/aqua) after live user feedback that the 3 levels read as too close to each other. Root cause: the original ramps were built by mixing sRGB hex strings at fixed stops, which (a) left levels 1–2 nearly as saturated as level 3 (little chroma signal) and (b) only barely cleared the validator's 0.06 minimum adjacent-ΔL gate (~0.073–0.075), which is a *pass floor*, not a *good* gap. Re-derived by working directly in OKLCH instead: level 3 stays pinned to each hue's existing brand anchor exactly (`primary`/`#d95926`/`#199e70`, unchanged), level 1's lightness is set to the minimum that still clears the ordinal check's 2:1 light-end-contrast floor against `surface-1` (~L 0.39–0.40 depending on hue) plus a small safety buffer, level 2 sits at the midpoint between levels 1 and 3, and chroma is scaled to 35%/72%/100% of each hue's own top chroma across levels 1/2/3 — a much bigger saturation spread than before, which the `--ordinal` validator doesn't score directly but is what actually reads as "clearly different steps" rather than "same color, subtly lighter." All three ramps re-run through `validate_palette.js --ordinal` and PASS. Primary's own gap only widened to ~0.083 (vs. ~0.109/0.114 for orange/aqua) because `primary`'s L (0.567) sits closer to the level-1 contrast floor than orange/aqua's lighter anchors do — a real ceiling from keeping level 3 pinned to the exact brand color, not an oversight.
