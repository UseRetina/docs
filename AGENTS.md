# Retina documentation agent instructions

## About Retina

Retina is a local-first portfolio tracker for crypto and adjacent assets. It is currently in private beta at https://useretina.xyz (password-gated, access by DM to @UseRetina).

The audience is sophisticated individual crypto users (DeFi farmers, multi-wallet operators, prediction market traders), not B2B teams. Documentation should reflect that: direct, technical, no enterprise jargon, no hand-holding.

## The problem Retina solves (use this framing wherever it helps)

Most "portfolio trackers" on the market are actually **wallet viewers**: they show what is in a specific wallet on a specific chain. DeBank does this for EVM, Jupiter for Solana, Polymarket has its own page, every yield protocol has its own page. None of them talk to each other.

A wallet viewer tells you: "You have 4,500 USDC on Upshift."

A portfolio tracker tells you: "You have 4,500 USDC on Upshift, it matures on May 30, you are earning 4.5% APY on it, it represents 1.4% of your total portfolio, and you have 3 other positions maturing in the same week."

Retina is the second kind. This distinction is the core product positioning and should appear in the introduction, the concepts section, and any page where it clarifies what Retina actually does.

## How Retina works

Retina is a client-side web app. When you open useretina.xyz, the app runs entirely in your browser. There is no account, no database, no wallet connection. You add wallet addresses manually (read-only), and the app pulls data directly from public APIs.

Data sources by category:
- **Prices**: CoinGecko, GoldApi
- **EVM wallets and positions**: Zerion
- **Solana wallets and positions**: Helius, Jupiter, Vybe Network, Moralis, Ledger
- **Perps and staking**: Hyperliquid
- **Prediction markets**: Polymarket
- **Yield data (APY, maturity)**: Pendle, DeFiLlama
- **Risk scoring**: Diapleo
- **Airdrops and rewards**: DropsBot, Merkl, Pendle

Every position from every source gets normalized into a single internal data model: chain, protocol, asset class, type, value, maturity (if applicable), APY (if applicable). That normalization is what makes cross-chain and cross-asset views possible.

## Information architecture

**Delete the entire starter template structure.** The current Platform / Analytics / Integrations sections do not apply to Retina at all. Replace with this navigation:

### Getting started
- **Introduction**: what Retina is, the problem (wallet viewer vs portfolio tracker), the local-first promise
- **Beta access**: how to request the password, how to go from password to opened app
- **Quickstart**: open the app, add your first EVM wallet, add your first Solana wallet, see your dashboard load

### Pages
One page per in-app view, mirroring the product's own navigation:
- **Dashboard**: total portfolio value, watchlist, breakdown by asset class, locked vs liquid, chain distribution, top protocols, upcoming maturities
- **Yield Table**: every yield-bearing position with live APY and daily income
- **Polymarket**: per-wallet positions with entry, current price, shares, P&L, days to expiry, win APR
- **Wallets**: every wallet broken down by chain, position count, value, portfolio weight
- **Protocols**: every protocol with positions, APY, total value, maturity, historical performance
- **Maturity Ladder**: time-locked positions sorted into customizable buckets (expired, urgent, near-term, long-term)
- **Risk Scores**: portfolio grade, sanctions check, concentration analysis, per-protocol risk across six dimensions (via Diapleo)
- **Rewards**: claimable airdrops and unclaimed rewards across all wallets
- **History**: snapshots over time, full ledger, click-into past states (including Polymarket state at that snapshot)

### Concepts
- **Portfolio tracker vs wallet viewer**: the core framing, expanded
- **Asset classes**: DeFi positions, prediction markets, perps and staking, physical metals, custom positions
- **Supported chains and protocols**: broad list, not exhaustive
- **Maturity and locked positions**: how Retina tracks time-locked capital
- **APY, daily income, normalization**: how Retina turns raw protocol data into comparable numbers

### Data sources
One page per provider group, explaining what Retina pulls and which views it powers. Pull the actual integrations from `functions/`.

### Privacy and architecture
- **Local-first explained**: no accounts, no database, no wallet connection, browser is the trust boundary
- **Why it matters**: portfolio data is sensitive, sending it to a server means trusting that server with your complete financial picture
- **Tradeoffs**: data lives on one device, switching devices means re-adding wallets, multi-device sync is roadmap
- **Roadmap toward sync**: when multi-device sync ships, raw data still will not touch a server in plaintext; Arcium Multi-Party Computation will process portfolio data across nodes without any single server seeing the raw input

