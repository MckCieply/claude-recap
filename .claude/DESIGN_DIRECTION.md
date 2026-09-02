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
Per the `dataviz` skill: magnitude encoding is one hue, light→dark, computed and validated — not eyeballed. **Level 3 is a boosted-saturation variant of `primary`, not `primary` itself** (see 2026-09-01 "saturation boost" decision log entry — a deliberate, user-approved deviation from the original "level 3 == primary exactly" rule, made because the exact-primary top color read as too washed out once most of a user's cells land at max level). `primary` itself is unchanged everywhere else in the app — buttons, links, focus rings — only the heatmap's own internal ramp uses this more vivid sibling. Derived directly in OKLCH (not by mixing sRGB hex strings) and checked with the skill's `validate_palette.js` `--ordinal` mode against `surface-1` (all checks PASS: monotone lightness, ≥0.06 adjacent ΔL, ≥2:1 light-end contrast, single hue):

| Level | Hex | OKLCH (L / C) | Meaning |
|---|---|---|---|
| 0 (no activity) | `surface-1` (`#0f1011`) fill + `hairline` border | — | Not part of the ramp — absence, not a low magnitude |
| 1 | `#454d7e` | 0.437 / 0.082 | |
| 2 | `#4e58b6` | 0.502 / 0.147 | |
| 3 (max) | `#5962eb` | 0.567 / 0.204 | ~1.3x `primary`'s own chroma (0.159) at the same lightness and hue |

Only 3 nonzero levels (not the usual 4-5): the achievable lightness range between `surface-1` and this ramp's own top lightness is narrow, and 4 steps couldn't clear the ≥0.06 adjacent-ΔL gate at this contrast floor — validated empirically, not assumed. Adjacent ΔL is ~0.065 per step — deliberately kept close to (but clear of) the 0.06 floor so level 1 could sit as light as possible while level 3 stays fixed (see the 3rd 2026-09-01 decision log entry: level 1 was pushed lighter on user feedback, which necessarily narrows both gaps since level 3 doesn't move). Chroma is a fixed 40%/72%/100% fraction of level 3's own chroma at levels 1/2/3 — strictly increasing by construction, which matters: an earlier version computed level 1/2 chroma independently against each level's own gamut ceiling and level 2 accidentally came out *more* saturated than level 3, which read as "the middle step is off, not really in the middle." Re-derive (same method) if the locked palette above ever changes.

### Data visualization — categorical palette (multi-file source identity)
Feature: importing multiple export files at once (e.g. a personal export and a work export) and telling their activity apart on the same dashboard. This is a **categorical** job (identity: which file), not sequential — per the `dataviz` skill it needs its own fixed-order hue set, validated for CVD separation, not a shade of `primary`.

| Slot | Hex | Role |
|---|---|---|
| Source 1 | `primary` (`#5e6ad2`) | Default identity color for the first/only file — used for anything outside the heatmap ramp itself (e.g. the per-source legend swatch's conceptual "which hue" family) |
| Source 2 | `#d95926` (orange) | |
| Source 3 | `#199e70` (aqua) | |

Validated as a set with `validate_palette.js` (categorical mode, adjacent pairs, dark, surface `#0f1011`): all PASS — worst adjacent CVD ΔE 9.4 (deutan, well above the 8.0 target), worst normal-vision ΔE 26.5 (well above the 15.0 floor), all ≥3:1 contrast. Values 2 and 3 are the skill's own validated dark-mode categorical steps (`palette.md`) — reused as-is since they passed against our surface too, not re-derived from scratch. **Note:** the actual legend swatches and heatmap level-3 cells render the boosted-saturation variants from the per-source ramp table below (e.g. `#5962eb` for source 1, not `#5e6ad2`) — re-validated as their own set below, since that's what's actually painted on screen for "which file is this."

**Practical cap: 3 sources with a validated, distinguishable color.** A 4th hue was not derived — per the skill, "never solve too many series by generating more hues" on the fly. A 4th+ file is an open question (fold into a neutral "combined" bucket? require picking 3?) — revisit if it comes up; it's the explicitly rare case here.

Each source also gets its **own 3-level sequential ramp**, same OKLCH-native method as the primary ramp above (see decision log), so a source's color can also carry *how much* activity, not just *which file*:

| Level | Source 1 (primary-family) | Source 2 (orange-family) | Source 3 (aqua-family) |
|---|---|---|---|
| 1 | `#454d7e` | `#815444` | `#496959` |
| 2 | `#4e58b6` | `#ad583a` | `#418265` |
| 3 (max) | `#5962eb` | `#d65c2d` | `#349c73` |

All three ramps independently pass the same `--ordinal` checks as the primary one (monotone lightness, ≥0.06 adjacent ΔL, ≥2:1 dark-end contrast, single hue) — level 1 now clears that contrast floor with real margin (2.37:1 / 2.98:1 / 3.13:1 respectively, vs. ~2.05:1 in the prior pass), since level 1 was pushed as light as each ramp's ΔL budget allows rather than sitting at the bare minimum. The level-3 triple `#5962eb` / `#d65c2d` / `#349c73` (unchanged from the saturation-boost pass, re-validated then) is what the per-source legend and single-source-day cells actually paint — still passes its own categorical CVD check (worst pair ΔE 9.3).

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
- `2026-09-01` (later same day) — Saturation boost, second pass on the ramps above. User feedback: still not saturated enough, specifically calling out the top level since most of a real user's cells land there. This required breaking the "level 3 == `primary`/`#d95926`/`#199e70` exactly" rule from the first pass — asked the user directly whether to boost level 3 too (breaking exact brand-color match) or only levels 1–2 (keeping the heatmap's max color visually identical to the site's one accent elsewhere); user chose to boost level 3 as well. `primary`/`orange`/`aqua` tokens themselves are untouched — only the heatmap's own hardcoded ramp (`RAMP` in `activity-heatmap.ts`, `--heat-1/2/3` in `styles.scss`) now uses a more vivid sibling. Method: kept the same lightness values as the first pass (small re-fit — level 1's L moved by ≤0.01 per hue to re-clear the 2:1 contrast floor at the new, higher chroma, since contrast depends on more than L alone), and pushed chroma to ~1.85x the first pass's values at every level, capped at 85% of each level's own sRGB gamut-max chroma (computed by binary search at that exact L/H) so nothing clips or looks artificial right at the gamut edge — a full 92%+ push toward gamut max was tried first and rejected: primary's hue has dramatically more gamut headroom than orange/aqua at these lightnesses, so a uniform "percent of gamut max" target produced a near-neon violet for primary next to only mildly-bumped orange/aqua, inconsistent across the three families. A consistent multiplier on each family's own prior chroma reads as a uniform "more saturated" bump instead. Re-ran both the `--ordinal` check per ramp and a fresh categorical CVD check on the new level-3 triple (since it's no longer the already-validated brand-color set) — all PASS. User's explicit choice on the level-3 trade-off; re-derive (same method: same multiplier, same gamut-safety margin) if the locked palette above ever changes.
- `2026-09-01` (third pass) — Two more live findings on the boosted ramps above. (1) Level 2 had accidentally become *more* saturated than level 3 for the primary ramp (`C` 0.235 vs. 0.204) — the second pass capped each level's chroma independently against its own gamut ceiling rather than against level 3's chroma, and level 2's lower lightness happened to sit closer to this hue's peak-chroma point, giving it more raw headroom than level 3 had. Visually this read as "the middle step doesn't look like the middle" (user's words) — level 2 popped harder than the level meant to be the max. Fixed by making chroma a fixed, strictly increasing fraction of level 3's own chroma (40%/72%/100%) instead of three independent gamut-ceiling caps — monotonic by construction, can't overshoot again. (2) Level 1 was still reading as too dark ("bottom needs to be lighter") even though it passed the 2:1 contrast floor — passing a floor isn't the same as looking good above it. Level 1's lightness was pushed up to the lightest value that still keeps *both* adjacent ΔL gaps at ~0.065 (just clear of the validator's 0.06 floor, since level 3's lightness is fixed and pushing level 1 lighter necessarily shrinks the gaps on both sides) — contrast against `surface-1` landed at 2.37:1/2.98:1/3.13:1, comfortably above the 2:1 floor instead of barely at it. Level 2 recomputed as the true midpoint of the new level 1 and the unchanged level 3. Level 3 itself untouched in this pass (user confirmed it "looks good now"). All three ramps re-run through `validate_palette.js --ordinal` and PASS.
