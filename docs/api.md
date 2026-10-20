# Verdict API v1

`GET /api/oath/{token-address}` returns one live verdict for an ERC-20 token on Elysium Testnet. Public, no authentication. A token has at most one oath. No Ascertain schema compatibility is asserted.

| Field | Type / meaning |
| --- | --- |
| token, creator, vault, feeRecipient | EVM addresses |
| oathId, blockNumber | Decimal integer strings |
| mode | `vest` or `burn` |
| terms | `start`, `cliff`, `end`: Unix seconds; `burnBps`: 1–10000 for burn |
| status | `Active`, `Fulfilled`, `Breached`, directly from registry |
| locked, released, burned, totalReceived, claimable | Integer strings in token base units |
| decimals, symbol | ERC-20 metadata |
| nextUnlock | Unix second of next vesting opportunity; 0 for burn or ended schedule; dust may need more time |
| checkedAt | ISO UTC timestamp of checked block |
| chainId | Always `99801` |
| source | Always `mock-hook` until a real integration is validated |
| events | Detail endpoint history; empty in compact verdict/list response |

`GET /api/id/{oathId}` adds events from the sample creation window and latest 4000 blocks, limited to 50. Full history is available in the explorer. `GET /api/oaths` returns `{oaths, count, source, chainId}`, with the newest 20 oaths; aggregate amounts on the home page cover only those displayed assets.

Verdicts cache for five seconds. Same-key in-flight reads share one request; failed reads cool down thirty seconds without stale-success fallback. All snapshot fields are read at the same mined block through the read-only HorkosLens. Token lookup/list counts can be from a neighboring checked block within the cache window.

Invalid addresses/IDs return 400, unregistered tokens/unknown oaths 404, and RPC outages 503 with an error. Never interpret unavailable data as Active. The compact token endpoint includes an `Access-Control-Allow-Origin: *` header for verifier reads. There are no server signing keys or write endpoints.

Example:

```sh
curl https://horkos.candidtuna3.chatgpt.site/api/oath/0xA7681A7c27613cC99c6Fe9b3b851F16CBC8eE5E3
```
