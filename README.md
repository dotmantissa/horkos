# Horkos

Trading-fee pledges for token launchers and their holders on Elysium.

**Live app:** https://horkos-oaths.vercel.app · **Network:** Elysium Testnet, chain **99801** · **Fee source:** labeled **mock-hook**.

Horkos is designed for the people and teams launching and operating tokens through Ascend, and for holders who want evidence about their fee promises. “Creator” means the token deployer or approved operator earning a share of token trading fees. Ascend is the launch platform; Elysium is the chain. The current demo's two OATH tokens were deployed directly to Elysium Testnet, not launched through Ascend.

A launcher pledges fee income to vest over time or sends a percentage to the dead address. A vault enforces immutable terms for deposited fees. Holders inspect a public Active / Fulfilled / Breached verdict, amounts, event history, and a machine-readable API without connecting a wallet. Recipient changes permanently mark an oath Breached, including changes later reversed. A pledge verifies fee handling; it is not a safety rating for the token or its operator.

The homepage includes a local interactive walkthrough of the default 1% fee / 25% launcher-share model. Slider, settlement-stage, burn/vest and diversion controls illustrate the mechanism without sending transactions. Animated fee paths have pause controls and respect reduced-motion settings. Illustrated values are separate from the live chain totals.

**Wallet actions temporarily paused:** a user reported a MetaMask malicious-site classification in Brave. The cause remains unresolved. Read-only pages/API work, but the frontend blocks wallet requests and transaction controls until review. See [review evidence and handoff](docs/wallet-security-review.md). Do not bypass the warning or claim it is a confirmed false positive.

## Run and verify

Requires Foundry, Python 3, and Node **22.13+**.

```sh
forge test --root contracts -v
cd app
npm ci
npm run typecheck
npm test
npm run dev
```

The app deploys to Vercel with native Next.js App Router. The existing Vinext target supports Cloudflare Workers through Sites. No database, indexer service, or paid RPC key is required. The public RPC is paced, reads share in-flight requests, verdicts cache for five seconds, and failures cool down for thirty seconds. Client polling stops on error. The Vercel production build is `npm run build:vercel` in `app/`; `npm run build` produces the Sites Worker build.

Vercel project root is `app/`, framework Next.js, Node 22. Use `vercel deploy --prod --local-config app/vercel.json --scope mantissas-projects` from the repository root. Both root and app upload excludes protect local environment files. The app needs no server signing key; users sign testnet transactions in their own wallets. Public deployment details are recorded in [the Vercel manifest](deployments/vercel.json).

## Contracts and demo

| Contract | Elysium Testnet address |
| --- | --- |
| TestCoin (vesting demo) | `0xA7681A7c27613cC99c6Fe9b3b851F16CBC8eE5E3` |
| MockFeeHook | `0xcc1CaD93C0fE2EAC79dAb2c3647b8Ec0d77f2995` |
| HorkosRegistry | `0xd3e9D3E82c2830250a4F9Ef62300A22C8419CFA2` |
| TestCoin (burn demo) | `0xD4D1C7CED7d4108e80B97b5d59B686A6E736c313` |
| Vesting vault (oath 1) | `0x2a6f0B43A81CD7A468B3cbbD1B141aC3cF326d65` |
| Burn vault (oath 2) | `0x2e335158ce63c51648666DA70FdBF13982b70023` |
| HorkosLens (read-only aggregator) | `0xaCAfd122a7D30e4a7F7651fCB108255F0d48a759` |

[Full transaction manifest](deployments/testnet-99801.json) · [Explorer registry](https://elysium.kinetiq.xyz/testnet-explorer/address/0xd3e9D3E82c2830250a4F9Ef62300A22C8419CFA2) · [Storage gate proof](deployments/storage-99801.json)

Both demo oaths received 7.5 OATH from three simulated trades. Oath 1 initially locks all 7.5 OATH for a one-day cliff then vests through day 30. Oath 2 settled 3.75 OATH to the dead address and 3.75 OATH to the creator. These are separate mock tokens, both with 18 decimals and symbol OATH.

To deploy: create a throwaway testnet wallet, save `PRIVATE_KEY=0x…` in ignored root `.env`, and fund on chain 99801. Never reuse a real-funds wallet. `python3 scripts/deploy.py --network testnet --rpc https://testnet-rpc.elysium.kinetiq.xyz` persists each confirmed transaction and resumes from its public manifest. Check receipts before retrying any uncertain broadcast. For local verification, start Anvil with chain 99801 and use `--network local --rpc http://127.0.0.1:8547`. Local and testnet manifests are separate; app uses testnet only. Export ABIs after contract changes with `python3 scripts/export-abis.py`.

## Scope and limits

TestCoin and MockFeeHook are mocks. A mock trade **only transfers the fee**, not an AMM swap or token purchase: 1% of the declared notional, with 25% of that fee sent to the creator recipient and 75% to the mock protocol recipient. Demo token registration is a creator assertion, not proof of Ascend launch provenance.

OathVault and HorkosRegistry enforce deposited fees and expose recipient diversion. They do not compel all future fees to enter the vault. Ascend's real hook ABI and recipient permissions are unverified. Dead-address transfers do not reduce total supply. Supported assets are ordinary non-rebasing, non-fee-on-transfer ERC-20s. The contracts are testnet prototypes, unaudited, without upgrade or emergency withdrawal paths.

Fulfilled means the duration ended and all received fees were settled **at the checked block**. Later fees can require settlement again; later diversion can still breach the oath. Burn releases are settlement-time transfers; vest releases use the original schedule for new deposits.

[Contract semantics](docs/contract-semantics.md) · [API schema](docs/api.md) · [90-second demo](docs/demo.md) · [Submission draft](docs/submission.md) · [Original architecture](docs/architecture-plan.md)

Roadmap: confirm Ascend hook integration, listing-reserve pledge, verifier adapter, embeddable badge, MCP tool, then independent audit before considering mainnet. No token plans are determined.
