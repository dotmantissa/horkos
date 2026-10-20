# Horkos: Architecture and Build Plan

Oct 20, 2026 · @Melvin

Horkos lets creators who launch on Ascend make binding, on-chain pledges about their fee share, so holders can verify a creator's promises instead of trusting them.

## Why this scores

Each of the four judging criteria (25 points each) maps to something the demo can show in 90 seconds.

| Criterion | What Horkos shows | Proof in the demo |
| --- | --- | --- |
| Execution | Contracts deployed on Elysium testnet (chain 99801), unit-tested vesting and burn math, a live creator page that reads real on-chain events | Explorer links, passing test run, live page |
| Usefulness | A holder can check a creator's pledge on-chain instead of trusting a tweet; a creator gets a credible signal that costs nothing to verify | Pledge status (Active, Fulfilled or Breached) computed from chain state |
| Long-term vision | Swap the mock fee hook for Ascend's real one once public, feed Ascertain and similar verifiers, ship a badge and an MCP tool | Roadmap section of the submission |
| Originality | A binding primitive on the creator fee share. Existing entries measure, scan or launch; none binds a creator | Gap table below |

What the winners lists suggest: trust and risk tooling placed well on HyperEVM, and novel hook-level mechanisms won on Uniswap. Horkos is a mechanism in the trust category, not a dashboard.

## Where it fits

Nothing I found on Elysium lets a creator bind themselves; existing projects measure or launch. This is based on public pages and README summaries, not on reading their contracts.

