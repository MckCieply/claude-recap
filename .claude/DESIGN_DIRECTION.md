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
Per the `dataviz` skill: magnitude encoding is one hue, light→dark, computed and validated — not eyeballed. Derived by linearly mixing `surface-1` (`#0f1011`) toward `primary` (`#5e6ad2`) and checked with the skill's `validate_palette.js` `--ordinal` mode against `surface-1` (all checks PASS: monotone lightness, ≥0.06 adjacent ΔL, ≥2:1 light/dark-end contrast, single hue):

| Level | Hex | Meaning |
|---|---|---|
| 0 (no activity) | `surface-1` (`#0f1011`) fill + `hairline` border | Not part of the ramp — absence, not a low magnitude |
| 1 | `#3e4685` | |
| 2 | `#4e58ab` | |
| 3 (max) | `#5e6ad2` (== `primary`) | |

Only 3 nonzero levels (not the usual 4-5): the achievable lightness range between `surface-1` and `primary` is narrow, and 4 steps couldn't clear the ≥0.06 adjacent-ΔL gate at this contrast floor — validated empirically, not assumed. Re-derive (same method) if the locked palette above ever changes.

**Decision log:**
- `2026-08-27` — Chose `linear.app` over `spotify` and `posthog`. Spotify was the initial recommendation (matches the README's own "Wrapped"-style tagline directly, strong shareable-card narrative) but its pill/rounded-everything shape language sits in real tension with `brutalist-skill`'s rigid-grid target. PostHog's playful cream/mascot-illustration identity risks visually echoing their actual hedgehog branding if not handled very deliberately. Linear's dense, single-accent, hairline-bordered, dark-canvas system is the most direct fit for a data-heavy dashboard and needs the least adaptation to work with `brutalist-skill` — user's explicit choice.
