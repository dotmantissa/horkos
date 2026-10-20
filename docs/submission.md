# Horkos submission draft

Project: Horkos

Live: https://horkos-oaths.vercel.app
Repository: https://github.com/dotmantissa/horkos
Project X account: **user to supply**
Demo video: **user to record using docs/demo.md and supply URL**

## Overview (under 150 words)

Ascend's token deployers and approved operators earn a share of token trading fees. Horkos lets them make verifiable promises about that income: lock and vest it over time, or send a percentage to the dead address. Immutable vault terms enforce deposited fees, while holders inspect live amounts, events and an Active, Fulfilled or Breached verdict without connecting a wallet. Recipient diversion permanently marks the pledge Breached. Our two OATH tokens were deployed directly to Elysium Testnet; real vaults receive simulated fees from a clearly labeled mock hook. Real Ascend routing remains unverified. Horkos provides fee-handling evidence other tools can consume, rather than a general token safety rating.

## Current status

Implemented: Foundry contracts and focused/fuzz tests, chain-guarded deployment tooling, two testnet sample oaths/trades, a Next.js-compatible app, live verdict API, and a read-only lens to reduce public RPC load. Public deployment is live; anonymous home/create/detail pages and the token verdict endpoint were verified with HTTP200. Contract tests:37 passing; app unit tests:4 passing; TypeScript and production build passing.

Pending production work: confirm Ascend hook ABI/addresses and recipient permissions; validate adapter with a test launch; independent audit. No mainnet deployment.

Current demo limitation: wallet controls are paused pending investigation of a reported MetaMask site classification in Brave. The public records and local interactive explanation remain available. Do not submit this draft as if wallet end-to-end QA or classification review were complete; see `docs/wallet-security-review.md`.

## After launch

1. Validate real-hook routing and lockability with Ascend; publish adapter tests.
2. Document verifier interoperability and ship a badge/MCP tool; evaluate a listing-reserve pledge.
3. Audit, monitor, and decide mainnet readiness based on actual integration evidence.

No token plans are determined. Support requested: hook-pool ABI/addresses, whether creator recipients can be set or locked, and access to a test launch. Team/pseudonymous identity and final Discord ticket: user to supply/submit.
