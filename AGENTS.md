# Retina documentation agent instructions

## About Retina

Retina is a local-first portfolio tracker for crypto and adjacent assets. It runs entirely in the browser at https://useretina.xyz, currently in password-gated private beta (access by DM to @UseRetina on X).

Audience: crypto users (from beginners to multi-wallet DeFi farmers, prediction market traders, people who already track positions in spreadsheets).

## The mental model: snapshots

The single most important concept in Retina is the **snapshot**. Every page in the app reads from the currently selected snapshot, shown at the top of the sidebar (for example `Snapshot #1 | 2026-05-12`). You create snapshots manually when entering the setup the first time or by using the  `+ Snapshot` button in the top-right. Each snapshot captures the full state of your portfolio at that moment: every position, every wallet, every Polymarket market, every metal holding, the prices, the APYs, the maturities.

You are not looking at a live ticker. You are looking at a frozen point in time, and the value of the product is comparing those points over time. The Dashboard says "Portfolio Total $X, +$X since previous snapshot" because that's what the snapshot model gives you: a delta against the prior snapshot.

Every page in the docs must respect this. When describing what a page shows, frame it as "for the active snapshot, the X page shows...", not "live, real-time...". Live data only enters when you create. The exception to this are things that are pulled live by the API (all info on the Polymarket page, and the live yields (X% APY) in the Yield Table on the Dashboard).

## The setup flow

A first-time user goes through three screens in this exact order. The Quickstart page must walk through all of them.

1. **Gate** (`gate.html`): password entry to unlock the app on this browser and device. No accounts. This is the case during private beta only.
2. **Setup wizard** (`setup.html`): a 5-step form where you enter the addresses and holdings that will populate your first snapshot. Steps are:
   1. **EVM Wallets** (required). Paste one or more EVM addresses. Each row has a label, an address field, a check button, and a "Use for Polymarket" checkbox. The wizard fetches positions live to validate.
   2. **Solana Addresses** (optional). Paste Solana addresses with the same pattern.
   3. **Polymarket** (optional). Paste Polymarket wallet addresses separately. You can reuse an EVM wallet here by checking "Use for Polymarket" in step 1, or you can add Polymarket-specific addresses in this step.
   4. **Manual Positions** (optional). Add positions Retina cannot detect from public chain data: CEX balances, niche chains, private vaults, cold wallets, anything else.
   5. **Metals** (optional). Enter physical gold and silver holdings by weight. Live spot prices come from GoldApi.
3. **Dashboard** (`dashboard.html`): after pressing `Create Snapshot →` at the bottom of setup, the first snapshot is captured and the dashboard loads.

The wizard's footer always shows a running summary like `2 positions · 7 wallets · $7,516 ready`.

## The problem Retina solves (use this framing where it helps)

Most "portfolio trackers" on the market are actually **wallet viewers**: they show what is in a specific wallet on a specific chain. DeBank does this for EVM, Jupiter for Solana, Polymarket has its own page, every yield protocol has its own page. None of them talk to each other.

A wallet viewer tells you: "You have 4,500 USDC on Upshift."

A portfolio tracker tells you: "You have 4,500 USDC on Upshift, it matures on May 30, you are earning 4.5% APY on it, it represents 1.4% of your total portfolio, and you have 3 other positions maturing in the same week."

Retina is the second kind, which is an innovation. The distinction belongs in the introduction, the dedicated concepts page, and anywhere else it sharpens an explanation of what the product actually does.

## How Retina works

Retina is a client-side web app. When you open useretina.xyz, the app runs entirely in your browser. There is no account, no database, no wallet connection, no email. You add wallet addresses manually (read-only), and the app pulls data directly from public APIs. A thin stateless proxy is used for a few providers to avoid shipping API keys to the client; the proxy stores nothing.

Data sources by category:
- **Prices**: CoinGecko (crypto), GoldApi (metals)
- **EVM wallets and positions**: Zerion
- **Solana wallets and positions**: Helius, Jupiter, Vybe Network, Moralis, Ledger
- **Perps, staking, and spot on Hyperliquid**: Hyperliquid public API
- **Prediction markets**: Polymarket public API
- **Yield data (APY, pool stats, maturity)**: Pendle, DeFiLlama
- **Risk scoring**: Diapleo (bring-your-own API key; see Risk Scores page below)
- **Airdrops and rewards**: DropsBot, Merkl, Pendle

