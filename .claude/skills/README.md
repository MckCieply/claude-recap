# Design skills used in this project

Four community skills, vendored into this repo so they apply **only to `claude-recap`** — nothing installed globally, nothing shared with other projects. Each is a plain `SKILL.md` (frontmatter + instructions), auto-discovered by Claude Code from `.claude/skills/<name>/SKILL.md`. No hooks, no MCP servers, no background processes.

Status: **staged, not yet wired into a workflow.** We're deciding separately how/when each one should actually get invoked (a "harness" for them) — this doc just records what's here and where it came from.

## 1. `taste-skill/` — generative design judgment

- **Source:** [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), skill `design-taste-frontend` (MIT)
- **What it does:** design *judgment* applied while building UI — layout, typography, motion, spacing rules meant to avoid generic "AI slop" interfaces.
- **⚠️ Scope caveat (from the skill's own text):** it explicitly targets "landing pages, portfolios, and redesigns" and calls out "**not dashboards, not data tables, not multi-step product UI**". Claude Unwrapped is a stats dashboard, so this skill's default rules may not be the right fit as-is — worth revisiting when we design the harness.
- We took only the flagship skill (`design-taste-frontend`) at first, plus `brutalist-skill` (added after — see below). The upstream repo bundles 11 more (minimalist/soft/stitch variants, image-generation skills, a v1 legacy version) that we deliberately skipped — see conversation history if we want to add one later.

## 2. `brutalist-skill/` — dashboard-appropriate alternative to taste-skill

- **Source:** [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), skill `industrial-brutalist-ui` (MIT) — same repo as #1, different skill within it.
- **What it does:** rigid grids, extreme type-scale contrast, utilitarian color, "declassified blueprint" terminal aesthetic. Its own description explicitly names its target as **"data-heavy dashboards, portfolios, or editorial sites"** — the case `taste-skill` explicitly excludes.
- **Why we added it:** `taste-skill`'s flagship skill rules itself out for dashboards (see caveat above); this is the sibling skill from the same repo that was written for exactly that case. Claude Unwrapped is a stats dashboard, so this is the more relevant of the two for the actual UI — `taste-skill` is still useful for any landing/marketing-style pages the project ends up with (e.g. a homepage before the dashboard view).

## 3. `web-design-guidelines/` — compliance audit

- **Source:** [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), skill `web-design-guidelines`
- **What it does:** reviews *already-written* UI code against Vercel's Web Interface Guidelines (accessibility, focus states, touch targets, semantic HTML, etc.), reporting `file:line` findings. It fetches the live ruleset from `vercel-labs/web-interface-guidelines` at run time rather than bundling a static checklist, so it stays current automatically.
- Runs *after* UI exists — an audit step, not a generator.

## 4. `design-md/` + `awesome-design/` — style reference corpus

- **Source:** [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT), full `design-md/` directory vendored to `.claude/design-md/`
- **What it is:** ~74 plain-text `DESIGN.md` files, one per real product/brand (Apple, Linear, Stripe, Vercel, Notion, Spotify, and more), each describing that product's actual design system in words — colors, type scale, spacing, motion — not screenshots.
- **`awesome-design/SKILL.md`** is a thin wrapper we wrote ourselves (the upstream repo has no skill/automation, just the reference files) so Claude can discover and use it: pick a brand the user names, or infer 1-3 fitting candidates when no direction is given, read that `DESIGN.md`, and apply it as a style reference.
- For this dashboard specifically, the corpus includes real data/analytics-tool brands whose `DESIGN.md` will fit better than lifestyle/auto brands: `posthog`, `clickhouse`, `sentry`, `mongodb`, `linear.app`, `cal`.

## Not vendored, but relevant: the built-in `dataviz` skill

Separately from all of the above, this Claude Code environment already ships a built-in `dataviz` skill (not something we added) purpose-built for charts, heatmaps, stat tiles, and dashboard layouts — arguably the best fit for Claude Unwrapped's actual chart/heatmap work, since none of the three vendored skills are chart-specific. Worth using alongside `brutalist-skill` rather than instead of it: `dataviz` for the chart/tile mechanics, `brutalist-skill` for the overall page aesthetic.

## How they fit together

| Skill | Role |
|---|---|
| `taste-skill` | generate — design judgment for landing/marketing-style pages |
| `brutalist-skill` | generate — design judgment for the actual dashboard UI |
| `awesome-design` | reference — concrete style/tokens to draw from |
| `web-design-guidelines` | audit — compliance check on the result |
| `dataviz` (built-in, not vendored) | generate — chart/heatmap/stat-tile mechanics specifically |

No functional overlap. Intended pipeline: pick/reference a style → build with taste judgment (+ dataviz for chart pieces) → audit before shipping. Exact triggering rules (automatic vs. on-demand, which one runs when) still TBD — that's the harness discussion.
