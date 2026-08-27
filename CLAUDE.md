# Claude Unwrapped — project instructions

## Design direction lock — read this first, every time

Before generating or changing any UI, read [.claude/DESIGN_DIRECTION.md](.claude/DESIGN_DIRECTION.md).

- **If it says UNDECIDED:** this is the first UI work on the project. Propose a direction (reference brand from `awesome-design`, which generative skill(s) apply) to the user, get confirmation, then write the decision into that file yourself before writing any component code.
- **If it says LOCKED:** use exactly what's recorded there. Do not pick a different reference brand, swap `taste-skill` for `brutalist-skill` (or vice versa), or re-derive tokens from a `DESIGN.md` file for a single component — even if that component has unusually dense or sparse data compared to others. A denser view gets a *variant* of the locked style (tighter spacing, smaller type step) — never a different source style. If the locked direction genuinely doesn't fit something you're building, stop and ask the user to update the lock — don't quietly deviate for one component.

## The skills available, and what each one is for

Vendored at `.claude/skills/` (full sourcing/licensing detail: [.claude/skills/README.md](.claude/skills/README.md)). All are plain `SKILL.md` files — no hooks, no scripts, nothing running in the background.

- **`taste-skill`** (`design-taste-frontend`) — generative design judgment: layout, typography, spacing, motion rules that avoid generic "AI-slop" UI. Written for landing pages, portfolios, and redesigns. Its own text explicitly excludes dashboards and data tables — don't use it for those, even though nothing in its short description says so.
- **`brutalist-skill`** (`industrial-brutalist-ui`) — generative design judgment aimed at "data-heavy dashboards": rigid grids, high type-scale contrast, utilitarian color, terminal/blueprint aesthetic. This is the one to use for the actual stats dashboard.
- **`awesome-design`** — not a generator, a reference library: ~74 real product design systems as text (`.claude/design-md/<brand>/DESIGN.md`). Use it once, at the start, to pick the locked reference brand(s) — see lock file above. Don't re-consult it per-component after the direction is locked.
- **`web-design-guidelines`** — not a generator, an auditor. Reviews UI code you've already written against Vercel's live accessibility/UX guidelines (fetched fresh each run) and reports `file:line` findings. Run this as a pass over finished UI, not while designing it.
- **`dataviz`** (built-in to this environment, not vendored — no file under `.claude/skills/`) — chart, heatmap, stat-tile, and dashboard-layout mechanics specifically. Use for the actual chart/heatmap components; `brutalist-skill` governs the surrounding page, `dataviz` governs the data visualizations themselves.

## Routing by what you're building

| Building... | Use |
|---|---|
| The stats dashboard itself (heatmap, stat tiles, charts, timeline) | `dataviz` for the chart/tile mechanics + `brutalist-skill` for page-level layout — both reading the locked direction |
| Landing/marketing/upload page (no user data shown yet) | `taste-skill`, reading the locked direction |
| UI code exists and needs a compliance pass | `web-design-guidelines` |

**Conflict rule:** if a view is ambiguous (shows some data but also acts as an entry point), `brutalist-skill` wins whenever real user data/stats are rendered; `taste-skill` wins for empty states and pre-data screens. This is a layout-skill choice only — the locked reference brand and tokens stay the same regardless.

**Sequencing:** confirm the direction is locked (or lock it) → build with the matching generative skill(s) → audit with `web-design-guidelines` before considering UI work done.