Every position from every source is normalized into one proprietary internal model: `source`, `snapshot`, `date`, `wallet`, `chain`, `protocol`, `type`, `token`, `value`, `asset_class`, `maturity` (optional), `apy` (optional). The Positions Explorer page in the app is the rawest view of this model and is worth using as a reference when documenting how data flows.

## Information architecture

The app sidebar has exactly these items in this order: Dashboard, Polymarket, Wallets, Protocols, Maturity Ladder, Positions, Risk Scores, Rewards, History. The docs IA mirrors that.

### Getting started
- **Introduction**: what Retina is, the problem (wallet viewer vs portfolio tracker), the local-first promise, the snapshot model in one paragraph
- **Beta access**: how to request the password by DM, what the password unlocks (the app on this browser and device, until you clear site data)
- **Quickstart**: the full first-time flow from password to first snapshot, covering all 5 setup steps including the optional ones

### Pages
One docs page per sidebar item, in sidebar order. Each docs page describes what is on the corresponding app page, what it is for, and where the data comes from.
- **Dashboard**: Portfolio Total card with delta vs previous snapshot; Metals card with editable holdings and current spot; Active Protocols card showing protocol count and total position count; Watchlist card with editable token prices (BTC, ETH, SOL, HYPE shown by default, customizable via the ✎ icon); Economic Asset Allocation pie split by asset class; Locked vs Liquid split; Chain Distribution; Top Protocols and Holdings by Value; Upcoming Maturities grouped by urgency; **Yield Table** as a section here, listing every yield-bearing position with Protocol, Value, APY, Estimated/Day, Source, and an optional Manual APY override field.
- **Polymarket**: per-wallet Polymarket positions. Header cards show pUSD cash balance and open position value, and the page lists each open position with Market, Side (Yes/No), Ends, Days, Win APR, Shares, Avg entry, Current price, Value, P&L, and P&L%. Positions are grouped by Polymarket wallet (each wallet shown as a card with total pUSD cash, position count, and open P&L).
- **Wallets**: Wallet Value summary split EVM / Solana / Other; a wallets table with Wallet (label and address), Chains covered, Positions count, Value, and portfolio weight %; below the table, a **Spot Wallet Holdings** view listing every token across wallets with the wallet count and total value per token.
- **Protocols**: every protocol you hold positions in, as cards showing protocol name, total value, position count, asset types in that protocol, APY, and estimated daily income. Asset filter chips at the top (Alt, BTC, ETH, HYPE, USD) filter by asset class. Sort options include Value, Positions, Asset types, APY.
- **Maturity Ladder**: every time-locked position sorted into buckets by how close they are to maturity. Default buckets: **EXPIRED** (maturity passed, redeemable now), **TODAY** (matures today), **URGENT** (very soon), **NEAR** (next few weeks), **MID** (next month or two), **FAR** (further out), **LOCKED** (locked without a fixed maturity). Bucket thresholds are customizable. Above the ladder, a summary header shows count and value per bucket. Below it, an Unlock Runway chart and a filterable table with Bucket, Maturity date, Days from today, Wallet, Protocol, Token, Instrument, and Value.
- **Positions**: the **Positions Explorer**. The rawest view in the app. One row per position with columns Source, Snapshot, Date, Wallet, Chain, Protocol, Type, Token, Value, Asset Class, Maturity. Filter dropdowns above the table for Wallets, Chains, Protocols, Assets, Types, Sources. A search box for token / protocol / notes. Buttons for `+ Add position` (manual entry) and `Export` (to csv). The page also shows a "dust hidden" counter for positions below a value threshold.
- **Risk Scores**: powered by Diapleo. **Two tabs**: **Wallet Scan** (paste a wallet address, get a portfolio grade A-F, sanctions check against OFAC/EU/UK lists, concentration analysis, risk surface across 6 dimensions including Credit, Counterparty, Liquidity, Oracle, Smart Contract, Liquidity Trap, and a per-protocol exposure table with composite risk score and contribution to portfolio risk). **Protocols** tab (a global index of every protocol Diapleo tracks, sortable by composite risk, with category, chains, TVL, and incident signals). **Critical:** wallet scanning requires the user to paste their own Diapleo API key. The free tier gives limited protocol risk; Diapleo Pro is needed for wallet scanning, sub-score breakdowns, and higher rate limits. Document the bring-your-own-key requirement explicitly and link to https://diapleo.com/profile for key generation. Without a key, the user can still see the global Protocols index.
- **Rewards**: claimable airdrops and unclaimed protocol rewards across all wallets. Summary cards for Claimable Rewards (USD), Eligible Airdrops (count), Reward Checks (count). Below, a list of individual rewards with Source (DropsBot, Merkl, Pendle), Wallet, the specific claim (token amounts, already-claimed amounts), USD value, status (Claimable, Eligible, Expiring, Unknown Value, Check Required, Error), and a link to the protocol page where the user can actually claim. Retina never claims on your behalf. The app is read-only.
- **History**: snapshot-to-snapshot timeline. Summary cards: Latest Saved Value, Net Change, Timeline (snapshot count), Average per Day, Best Snapshot Change, Worst Snapshot Change, Latest Polymarket value, Latest Locked Capital %. Charts: Portfolio Value over time (toggleable layers for Total, Positions, Polymarket, Metals), Latest Asset Split pie, Asset Mix Over Time stacked area, Change by Snapshot bar chart. A **Snapshot Ledger** table listing every snapshot with date, total, change, asset split, Polymarket value, metals value, locked %, position count, wallet count, top protocol, and Open / Delete buttons per row.

