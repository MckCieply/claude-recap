# Design skills used in this project

Three community skills, vendored into this repo so they apply **only to `claude-recap`** — nothing installed globally, nothing shared with other projects. Each is a plain `SKILL.md` (frontmatter + instructions), auto-discovered by Claude Code from `.claude/skills/<name>/SKILL.md`. No hooks, no MCP servers, no background processes.

Status: **staged, not yet wired into a workflow.** We're deciding separately how/when each one should actually get invoked (a "harness" for them) — this doc just records what's here and where it came from.

## 1. `taste-skill/` — generative design judgment

- **Source:** [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), skill `design-taste-frontend` (MIT)
- **What it does:** design *judgment* applied while building UI — layout, typography, motion, spacing rules meant to avoid generic "AI slop" interfaces.
- **⚠️ Scope caveat (from the skill's own text):** it explicitly targets "landing pages, portfolios, and redesigns" and calls out "**not dashboards, not data tables, not multi-step product UI**". Claude Unwrapped is a stats dashboard, so this skill's default rules may not be the right fit as-is — worth revisiting when we design the harness.
- We took only the flagship skill (`design-taste-frontend`). The upstream repo bundles 12 more (style-specific variants like brutalist/minimalist/soft/stitch, image-generation skills, a v1 legacy version) that we deliberately skipped — see conversation history if we want to add one later.

## 2. `web-design-guidelines/` — compliance audit

- **Source:** [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), skill `web-design-guidelines`
- **What it does:** reviews *already-written* UI code against Vercel's Web Interface Guidelines (accessibility, focus states, touch targets, semantic HTML, etc.), reporting `file:line` findings. It fetches the live ruleset from `vercel-labs/web-interface-guidelines` at run time rather than bundling a static checklist, so it stays current automatically.
- Runs *after* UI exists — an audit step, not a generator.

## 3. `design-md/` + `awesome-design/` — style reference corpus

- **Source:** [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT), full `design-md/` directory vendored to `.claude/design-md/`
- **What it is:** ~74 plain-text `DESIGN.md` files, one per real product/brand (Apple, Linear, Stripe, Vercel, Notion, Spotify, and more), each describing that product's actual design system in words — colors, type scale, spacing, motion — not screenshots.
- **`awesome-design/SKILL.md`** is a thin wrapper we wrote ourselves (the upstream repo has no skill/automation, just the reference files) so Claude can discover and use it: pick a brand the user names, or infer 1-3 fitting candidates when no direction is given, read that `DESIGN.md`, and apply it as a style reference.

## How the three fit together

| Skill | Role |
|---|---|
| `taste-skill` | generate — design judgment while building |
| `awesome-design` | reference — concrete style/tokens to draw from |
| `web-design-guidelines` | audit — compliance check on the result |

No functional overlap. Intended pipeline: pick/reference a style → build with taste judgment → audit before shipping. Exact triggering rules (automatic vs. on-demand, which one runs when) still TBD — that's the harness discussion.
