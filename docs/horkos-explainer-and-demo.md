# Horkos: product explanation, recording guide and submission pack

Prepared October 20, 2026. The product is spelled **Horkos**, matching the website and repository. This guide describes the deployed Elysium Testnet prototype and separates it from planned Ascend integration.

## Start here: the fastest honest demo

Open https://horkos-oaths.vercel.app. Connect only your throwaway Elysium Testnet wallet before recording, if you want the connected address visible. Show the interactive fee illustration, then the real vesting and burn records, then the public JSON verdict. You can record this in approximately 100–110 seconds without waiting for a transaction. The optional transaction sequence later in this document is available if you want stronger execution evidence.

Wallet connection and transaction controls are restored for your demo at your explicit request. The reported MetaMask domain warning remains unresolved. Enabling the controls does not clear that warning or establish a false positive. Do not disable wallet security settings, use a real-funds wallet, or expose a private key or recovery phrase in the recording. You can record the entire public-record route without connecting if the warning prevents a comfortable wallet demonstration.

## 1. What Horkos is

Horkos is a commitment system for token launchers and the people holding their tokens. A token operator can make a specific pledge about their share of token trading fees: lock that income and release it over time, or allocate a defined percentage to the dead address. A vault applies those terms to deposited funds. A public registry and website show the pledge, amounts, events and whether the pledge is Active, Fulfilled or Breached.

The short pitch is: **Ascend creates recurring trading-fee income for token operators. Horkos lets them make verifiable commitments about that income.**

The promise becomes a concrete set of rules rather than a statement alone. Holders can inspect how much reached the vault, how much remains there, what was released, what went to the dead address, and whether fee routing was changed after the pledge. They do not need a wallet to read that evidence.

An “oath” is the recorded pledge for one token. It names the token, launcher, vault, pledge mode and immutable terms. The current registry supports one oath per token.

## 2. Who Horkos is for

**Token launchers and project operators.** These are people or teams deploying and operating tokens through a launch platform. In Ascend’s documented design, the trading-fee recipient can be the original token deployer, an approved active creator or an approved takeover operator. This is what “creator” means in our original architecture and contracts.

Their reason to use Horkos is to make a measurable commitment about their fee income. For example: “My deposited fees stay locked for a one-day cliff and release through day 30,” or “Half of my deposited fee income is sent to the dead address.” The operator receives an inspectable record of that commitment.

**Token holders and communities.** Their reason to use Horkos is to check the fee pledge rather than rely on an announcement. They can answer: What exactly was promised? Has money reached the vault? Where did it go? Has the operator redirected the fee recipient?

**Ecosystem tools.** A verifier, dashboard or other application can consume the public JSON verdict. Horkos exposes evidence another tool can interpret. Integrations with named ecosystem tools are future work, not completed integrations.

A pledge does not certify that the operator is honest in every respect. It does not certify that the token is a good investment or establish a general token safety score.

## 3. What Ascend is, and where the tokens launch

Ascend is building token launch and lifecycle infrastructure on Elysium. **Elysium is the blockchain; Ascend is the launch platform using that blockchain.** Tokens launched through Ascend are intended to enter its launch-pool framework, rather than being launched by Horkos.

Ascend’s proposed model supports continued trading, project visibility and liquidity development after launch. Builders receive trading-fee income. Qualifying projects can receive ecosystem support. HYPE stakers participate through a separately described staking-yield and reward model. The intended token lifecycle moves from Launch to Ascended status and potentially toward HyperCore spot and eligible HIP-3 perpetual markets.

Those later stages depend on project performance, liquidity, technical requirements, costs and agreement with the relevant market operators. Launching through Ascend does not guarantee a later listing. Ascend’s litepaper describes a proposed design; selected implementation details remain under development.

**Important distinction for this submission:** our two OATH demo tokens were deployed directly to Elysium Testnet for Horkos. They were not launched through Ascend. The demo uses our mock fee hook. It demonstrates the pledge mechanism but does not prove an integration with Ascend’s actual pools.

Official sources:

- Ascend overview: https://ascendlaunch.gitbook.io/docs
- Trading-fee design: https://ascendlaunch.gitbook.io/docs/trading-fee-breakdown
- Token lifecycle: https://ascendlaunch.gitbook.io/docs/the-ascend-token-lifecycle
- Implementation controls and risks: https://ascendlaunch.gitbook.io/docs/implementation-controls-and-risk