### Concepts
- **Snapshots**: what they are, when to create them (`+ Snapshot` button), where they live (browser storage), how the active snapshot affects every other page, what gets captured (positions, prices, APYs, Polymarket state, metals), and the `🗑 Clear all` button that wipes everything
- **Portfolio tracker vs wallet viewer**: the core framing, expanded with examples
- **Asset classes**: in Retina, asset class means **economic exposure category**, not position type. Classes can for example be: **USD** (stablecoins and USD-denominated), **BTC** (BTC and BTC-backed such as LSTs), **ETH** (ETH and ETH-derived such as LSTs), **HYPE** (Hyperliquid native and derivatives such as LSTs), **Other** (everything else), **Metals**, **Polymarket**.
- **Position types**: separate from asset class. The types you can see in the app include Spot / Wallet, Staking, Locked, LP Position, Yield Vault, Deposit / CEX, Reward. One position has one type.
- **Maturity and locked positions**: where the maturity date comes from per protocol (Pendle PT redemption date, fixed-term vault lock-end, Polymarket market resolution, manual entry for custom positions), and how the ladder bucketing works
- **Position model**: every position carries `source`, `snapshot`, `date`, `wallet`, `chain`, `protocol`, `type`, `token`, `value`, `asset_class`, `maturity` (if applicable), `apy` (if applicable). Explain how APY is derived: protocol-reported when available (Pendle, Hyperliquid staking, many EVM vaults), DeFiLlama fallback for pools without a direct report, live funding rate for perps. Daily income is APY applied to current value, divided to a per-day number; note that this assumes APY is constant over a day and real yields fluctuate.

