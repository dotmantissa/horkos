# Horkos contract semantics

Horkos binds fees **after they reach the vault**. The demo hook is a mock. Ascend's live hook ABI, fee routing, and permission to lock its recipient are unverified; no contract here claims to control Ascend's real fees.

* The fee asset is the demo ERC-20, TestCoin. A mock trade transfers only a 1% fee, of which 25% goes to the creator recipient and 75% goes to the mock protocol recipient. It does not perform an AMM swap or return purchased tokens.
* A creator registers a token on the hook. Creating its single oath atomically deploys its vault and directs that token's creator fees to it. Only the registered creator can create the oath or subsequently change the recipient. There is one oath per token.
* Vesting starts at oath creation. Before and at the cliff nothing unlocks. From the cliff until the end, all received fees vest linearly; a cliff equal to duration unlocks everything at the end. Incoming deposits use the original oath schedule. Deposits received after the end unlock immediately.
* Burn mode transfers the declared percentage to `0x000000000000000000000000000000000000dEaD` and releases the rest to the creator when anyone settles. It does not reduce ERC-20 total supply. Burn entitlement is calculated against cumulative receipts, preventing split settlements from losing rounding dust.
* Anyone can settle; there is no owner withdrawal, term edit, or arbitrary destination. Accounting updates precede transfers and a reentrancy guard protects settlement. The supported asset is an ordinary non-rebasing, non-fee-on-transfer ERC-20.
* A recipient revision after oath creation makes the oath permanently Breached, even if the creator later restores the vault. Deposited funds remain subject to the pledge after a breach.
* Status is Breached first; otherwise Active until the end or while funds remain unsettled, then Fulfilled. Fulfilled is a verdict at the current block, not a guarantee of all future fee flows. A later deposit can require settlement again; a later diversion can still produce Breached.
* Durations must be nonzero and at most ten years. Vest cliffs cannot exceed duration. Burn percentage must be 1–10,000 basis points. Registry terms are immutable.

The JSON verdict exposes the checked block/time, raw integer token amounts, asset decimals, and `source: "mock-hook"`. RPC failure produces an unavailable response, never a fabricated Active verdict. Cached reads last five seconds.

The deployed HorkosLens is a read-only aggregation helper, with no write methods or permissions. It returns all oath state fields in one eth_call so the app can work within public RPC limits. Event reads cover the known sample creation window and latest4000blocks, up to50 events; the explorer is the full history source.