## 4. Where the trading-fee income comes from

Ascend documents a 1% token trading fee. In the default arrangement, the token deployer receives 25% of that fee. An Ascend-approved active creator or takeover operator can receive 50% instead. The arrangements are alternatives, not cumulative payments. The percentages apply to the collected trading fee, not to the whole trade. Separate swap fees and network fees may also apply.

Example using the default share:

| Step | Amount on 1,000 units of trading volume |
| --- | --- |
| Declared trading volume | 1,000 units |
| Token trading fee: 1% | 10 units |
| Default launcher share: 25% of the fee | 2.5 units |
| Remaining protocol portion in our mock | 7.5 units |
| 50% burn pledge applied to the 2.5-unit share | 1.25 units to dead address; 1.25 units to launcher |

Our mock uses the default 25% launcher share. It transfers the trading fee in an ERC-20 test token called OATH. **It does not perform a swap or deliver purchased tokens.** The hypothetical 1,000 OATH trade transfers only a 10 OATH fee from the trader; it sends 2.5 OATH to the configured launcher recipient and 7.5 OATH to the mock protocol recipient.

The fee asset and routing in Ascend’s real implementation still need verification. Do not describe our OATH fee asset as confirmation of Ascend’s production fee asset.

## 5. How a pledge works

1. The operator registers a token with the demo hook. Registration is a demo assertion by a wallet, not independently verified ownership or Ascend launch provenance.
2. The registered operator creates the token’s oath. The registry deploys a vault with immutable terms and routes that token’s mock launcher fee share to it.
3. Simulated trading activity sends fees to the vault. The accounting and events are real testnet state.
4. Anyone can settle fees when available. Settlement follows the recorded rules and fixed destinations; the caller cannot redirect a payment to themselves.
5. Holders inspect the public record. The API reports the status and amounts at a checked block rather than guessing from the operator’s statements.

### Vesting pledge

Vesting begins at oath creation. Through the cliff, fees remain locked. After the cliff they unlock linearly through the end of the schedule. All deposits follow the original schedule. A deposit arriving after the schedule ends is immediately claimable. Settlement pays the immutable launcher address.

The demo vesting oath has a one-day cliff and 30-day duration. At the live check on October 20, 2026, it had received 7.5 OATH, held all 7.5 OATH, and released none. These amounts are a checked snapshot; use what the page shows at recording time.

### Burn pledge

A fixed percentage of deposited fee income is sent to `0x000000000000000000000000000000000000dEaD` during settlement; the remainder goes to the launcher. Cumulative accounting handles rounding across repeated settlements.

The demo burn oath commits 50%. It received 7.5 OATH and settled 3.75 OATH to the dead address and 3.75 OATH to the launcher. It currently holds zero. This is a dead-address transfer: the ERC-20 total-supply figure does not decrease.

### Active, Fulfilled and Breached

| Verdict | Meaning |
| --- | --- |
| Active | No recipient change has been recorded, and the oath period or settlement is still in progress. |
| Fulfilled | The period ended and all received fees were settled at the checked block. Later deposits can require settlement again. |
| Breached | A recipient revision occurred after the oath. Restoring the vault cannot erase the breach. Existing deposits remain subject to the original terms. |

**Both sample oaths currently show Active.** The burn payments already occurred, but its 30-day period has not ended. Do not call it Fulfilled simply because its present vault balance is zero. The interactive illustration can show a hypothetical Completed stage, but that is not the status of the live sample.

## 6. What is implemented, and what is still a prototype

| Piece | Current state |
| --- | --- |
| OathVault | Real deployed testnet contract enforcing deposited-fund terms. |
| HorkosRegistry | Real deployed registry recording pledges and verdicts. |
| HorkosLens | Read-only aggregation contract reducing RPC reads. |
| TestCoin / OATH | Demo ERC-20 tokens deployed directly for this build. |
| MockFeeHook | Demo simulation of trading-fee distribution; no AMM swap. |
| Website | Vercel deployment with public pledge records, creation form, wallet controls and interactive explanation. |
| Verdict API | Live public reads, checked block/time, raw amounts and explicit mock source. |
| Real Ascend pool integration | Pending ABI, addresses, permissions and routing validation. |