### Data sources
- **Overview**: a table mapping each provider to what it powers
- **Prices** (CoinGecko, GoldApi)
- **EVM wallets and positions** (Zerion)
- **Solana wallets and positions** (Helius, Jupiter, Vybe Network, Moralis, Ledger)
- **Perps and staking** (Hyperliquid)
- **Prediction markets** (Polymarket)
- **Yield data** (Pendle, DeFiLlama)
- **Risk scoring** (Diapleo, with explicit bring-your-own-key instructions and a link to https://diapleo.com/profile)
- **Airdrops and rewards** (DropsBot, Merkl, Pendle)

### Privacy and architecture
- **Local-first explained**: no account, no database, no wallet connection, no analytics on portfolio content. Wallets and snapshots live in browser storage. Direct API calls from the browser, with a thin stateless proxy for keyed providers.
- **Why it matters**: portfolio data is the closest thing to a complete financial picture. Hosted trackers join it once and forever. Retina never joins it server-side; the join happens locally in your browser.
- **Tradeoffs**: data is per-device and per-browser. Clearing site data deletes it. No background snapshotting when the tab is closed. No team-shared portfolios.
- **Roadmap toward sync**: planned multi-device sync via Arcium Multi-Party Computation so portfolio data is split across nodes and no single server sees the raw input. Not shipped. See Roadmap.

### Roadmap
- UI/UX improvements
- Deeper Solana DeFi coverage via direct RPC reverse-engineering for protocols providers do not surface well
- Telegram and email alerts for maturing positions
- Multi-device sync (Arcium MPC)
- Opening the public beta

## Source material

When writing pages, read these locations in `UseRetina/Retina`:
- `README.md` for product positioning
- `index.html` for landing copy, brand colors, feature highlights, primary brand color
- `setup.html` for the exact 5-step setup flow
- `dashboard.html` for the in-app layout, sidebar order, and view names
- `gate.html` for the beta gate UX (do not document its internals)
- `functions/` for the data sources actually wired up. This is where you confirm which providers are used for what.
- `scripts/` for client-side logic, position normalization, snapshot creation
- `logos/`, `favicon.ico` for brand assets

When something is genuinely uncertain or not visible in the source, leave a `{/* TODO: confirm */}` comment in the MDX rather than guess. Do not invent feature behavior. Do not invent provider details.

## Content exclusions (never document)

- `api-lab.html` and `solana-api-lab.html`: internal API testing tools for the team only. They must never appear in the docs.
- `regression-checks.js`: internal QA.
- `retina-drops-proxy.js`: internal proxy infrastructure.
- Deployment internals (`wrangler.toml`, `_headers`, Cloudflare Pages configuration, the GitHub repo structure, the `BETA_DEPLOY.md` file).
- Beta gate implementation details beyond "request the password by DM". Nothing that would help bypass it.
- Specific RPC endpoints, API keys, rate limit numbers, or proxy URLs from the source code.
- Internal scripts.

## Terminology

- The product is **Retina**. The site at useretina.xyz is **the app**. Do not write "the platform", "the dashboard" (when referring to the whole product), or "the tool".
- The user is always **you**. Never "the user" or "users".
- A **snapshot** is a captured point-in-time of the full portfolio. The verb is "create a snapshot" or "take a snapshot".
- A **position** is any holding Retina tracks.
- **Source** means the data provider that surfaced the position (zerion, helius, jupiter, vybe, moralis, ledger, hyperliquid, polymarket, manual, pendle, defilama, merkl, dropsbot).
- **Wallet viewer** is what existing tools (DeBank, Jupiter, etc.) are. Retina is a **portfolio tracker**. The distinction is load-bearing and what makes Retina special and innovative.
- **Maturity** is the date a time-locked position becomes redeemable.
- **Manual position** is the in-app term for a position you enter by hand.
- **Protocol** is the specific platform (Pendle V2, Hyperliquid, Upshift, Polymarket, Yearn V3, etc.).

## Style rules (hard, do not break)

- **Never use em dashes.** Use commas, colons, parentheses, or split into two sentences.
- **Numbers are always numerals.** "5 wallets", "50%", "30 minutes". Never spell out.
- **No "not X but Y" constructions.** Phrase positively or split into two sentences.
- **No punchy AI one-liners.** No "this changes everything", "here is what we built", "the future of...". Write like someone using the product.
- **Active voice, second person.** "You add a wallet", not "Wallets can be added".
- **Sentence case for headings.** Not title case.
- **Bold for UI elements.** Click **+ Snapshot**.
- **Code formatting** for file names, commands, paths, addresses, function names, exact button labels with special characters.
- **Casual but precise.** Direct, technical, slightly opinionated.
- **One idea per sentence.** Prefer short sentences.

## Components

Use Mintlify components when they earn their place, eg.:
- `<Steps>` for procedural flows like the 5-step setup
- `<Note>` for caveats and gotchas
- `<Warning>` for actions that destroy local data (`🗑 Clear all`, clearing site data, switching browsers without exporting)
- `<Card>` and `<CardGroup>` for landing pages and "next steps" sections
- `<Tabs>` for parallel flows (EVM vs Solana, Wallet Scan vs Protocols on Risk Scores)
- `<Accordion>` for FAQ-style content

## `docs.json` updates

After generating pages, update `docs.json`:
- Navigation tree matches the IA above (sidebar order: Dashboard, Polymarket, Wallets, Protocols, Maturity Ladder, Positions, Risk Scores, Rewards, History)
- Site name: `Retina docs`
- Primary color: pull from `index.html` `:root` brand styles in `UseRetina/Retina`
- Logo: point at `/logo/light.svg` and `/logo/dark.svg`
- Favicon: `/favicon.ico`
- Top navbar external links: `useretina.xyz` and `https://x.com/UseRetina`