| Project | What it does | Overlap with Horkos |
| --- | --- | --- |
| [Ascertain](https://github.com/victorhez/ascertain) | Integrity and readiness layer: indexer, signal engine, verifier, dashboard, REST, MCP, x402 | Closest rival. Horkos is complementary: it produces a signal Ascertain could read |
| [Pantheon](https://pantheonindex.com/) | Index token of top Ascend coins; its DELPHI check can block flagged coins | Consumes trust signals; has no commitment primitive |
| [Elysium ecosystem page](https://elysium.kinetiq.xyz/ecosystem) launchpads (Chainzy, PerpMe, Neuriio, Citadel, Montra, Signal) | Different ways to launch tokens | None; Horkos sits after launch |
| [elysiumeco.xyz](https://elysiumeco.xyz/) | Ecosystem dashboard of wallets, volume and tokens | Analytics only |

The gap: Ascend's docs give the deployer 25% of the 1% trading fee by default, or 50% to an Ascend-approved active creator or takeover operator. Today a creator can say what they will do with that stream, but nobody can enforce or verify it. Horkos makes the pledge enforceable.

## Architecture

&#91;embedded content: Horkos architecture · 4 contracts, 1 app, 1 API\]

A creator calls `createOath` on the registry. Trades on the mock hook send the creator's fee share to the vault, anyone can call `settle()`, and the app reads events from both contracts to show status and serve the JSON verdict.

## Contracts

Four small Solidity contracts, built and tested with Foundry. The fee hook is a labeled mock because Ascend's real contracts are not public.

| Contract | Job | Real or mock |
| --- | --- | --- |
| TestCoin | Plain ERC-20 so the demo has a token to launch | Mock |
| MockFeeHook | Simulates a pool charging a 1% fee on swaps and sending the creator's 25% share to a fee recipient address the creator sets | Mock of Ascend's closed hook pool |
| OathVault | Receives the creator fee share and applies the pledge: vest it to the creator on a cliff plus linear schedule, or send a set percentage to a burn address. Anyone can call `settle()` | Real |
| HorkosRegistry | Records each pledge (token, vault, mode, terms), emits events, and exposes `status(oathId)` as Active, Fulfilled or Breached | Real |

Breach rule: a pledge is Breached if the fee recipient on the hook is no longer the vault. The demo flips the recipient and the page turns red.

Tests to write first: vesting before, at and after the cliff; burn percentage rounding; `settle()` called twice; recipient change flips status. Aim for 15 or more focused tests.

Open assumption: Ascend's docs do not say whether a creator's fee recipient can be changed, set or locked, and the Ascend team decides who gets the 50% share. If it is not, the vault design needs a different binding point, which is why the hook adapter is kept thin and the question is listed under support needed from Ascend.

Fits Ascend's own design: the docs let creators set aside a dynamic share of their creator fees toward a future HyperCore listing, without saying how the amount is set. A third pledge type, a listing-reserve pledge, would make that optional set-aside binding and verifiable. The lifecycle page lists no locks or commitments today, which confirms the gap; it does not say Ascend would count them toward Ascended.

## App and API

A small Next.js app on a free host, reading events straight from the Elysium RPC with viem. No database, so the running cost is $0.

| Page or endpoint | Purpose |
| --- | --- |
| `/` | One-paragraph explainer and a live list of oaths |
| `/create` | Connect a wallet, pick a token and a pledge type, send the transaction |
| `/oath/[id]` | Status badge, unlock or burn schedule, amounts released, event log, breach alert |
| `GET /api/oath/[token]` | JSON verdict other tools can call |

The JSON verdict carries: token, oathId, mode, terms, status, locked, released, burned, nextUnlock, checkedAt, and a `source` field saying `mock-hook` until Ascend's real hook is wired in. I have not verified Ascertain's schema, so Horkos documents its own and offers an adapter.

RPC note: Elysium lists Alchemy, Quicknode and Chainstack as providers. Use a free-tier key if the public RPC rate-limits, and cache reads for a few seconds.

## Build plan

Times are Lagos. The real deadline is 11:59 PM PT Tuesday, which is 7:59 AM Wednesday here. Submit by 6:00 AM and treat the last two hours as buffer. Each gate must pass before the next block starts.

| Block | Time | Deliverable | Gate |
| --- | --- | --- | --- |
| 0. Gas test | Tue 12:30 to 13:30 | Throwaway wallet funded from the faucet; a trivial contract deployed and visible in the explorer | Do not start block 1 until this passes. If the faucet fails, ask in the Ascend Discord |
| 1. Contracts | 13:30 to 16:30 | TestCoin, MockFeeHook, OathVault, HorkosRegistry with Foundry tests | All tests pass locally |
| 2. Deploy | 16:30 to 17:30 | Contracts on testnet, addresses recorded, one sample oath, a few mock trades | Events visible in the explorer |
| 3. App and API | 17:30 to 21:30 | Pages and the JSON endpoint reading live chain data | Oath page shows real, current data |
| 4. Polish and docs | 21:30 to 23:00 | README, short docs page, site live on a public URL, project X account created | A stranger can open the site and understand it |
| 5. Demo and text | 23:00 to 01:00 | 90-second video recorded; submission text drafted | Video under 120 seconds, mock labeled on screen |
| 6. Rest or buffer | 01:00 to 05:00 | Sleep, or fix whatever is broken | None |
| 7. Final check and submit | 05:00 to 06:00 | Fresh-browser test, links checked, ticket opened in the submissions channel | Ticket submitted |

If time slips, cut in this order: burn mode (keep vesting), then the JSON polish, then the docs page. Never cut deployed contracts or the live oath page; they carry the Execution score.

## Demo script

The form asks for 60 to 120 seconds. Aim for 90 and say "mock fee hook" out loud so no one thinks it is Ascend's real contract.

1. 0:00 to 0:10. The problem: creators promise things about their fees, and holders can only trust them.
2. 0:10 to 0:30. A creator opens `/create`, picks a token, chooses "vest my fee share over 30 days", and sends the transaction.
3. 0:30 to 0:55. Mock trades run; fees flow into the vault; the oath page updates with released and locked amounts.
4. 0:55 to 1:10. The holder view and the JSON verdict from `/api/oath/[token]`, which a tool like Ascertain could read.
5. 1:10 to 1:25. The creator switches the fee recipient away; the page flips to Breached.
6. 1:25 to 1:30. Roadmap in one line: plug in Ascend's real hook once it is public.

## Submission

The Discord form has six parts. This table says what to put in each; the final wording gets drafted once the build exists, so it states only what is true on submission day.

| Form part | What to write |
| --- | --- |
| Project and links | Horkos; project X account; live site; public GitHub repo with README |
| Overview | What: enforceable creator fee pledges. Who: Ascend creators and their holders. Problem: promises about fees cannot be verified. Why use it: free, on-chain, readable by other tools. Keep it under 150 words |
| Demo | The 90-second video, with the mock labeled |
| Current status | Working: contracts, tests, live page, JSON endpoint. In development: Ascend hook adapter, badge. Before launch: audit, real-hook integration, mainnet deploy. Timeline in three milestones |
| After launch | Adapter for Ascend's real hook, Ascertain and Pantheon integration, embeddable badge, an MCP tool for agents |
| Team | Fill in your details; pseudonymous teams are allowed |

Token plans: say none are determined and do not invent one. Support needed from Ascend: the hook-pool ABI and addresses, whether a creator's fee recipient can be set or locked, and a test launch to validate against.

## Risks and open assumptions

| Risk | Fallback |
| --- | --- |
| Faucet or deploy fails | Ask for gas in the Ascend Discord; try another RPC provider; do not start building until it passes |
| Ascend's real hook differs from the mock | Keep the adapter thin, label the mock everywhere, list the ABI request under support needed |
| Reads as a plain lock vault | Lead the demo with the pledge, the verifiable status and the breach flip, not the vault |
| Overlaps Ascertain | Present Horkos as a signal Ascertain can read, not a competitor |
| Public RPC rate limits | Use a provider free tier and short caching |
| Fee splits differ across sources | Docs checked: build to the 25% default deployer share and say so; the 50% case needs Ascend approval |
| Time overrun | Cut burn mode first, then JSON polish, then docs |

Two things for the build agent. Check where the Ascend MCP server comes from before installing it, since an MCP server can run code on your machine. And never give the agent a wallet that holds real funds: use a throwaway testnet wallet only.

Sources: [Ascend litepaper](https://ascendlaunch.gitbook.io/docs), [Elysium build page](https://elysium.kinetiq.xyz/build), [Elysium ecosystem](https://elysium.kinetiq.xyz/ecosystem), [Hyperliquid Korea winners](https://wublockchain.medium.com/hyperliquid-korea-hackathon-wrap-up-a-quick-look-at-13-winning-projects-8c613b14085c), [Unichain Infinite winners](https://www.uniswapfoundation.org/blog/announcing-the-first-unichain-infinite-hackathon-winners).
