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

## How to use

1. List available names: `.claude/design-md/` (currently: airbnb, airtable, apple, binance, bmw, bmw-m, bugatti, cal, claude, clay, clickhouse, cohere, coinbase, composio, cursor, dell-1996, elevenlabs, expo, ferrari, figma, framer, hashicorp, hp, ibm, intercom, kraken, lamborghini, linear.app, lovable, mastercard, meta, minimax, mintlify, miro, mistral.ai, mongodb, nike, nintendo-2001, notion, nvidia, ollama, opencode.ai, pinterest, playstation, posthog, raycast, renault, replicate, resend, revolut, runwayml, sanity, sentry, shopify, slack, spacex, spotify, starbucks, stripe, supabase, superhuman, tesla, theverge, together.ai, uber, vercel, vodafone, voltagent, warp, webflow, wired, wise, x.ai, zapier).
2. If the user named a brand, read that one file directly: `.claude/design-md/<brand>/DESIGN.md`.
3. If no direction was given, pick 1-3 candidates that fit the project's domain and stated tone, read their `DESIGN.md`, and briefly tell the user which you picked and why before applying — don't apply silently.
4. Treat the file as a token/rule source (colors, type, spacing, motion), not as something to copy verbatim — adapt to this project's actual content and constraints.

## Relationship to other design skills in this repo

- `taste-skill` — generative design *judgment* (how to lay things out well). Use together: taste-skill supplies the rules of good design, this supplies a concrete stylistic direction to apply them in.
- `web-design-guidelines` — audits finished UI code for accessibility/UX compliance. Run after building, regardless of which style was used.
