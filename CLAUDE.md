# Claude Unwrapped — project instructions

## Design skills — when to use which

This repo vendors design skills at `.claude/skills/` (full rationale and sources: [.claude/skills/README.md](.claude/skills/README.md)). Their bundled descriptions alone are not enough to route correctly for *this* project — use these rules instead.

**Routing by what you're building:**

| Building... | Use | Why |
|---|---|---|
| The stats dashboard itself (heatmap, stat tiles, charts, timeline) | `dataviz` (built-in) for chart/tile mechanics, **then** `brutalist-skill` for page-level layout/aesthetic | `brutalist-skill` is the one written for "data-heavy dashboards"; `taste-skill` explicitly excludes them |
| Landing/marketing/upload page (no user data shown yet) | `taste-skill` | This is exactly its target case |
| Picking a visual style with no direction given | `awesome-design` — for the dashboard view prefer data/analytics-tool brands already identified as good fits: `posthog`, `clickhouse`, `sentry`, `mongodb`, `linear.app`, `cal` | Real product design systems, not generic taste rules |
| UI code exists and needs a compliance pass | `web-design-guidelines` | Audits accessibility/UX against Vercel's live guidelines |

**Conflict rule:** if a view is ambiguous (shows some data but also acts as an entry point), `brutalist-skill` wins whenever real user data/stats are rendered; `taste-skill` wins for empty states and pre-data screens.

**Sequencing:** pick a style reference (if none given) → build with the matching generative skill(s) → audit with `web-design-guidelines` before considering UI work done.

Do not invoke `taste-skill` for dashboard views even though its description doesn't explicitly say so in the frontmatter — this exclusion lives in its body text, which the initial skill-matching won't see.