### Roadmap
- Further UI/UX improvements
- Deeper Solana DeFi coverage via RPC reverse-engineering
- Telegram and email alerts for maturing positions
- Opening the public beta

## Source material

When writing pages, read these locations in `UseRetina/Retina`:
- `README.md` for product positioning
- `index.html` for landing copy, brand colors, feature highlights
- `dashboard.html` for the in-app layout and view names
- `setup.html` for the onboarding flow
- `gate.html` for the beta gate UX (do not document implementation details)
- `functions/` for what data sources are actually wired up
- `scripts/` for client-side logic
- `logos/` and `favicon.ico` for brand assets

When something is genuinely uncertain or not in the source, leave a `{/* TODO: confirm */}` comment in the MDX rather than guess. Do not invent feature behavior.

## Content exclusions (never document)

- `api-lab.html` and `solana-api-lab.html` are internal API testing tools for the team only. They must never appear in the docs.
- `regression-checks.js` is internal QA.
- `retina-drops-proxy.js` is internal infrastructure.
- Deployment internals (`wrangler.toml`, `_headers`, Cloudflare config, GitHub repo structure).
- Beta gate implementation details beyond "request the password by DM". Nothing that would help someone bypass it.
- Specific RPC endpoints, API keys, or rate limit numbers from the source code.

## Terminology

- The product is **Retina**. The site at useretina.xyz is **the app**. Never use "the platform", "the dashboard", or "the tool".
- A **position** is any holding Retina tracks (DeFi yield farm, Polymarket bet, staked token, physical metal, custom entry).
- A **wallet viewer** is what existing tools (DeBank, Jupiter, etc.) are. Retina is a **portfolio tracker**. The distinction is load-bearing.
- **Maturity** is the date a time-locked position becomes redeemable.
- **Asset class** is the top-level category (DeFi, prediction market, perp, metal, custom).
- **Protocol** is the specific platform (Pendle, Upshift, Hyperliquid, Polymarket).
- The reader is always **you**, never "the user" or "users".

## Style rules (hard rules, do not break)

- **Never use em dashes.** Use commas, colons, parentheses, or split into two sentences.
- **Numbers are always numerals.** "5 wallets" not "five wallets". "50%" not "fifty percent".
- **No "not X but Y" constructions.** Phrase positively or split into two sentences.
- **No punchy AI-style one-liners.** No sentences like "This changes everything" or "Here is what we built". Write like a person who actually uses the product.
- **Active voice, second person.** "You can add a wallet", not "Wallets can be added".
- **Sentence case for all headings.** Not title case.
- **Bold for UI elements.** Click **Add wallet**.
- **Code formatting for file names, commands, paths, addresses, function names.**
- **Casual but precise.** Match the founder's voice: direct, technical, slightly opinionated, never marketing-speak.
- **One idea per sentence.** Prefer short sentences.

## Components

Use Mintlify components only when they serve a clear purpose:
- `<Steps>` for procedural quickstart-style instructions
- `<Note>` for caveats and reminders
- `<Warning>` for actions that could lose local data (e.g. clearing browser storage)
- `<Card>` and `<CardGroup>` for section landing pages
- `<Tabs>` for parallel EVM vs Solana flows
- `<Accordion>` for FAQs

Do not use components for decoration.

## `docs.json` updates

After generating pages, update `docs.json`:
- Navigation tree matches the IA above
- Site name: "Retina docs"
- Primary color: pull from `index.html` brand styles
- Logo and favicon: point at the existing `/logo/` and `/favicon.ico` files in the docs repo
- Top bar external links: useretina.xyz (main app), https://x.com/UseRetina (X account)

## Things to avoid

- **Do not invent features.** If the source code does not show a feature, do not document it.
- **Do not commit to exhaustive lists.** Retina's protocol coverage is broad and evolving. Pages should say "supports X, Y, Z and others" rather than enumerate.
- **Do not describe roadmap items as shipped.** Multi-device sync, Arcium MPC, the public beta, and alerts are roadmap, not live.
- **Do not write marketing copy.** This is documentation, not a pitch deck. Save the persuasion for the landing page.
