# Horkos submission draft

Project: Horkos

Live: https://horkos-oaths.vercel.app
Repository: https://github.com/dotmantissa/horkos
Project X account: **user to supply**
Demo video: **user to record using docs/demo.md and supply URL**

## Overview (under 150 words)

Horkos makes creator fee pledges verifiable. A creator commits fees to vest over time or sends a percentage to the dead address. Immutable vault terms enforce deposited fees, while a public registry shows Active, Fulfilled or Breached. Holders inspect live amounts, events, and a JSON verdict without trusting a tweet. Recipient diversion permanently marks the pledge Breached. The Elysium Testnet demo uses real deployed vaults and a clearly labeled mock fee hook; it does not integrate Ascend's closed hook today. Horkos produces a signal that verifier tools can consume, complementing analytics with a commitment primitive.

## Current status

Implemented: Foundry contracts and focused/fuzz tests, chain-guarded deployment tooling, two testnet sample oaths/trades, a Next.js-compatible app, live verdict API, and a read-only lens to reduce public RPC load. Public deployment is live; anonymous home/create/detail pages and the token verdict endpoint were verified with HTTP200. Contract tests:37 passing; app unit tests:4 passing; TypeScript and production build passing.

Pending production work: confirm Ascend hook ABI/addresses and recipient permissions; validate adapter with a test launch; independent audit. No mainnet deployment.

## After launch

1. Validate real-hook routing and lockability with Ascend; publish adapter tests.
2. Document verifier interoperability and ship a badge/MCP tool; evaluate a listing-reserve pledge.
3. Audit, monitor, and decide mainnet readiness based on actual integration evidence.

No token plans are determined. Support requested: hook-pool ABI/addresses, whether creator recipients can be set or locked, and access to a test launch. Team/pseudonymous identity and final Discord ticket: user to supply/submit.
