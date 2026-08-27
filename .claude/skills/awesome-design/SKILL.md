---
name: awesome-design
description: Reference library of real product design systems (Apple, Linear, Stripe, Vercel, Notion, and 70+ others) as plain-text DESIGN.md files. Use when building or restyling UI and no specific visual direction was given, or when the user names a brand/product whose look they want to borrow.
---

# Awesome Design — reference corpus

Source: [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) (MIT). Vendored into this repo at `.claude/design-md/`.

This is not a design generator — it is a library of ~74 written design-system descriptions (colors, type scale, spacing, motion, component rules) for real products and brands. Each lives at `.claude/design-md/<name>/DESIGN.md`.

## When to use

- User asks to build/restyle UI and gives no explicit style direction.
- User names a brand or product they want the look of ("make it feel like Linear", "Stripe-ish").

## First: check the lock

This project records its chosen direction in `.claude/DESIGN_DIRECTION.md`. **Check it before doing anything below.**

- If it's already **LOCKED**, don't pick a new brand — use exactly what's recorded there, even for a component that feels like it'd suit a different brand better (denser data, different screen, etc.). That's a variant-within-style problem, not a re-pick problem.
- If it's **UNDECIDED**, you're making the first pick — follow the steps below, then write the result into that file (with the user's confirmation) so it doesn't get re-decided later.

## How to use (only when UNDECIDED)

1. List available names: `.claude/design-md/` (currently: airbnb, airtable, apple, binance, bmw, bmw-m, bugatti, cal, claude, clay, clickhouse, cohere, coinbase, composio, cursor, dell-1996, elevenlabs, expo, ferrari, figma, framer, hashicorp, hp, ibm, intercom, kraken, lamborghini, linear.app, lovable, mastercard, meta, minimax, mintlify, miro, mistral.ai, mongodb, nike, nintendo-2001, notion, nvidia, ollama, opencode.ai, pinterest, playstation, posthog, raycast, renault, replicate, resend, revolut, runwayml, sanity, sentry, shopify, slack, spacex, spotify, starbucks, stripe, supabase, superhuman, tesla, theverge, together.ai, uber, vercel, vodafone, voltagent, warp, webflow, wired, wise, x.ai, zapier).
2. If the user named a brand, read that one file directly: `.claude/design-md/<brand>/DESIGN.md`.
3. If no direction was given, pick 1-3 candidates that fit the project's domain and stated tone, read their `DESIGN.md`, and tell the user which you picked and why — get confirmation before writing it into the lock file.
4. Treat the file as a token/rule source (colors, type, spacing, motion), not as something to copy verbatim — adapt to this project's actual content and constraints. Copy the concrete resolved values into the lock file's "Locked tokens" section so later components read the lock, not this corpus, and can't drift by re-interpreting the source `DESIGN.md` differently each time.

## Relationship to other design skills in this repo

- `taste-skill` / `brutalist-skill` — generative design *judgment* (how to lay things out well). Use together: they supply the rules of good design, this supplies the concrete stylistic direction (once) to apply them in.
- `web-design-guidelines` — audits finished UI code for accessibility/UX compliance. Run after building, regardless of which style was used.

Full routing rules for this project: [CLAUDE.md](../../../CLAUDE.md).
