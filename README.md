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

- [ ] _TBD — e.g. Vite + TypeScript, no backend, charts via a lightweight client-side library_

## Contributing

Issues and PRs welcome. Please **do not** attach real export data (yours or anyone else's) to issues, screenshots, or test fixtures — use synthetic/sample data only.

## License

MIT
