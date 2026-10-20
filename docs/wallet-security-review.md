# Reported MetaMask domain warning

Status: unresolved. A user reported the **Malicious—flagged as unsafe** warning for `https://horkos-oaths.vercel.app` in Brave on October 20, 2026. The user connected a wallet; signing history and MetaMask version have not been provided. Do not classify this as a confirmed false positive.

Wallet requests and transaction buttons are temporarily paused in the current frontend update. Read-only records and the local educational fee illustration need no wallet. The pause is applied inside the shared connection function as well as at the controls; it does not revoke an existing browser permission. Users can disconnect the site in their wallet. Do not advise disabling security alerts, bypassing the warning, or using another hostname to avoid it.

## Evidence checked

- The public MetaMask `eth-phishing-detect` configuration contained no exact or parent-domain blocklist match for our URL at the time checked. Other threat providers and cached classifications were not accessible; absence from this one list does not clear the warning.
- The existing connection implementation requested accounts, added/switched to Elysium Testnet, then checked chain ID 99801. Connection did not request a signature or token allowance.
- Transaction code requires an explicit action. The simulated-trade approval is limited to 10 OATH for the deployed mock hook. There are no unlimited approvals, permit requests, seed/private-key inputs or server signing endpoints in the app.
- These checks do not replace MetaMask's review or establish that every browser execution is safe. No real-funds wallet was used for the build; no transaction was sent during this investigation.

## Manual review handoff

MetaMask's [official guidance](https://support.metamask.io/configure/wallet/security-alerts) directs URL-classification issues to support for manual review. A report has **not** been submitted. A maintainer can provide the following:

- Flagged URL: `https://horkos-oaths.vercel.app`
- Network: Elysium Testnet, chain ID **99801**, RPC `https://testnet-rpc.elysium.kinetiq.xyz`
- Browser: Brave; MetaMask version still needed
- The user's original screenshot, without seed phrases or private keys
- Source: https://github.com/dotmantissa/horkos
- Contract and transaction evidence: `deployments/testnet-99801.json`
- Public registry: https://elysium.kinetiq.xyz/testnet-explorer/address/0xd3e9D3E82c2830250a4F9Ef62300A22C8419CFA2
- Explain that this is an Elysium hackathon prototype with a mock fee hook, not an official Ascend service, and ask which detection signal triggered the classification.

Public blocklist source: https://github.com/MetaMask/eth-phishing-detect/blob/main/src/config.json

Restore wallet actions only after investigating the classification and verifying wallet behavior. The `walletActionsPaused` switch in `app/components/horkos.tsx` guards the shared connection function and all transaction controls; keep chain-99801 guards intact. Updating this document alone does not re-enable transactions.