Verification completed for the build includes 37 Foundry tests, four app tests, TypeScript and production build checks. Public layout and the local fee illustration were checked at desktop, tablet and mobile widths. Browser checks with a simulated wallet provider can verify request behavior but are not a substitute for your actual Brave/MetaMask recording.

Horkos enforces funds once they reach the vault. It cannot guarantee that every future fee enters the vault or prevent misconduct elsewhere. The prototype is testnet-only and unaudited. There is no mainnet deployment in this build.

## 7. Why it fits the hackathon

The project addresses a specific part of Ascend’s economics: recurring income for token operators. A holder can inspect whether a promised allocation of that income is reflected in actual deposits, payouts and routing history.

The differentiator is a commitment mechanism plus evidence. It adds rules over deposited money rather than only measuring a token’s activity. The public verdict lets other tools use that evidence.

Using the four evaluation categories listed in the supplied architecture plan:

| Category | Evidence to show |
| --- | --- |
| Execution | Deployed contracts, real sample deposits and settlements, explorer transactions, passing tests and a working website/API. |
| Usefulness | A holder can understand the promise and check the money in seconds without connecting a wallet. |
| Originality | Immutable fee-pledge terms with observable, permanent breach history. Do not claim no other project has a similar mechanism without researching it. |
| Long-term vision | A validated real Ascend adapter, then a listing-reserve pledge and verifier/embeddable integrations. |

These categories come from the architecture plan; the current official judging rubric has not been independently verified. **The largest substantive gap is real Ascend integration.** Be clear that the demo proves our mechanism under a mock fee source. A future listing-reserve pledge is relevant because Ascend describes an optional creator-fee set-aside for listings, but Horkos has not implemented that third mode.

## 8. Recording setup: five minutes of preparation

Use your existing throwaway wallet only: `0xaE35d4DC0385c34055e0B54d2D855669106C5778`. Keep its private key out of all documents, recordings and chat overlays. Gas is testnet HYPE.

| Setting | Value |
| --- | --- |
| Network | Elysium Testnet |
| Chain ID | 99801 |
| RPC | https://testnet-rpc.elysium.kinetiq.xyz |
| Gas token | HYPE |
| Explorer | https://elysium.kinetiq.xyz/testnet-explorer |
| Faucet | https://elysium.kinetiq.xyz/testnet-faucet |

Before you press Record:

1. Reopen the live site so the restored wallet controls and latest stylesheet load. Use a desktop window around 1,280–1,440 pixels wide and readable browser zoom.
2. If showing connection, select the throwaway account and connect before recording. Check chain ID 99801. Do not display an import screen, recovery phrase or private key. The known MetaMask warning remains a separate unresolved issue; use the no-wallet route if connection blocks the recording.
3. Open the four tabs listed below in order. Let their live values load before starting. Avoid opening many live-data tabs simultaneously, as the public RPC is rate limited.
4. On the home illustration, set volume to 1,000 OATH, select Lock & vest, choose Fees arrive and leave the diversion checkbox off. These are local illustrative controls.
5. Keep the testnet/mock label visible. Disable unrelated desktop notifications and test the microphone.
6. Use OBS or your preferred Windows screen recorder. Record one practice take. Aim for 100–110 seconds and check the form’s actual maximum duration before submitting.

Tabs to prepare:

- Home / local illustration: https://horkos-oaths.vercel.app
- Vesting sample: https://horkos-oaths.vercel.app/oath/1
- Burn sample: https://horkos-oaths.vercel.app/oath/2
- JSON verdict: https://horkos-oaths.vercel.app/api/oath/0xA7681A7c27613cC99c6Fe9b3b851F16CBC8eE5E3

## 9. The quick 100–110-second recording script

Read the quoted narration; follow the screen action. The timestamps are pacing targets, not a reason to rush a sentence. This route shows prepared on-chain records and a clearly labeled illustration; it does not imply you created a new oath during the take.

### 0:00–0:13 — Home: who and why

Screen: show the headline and launcher/holder explanation. If already connected, the public wallet address can remain visible.

“Horkos is for people launching tokens through Ascend and the communities holding those tokens. Operators earn trading fees. Horkos lets them make specific, verifiable promises about that income.”

### 0:13–0:27 — Explain the default fee split

Screen: scroll to Follow the money. Keep the illustration label visible; use 1,000 OATH volume.

“This is an illustration of the default fee model: a one-thousand-unit trade generates a ten-unit fee. The launcher’s quarter-share is two-point-five units, routed into the pledge vault.”

