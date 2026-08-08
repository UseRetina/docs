# Working on Retina user documentation

These pages are for people using Retina. They are not developer documentation.

## Source of truth

Treat the current production branch of `UseRetina/Retina` as authoritative. Confirm behavior in the shipped interface, product source, tests, and data contracts before changing a factual claim.

Use marketing pages and design prototypes only for tone. Never copy a product, privacy, pricing, or security claim from them without verification.

The page-to-source map is `product-docs-map.json`.

## Required workflow for every change

1. Identify the product behavior that changed.
2. Read the mapped source and the current canonical docs page.
3. Update only the affected sections. Do not rewrite unrelated pages for freshness.
4. Update `docs-meta.json` only for pages that were actually checked against the product.
5. Add or change a redirect when a public path moves.
6. Run `npm test`.
7. Search for em dashes and fix every result before completion.

If a product change has no documentation impact, record `Docs-Impact: none - <reason>` in the product commit message or pull request. Do not make a meaningless docs edit.

## Current product facts

- Sign-in methods are email, Google, X, EVM wallet, and Solana wallet when enabled by the live auth configuration.
- Wallet sign-in signs an off-chain login message. It cannot move assets or approve transactions.
- Sign-in identities and tracked addresses are separate.
- A signed-in portfolio has a browser working copy and a cloud account copy.
- New snapshots sync to the account and can restore on another browser or device.
- Scheduled automatic updates are optional.
- Cloud portfolio objects use server-side application encryption. Do not describe this as end-to-end encryption.
- Ask Retina has Private, Local AI, and Cloud AI modes. Cloud AI sends the question and a compact relevant fact set to Gemini.
- Retina is read-only and never claims rewards or executes portfolio transactions.
- Focus, Range, and Horizon are published plans. Checkout and subscription enforcement are not live yet.

## Content rules

- Use active voice and address the reader as "you."
- Use sentence case headings.
- Keep pages task-focused and concise.
- Put each fact on one canonical page and link to it elsewhere.
- Distinguish saved snapshot values from refreshed live values.
- Explain provider details only when they help someone understand coverage or fix a problem.
- Use bold text for interface labels.
- Use numerals for numbers.
- Do not use em dashes, including HTML entities.
- Do not add screenshots, photos, videos, GIFs, or other product imagery to documentation pages.
- Do not add roadmap promises to the user manual.
- Do not expose keys, internal endpoints, proxy details, deployment internals, or security bypass information.
- Do not guess. Leave the claim out until it can be verified.

## Page structure

Prefer this order:

1. One-sentence outcome
2. The workflow or explanation
3. Important limits, privacy, or freshness details
4. At most 2 next-page links
5. `Last verified: D Month YYYY.`

Mintlify displays the Git-derived last-modified date through `metadata.timestamp` in `docs.json`. The visible verification line records when behavior was last checked. These dates have different meanings and must remain separate.
