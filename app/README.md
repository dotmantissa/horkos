# Horkos app

Next.js App Router routes, React 19 and viem, served through Vinext on a Cloudflare Worker with Sites hosting. See the root README for contract scope, deployment proof and verification.

Node >=22.13: `npm ci`, `npm run typecheck`, `npm test`, `npm run dev` (port 5173), `npm run build`.

`lib/deployment.json` contains public Elysium chain99801 addresses. This app never loads the root signing `.env`. It signs only through a user-connected browser wallet on chain99801. `lib/read-oaths.ts` returns checked live snapshots; errors stop automatic client polling. No database is used.

Hosted release uses `.openai/hosting.json` and the Sites build/source/package helpers. Preserve the source manifest and build/sites-vite-plugin integration. The public app and verdict API use no hosting secrets.