### 0:27–0:44 — Show vest, burn and diversion in the illustration

Screen: select Midway while in vest mode; select Commit 50% to burn; briefly tick the redirected-recipient checkbox.

“The launcher can lock and vest that share, or commit a percentage to the dead address. Here, redirecting future fees illustrates a breach. These controls are a local explanation, not transactions.”

### 0:44–1:02 — Vesting sample: real money record

Screen: switch to oath 1. Show held amount, schedule, checked block and event record.

“Now the actual testnet record: this prepared oath holds seven-point-five OATH under a one-day cliff and thirty-day schedule. Its transactions and checked block are public. Holders can read this without connecting.”

If the amount has changed at recording time, say the visible amount instead. Do not claim the snapshot is permanently fixed.

### 1:02–1:17 — Burn sample: actual settlement

Screen: switch to oath 2. Show the released and dead-address amounts.

“The burn sample already settled three-point-seven-five OATH to the launcher and the same amount to the dead address. It remains Active because its oath period is still running.”

### 1:17–1:33 — API: proof another tool can use

Screen: switch to the JSON verdict. Highlight status, locked, checkedAt or blockNumber, chainId and source.

“Other tools can read the same evidence through our API. It includes amounts, status, a checked block, and the explicit mock-hook source. The vaults are real; the trading-fee source is simulated.”

### 1:33–1:46 — Close: scope and next step

Screen: return to the home or docs page, keeping the testnet label visible.

“Our OATH tokens were deployed directly for this demo, not launched through Ascend. Next is validating real Ascend fee routing. Horkos turns a fee promise into terms and evidence anyone can inspect.”

Optional short wallet sentence, only if genuinely connected: “I’m connected with a throwaway wallet on Elysium Testnet, chain ninety-nine thousand eight hundred and one.” Trim a few seconds elsewhere to stay under the required limit.

## 10. Optional stronger demo: record one actual testnet transaction

Use this only if your wallet has test HYPE and at least 10 OATH of the selected sample token. The OATH balances are token-specific: the two tokens have the same symbol but different addresses. Funding with HYPE alone does not provide OATH.

The safer recording workflow is to capture the wallet action first, then edit the confirmation wait down while keeping the transaction hash and explorer result visible. Explain that the fee hook is a mock. Do not pass off the local illustration as this transaction.

### Simulate a trade on a prepared oath

1. Open oath 1 or oath 2 and expand Demo controls.
2. Click Simulate trade. The app checks the selected token balance and allowance.
3. If approval is required, MetaMask requests permission for exactly 10 OATH to the deployed mock hook. Review the asset, spender and network. This is an approval transaction, not the fee transfer itself.
4. After approval confirms, the app asks for the simulated trade transaction. Its declared notional is 1,000 OATH; only the 10 OATH fee moves. It is not a purchase or AMM swap.
5. Confirm only on chain 99801. Wait for the receipt and the app’s refresh. The launcher share should add 2.5 OATH to the configured recipient while the pledge is intact.
6. Show the new transaction in the explorer and the updated public record. If wallet/RPC confirmation fails, show the actual error and use the prepared-record route; do not claim an uncertain action succeeded or repeatedly click it.

On oath 2, newly deposited burn fees can be settled immediately. Settlement sends the pledged half to the dead address and the rest to the launcher. Anyone may call settlement; they do not control those destinations. On oath 1, settlement may be unavailable while nothing has unlocked through the cliff.

### Creating a new oath

The prepared tokens already have oaths, and the registry permits one oath per token. Do not try to create a second oath for them. A genuine new-creation demonstration needs a fresh ERC-20 deployed on chain 99801, registration in the mock hook by the creator wallet, and a new creation transaction. The current task has not prepared another token for you. Show the form as a form walkthrough unless you actually complete those steps.

### Demonstrating a real breach

The on-chain Creator: demonstrate breach control permanently marks the chosen oath Breached when its creator redirects the fee recipient. Restoring the recipient cannot erase it. Only the registered creator can do this. Existing deposited fees remain bound.

For a quick submission, use the reversible illustration checkbox and identify it as illustrative. Avoid permanently changing either prepared sample merely to make the video more dramatic. If you intentionally record the on-chain breach, do it after recording the intact sample footage and say clearly what changed.

## 11. Copy-ready submission text

