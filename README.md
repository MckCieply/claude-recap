# Claude Unwrapped

> Turn your official Claude.ai data export into a personal, "wrapped"-style usage dashboard — entirely in your browser.

**⚠️ Unofficial, community project.** Not affiliated with, endorsed by, or sponsored by Anthropic. "Claude" is a trademark of Anthropic PBC, used here only to describe compatibility.

---

## What is this?

Claude.ai doesn't expose a public API for personal historical usage stats — no "how many messages have I sent since 2024" endpoint. What it *does* offer is a manual data export (Settings → Privacy → Export data) containing your full conversation history.

**Claude Unwrapped** reads that export and turns it into a visual summary of your usage — similar in spirit to Spotify Wrapped or a GitHub contribution graph: how long you've been using Claude, your activity over time, streaks, busiest hours, and more.

## Features

- 📅 **Timeline** — date of your first conversation, total days/years active
- 🔥 **Activity heatmap** — daily message activity, GitHub-contribution-graph style
- 🌙 **Patterns** — busiest day of week, busiest hour, longest streak
- 💬 **Counts** — total conversations, messages, words over time
- 📈 **Approximate token estimate** *(see caveat below — not exact)*
- 🧵 **Highlights** — longest conversation, most active month/year
- 🖼️ **Export widgets** — save any individual stat card (heatmap, streak, top stats, etc.) as a standalone PNG/SVG image, sized for sharing — like Spotify Wrapped's individual share slides

## How it works

```
export data (.json)  →  drop in browser  →  parsed & rendered locally  →  browse dashboard  →  export any widget as an image
```

Nothing here is a live feed — it's a one-time (or whenever-you-want) pass over a static export file. There's no account, no login, no backend to talk to. The whole thing could run from a single HTML file with no internet connection at all, and that's intentional (see [Privacy](#privacy--read-this-before-uploading-anything)).

**Widget export**, specifically: every card in the dashboard is a self-contained visual unit. Each one gets an "export" affordance that renders *that card alone* to a PNG (and/or SVG) at a fixed shareable size — no account data leaks into the image beyond what's already shown on the card itself, and the export happens the same way everything else does: in your browser, nothing uploaded anywhere.

## Privacy — read this before uploading anything

Your export contains the full text of every conversation you've ever had with Claude — for most people that includes sensitive personal, professional, and financial information. This tool is built around one rule:

**Your data never leaves your browser.**

- 100% client-side — parsing and rendering happen locally, nothing is sent to any server
- No analytics, no error-tracking SDKs, no third-party scripts that touch your file's contents
- Works fully offline once the page is loaded — disconnect from the internet before uploading if you want to verify this yourself
- Fully open source — audit the code and your browser's network tab any time

If a hosted version of this tool exists, treat it the same as running it locally: check the network tab, or just run it from source.

## Getting started

1. **Export your data**: claude.ai → profile icon → Settings → Privacy → **Export data**. Anthropic emails you a download link (valid ~24h).
2. **Unzip the archive** — you'll get a `conversations.json` (and possibly `projects.json` / account info files).
3. Open the tool and drop `conversations.json` in.
4. Browse your stats.

### Running locally

```bash
git clone https://github.com/<your-username>/claude-unwrapped.git
cd claude-unwrapped
npm install
npm run dev
```

## Limitations

- **Token counts are an estimate.** Claude's exact tokenizer isn't public, so figures are heuristic and may differ from your real usage.
- **Projects and memory** are inconsistently included (or excluded) in the standard export — features relying on them may be partial.
- **This is a snapshot, not a live feed.** Re-export your data any time you want fresh stats; there's no way to auto-sync.
- Very long conversations occasionally have incomplete data in Anthropic's own export (a known limitation on their end).

## Tech stack

**Not decided yet.** Hard constraints that any choice has to satisfy, driven by the [Privacy](#privacy--read-this-before-uploading-anything) promise and the widget-export feature:

- No backend, no build-time or run-time server calls — static site only, must work fully offline once loaded
- Must run entirely in-browser on a user-supplied JSON file that could be large (years of conversation history)
- Needs a reliable way to render a single UI card to a downloadable PNG/SVG (the export feature)

| Layer | Candidates | Notes |
|---|---|---|
| Framework | Vite + TypeScript (no framework), React, Svelte, SolidJS | Leaning toward something light — this is a single-page, mostly-static-after-load app, not a reason to reach for a full framework |
| Charts / heatmap / stat tiles | Hand-rolled SVG, D3, visx | The vendored `dataviz` skill (see [CLAUDE.md](CLAUDE.md)) favors hand-rolled SVG marks over a heavy charting library — likely the default unless a specific chart turns out to need more |
| Widget → image export | `html-to-image` / `html2canvas` (DOM→PNG), or render each widget natively to `<canvas>`/SVG and export that directly | Native canvas/SVG export gives more control and avoids DOM-to-image rendering quirks, at the cost of maintaining two render paths (screen + export) unless the on-screen widget *is* the SVG being exported |
| Styling | Plain CSS, CSS Modules, Tailwind | Will follow whatever the locked design direction in [.claude/DESIGN_DIRECTION.md](.claude/DESIGN_DIRECTION.md) implies once that's set |
| Hosting (optional) | GitHub Pages, Netlify, Vercel static, or just open `index.html` locally | Purely static output either way — "hosted version" in the Privacy section refers to this |

This section gets filled in for real once we pick — the [Getting started](#running-locally) commands below (`npm install && npm run dev`) assume a Vite-style setup and will need updating to match whatever we land on.

## Contributing

Issues and PRs welcome. Please **do not** attach real export data (yours or anyone else's) to issues, screenshots, or test fixtures — use synthetic/sample data only.

## License

MIT
