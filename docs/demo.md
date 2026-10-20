# 90-second demo runbook

Use the funded throwaway creator wallet in MetaMask on chain 99801. The app never asks for a private key. Say **mock fee hook** out loud and keep the mock banner visible. Browser wallet confirmations and a screen recording require the user's browser.

1. **0:00–0:10**: Open home. “Creators can promise anything about their fees. Horkos makes the promise public and enforces deposited fees.”
2. **0:10–0:30**: Show `/create`, choose vesting or burn, duration and cliff/percentage. The deployed sample tokens already have immutable oaths; use a fresh owner-deployed TestCoin for an actual new creation, register it on the mock hook, then create. Otherwise say explicitly this is a prepared sample.
3. **0:30–0:55**: Open `/oath/1` for the 30-day vest pledge and show the locked fees, schedule, and initial trades. `/oath/2` demonstrates completed burn settlement immediately. Under Demo controls, Simulate trade transfers only the fee and needs the token balance plus a wallet confirmation. Settle fees is permissionless when claimable > 0.
4. **0:55–1:10**: Open the JSON token endpoint and show status, locked/released/burned, checked block/time and `source: mock-hook`.
5. **1:10–1:25**: With the creator wallet, open Demo controls → demonstrate breach → confirm permanent breach. This changes fee routing to the creator, is irreversible in the verdict, and must be intentional. Wait for confirmation and refresh. Deposited fees remain bound. Only do this on the sample you want permanently marked Breached.
6. **1:25–1:30**: “Next: validate an adapter against Ascend's real hook, so verifier tools can consume these pledges.”

Record under 120 seconds. No fabricated wallet actions, deployments, or claims of a real Ascend hook. Project X account, final recording URL and Discord submission are user-managed handoff items; no account has been created or ticket submitted by the build.