### Suggested title

Horkos — verifiable trading-fee pledges for token launchers

### One sentence

Horkos lets token operators commit deposited trading-fee income to immutable vesting or dead-address allocations, with a public verdict holders and other tools can inspect.

### Overview: under 150 words

Ascend’s token deployers and approved operators earn a share of token trading fees. Horkos lets them make verifiable promises about that income: lock and vest it over time, or send a percentage to the dead address. Immutable vault terms enforce deposited funds, while holders inspect amounts, events and an Active, Fulfilled or Breached verdict without connecting a wallet. Recipient diversion permanently marks the pledge Breached. Our two OATH tokens were deployed directly to Elysium Testnet; real vaults receive simulated fees from a clearly labeled mock hook. Real Ascend routing remains unverified. Horkos provides evidence about fee handling rather than a general token safety rating.

### Technical implementation

Solidity vault and registry contracts deployed on Elysium Testnet, with a read-only aggregation lens and a mock ERC-20 fee source. The Next.js frontend is deployed on Vercel. A public verdict API reads on-chain state and reports checked-block amounts, status and source. Foundry covers accounting, time boundaries, settlement and breach behavior; 37 contract tests pass. Four app tests, TypeScript, production builds and responsive browser checks were verified.

### Next milestones and support requested

First validate Ascend’s actual hook ABI, deployed addresses, creator-recipient controls and fee asset with a test launch. Then evaluate a listing-reserve pledge and publish verifier/embeddable integrations. Perform an independent security review before considering production or mainnet. No token plans are determined.

Support requested from Ascend: hook-pool ABI and addresses; whether creator recipients can be set, redirected or locked; and access to a test launch to validate routing.

### Honest current limitations

The real Ascend integration is pending. The mock transfers fees only. The vault enforces funds it receives and cannot force all future fees into it. Dead-address transfers leave total supply unchanged. No independent audit or mainnet deployment is claimed. A MetaMask domain classification reported in Brave remains unresolved; restored wallet controls do not clear that classification. No final video, project account or submission ticket has been created by this build.

## 12. Submission checklist

- [ ] Record the video and watch it once for readable text, audible narration and correct claims.
- [ ] Keep it within the actual form’s duration limit; the architecture plan targets 60–120 seconds.
- [ ] Upload the recording to the accepted host and test that the link works for a viewer who is not signed in as you.
- [ ] Paste live website and GitHub links; confirm they open.
- [ ] Supply your actual team/project identity and project X account if the form requires them.
- [ ] Include the short overview, technical status and real-hook support request above.
- [ ] Clearly state that the fee hook is a mock and the demo tokens were not launched through Ascend.
- [ ] Check the official submission instructions and deadline. The architecture plan anticipated a Discord ticket; confirm the actual process rather than assuming it.
- [ ] Submit the form/ticket yourself and save its receipt or acknowledgement. This guide is not a submitted entry.

## 13. Links and proof reference

| Resource | Link or address |
| --- | --- |
| Live application | https://horkos-oaths.vercel.app |
| Explanation | https://horkos-oaths.vercel.app/docs |
| Create form | https://horkos-oaths.vercel.app/create |
| Vest oath | https://horkos-oaths.vercel.app/oath/1 |
| Burn oath | https://horkos-oaths.vercel.app/oath/2 |
| Repository | https://github.com/dotmantissa/horkos |
| Public registry | 0xd3e9D3E82c2830250a4F9Ef62300A22C8419CFA2 |
| Mock fee hook | 0xcc1CaD93C0fE2EAC79dAb2c3647b8Ec0d77f2995 |
| Vesting demo token | 0xA7681A7c27613cC99c6Fe9b3b851F16CBC8eE5E3 |
| Burn demo token | 0xD4D1C7CED7d4108e80B97b5d59B686A6E736c313 |
| Vesting vault | 0x2a6f0B43A81CD7A468B3cbbD1B141aC3cF326d65 |
| Burn vault | 0x2e335158ce63c51648666DA70FdBF13982b70023 |
| Read-only lens | 0xaCAfd122a7D30e4a7F7651fCB108255F0d48a759 |

Full deployment proof in the repository: deployments/testnet-99801.json. API schema: docs/api.md. Contract semantics: docs/contract-semantics.md. MetaMask review evidence: docs/wallet-security-review.md. No credentials or private keys belong in this submission pack.
