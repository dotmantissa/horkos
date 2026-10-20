import { createPublicClient, defineChain, http, custom } from 'viem';
import deployment from './deployment.json';

export const elysium = defineChain({
  id: 99801, name: 'Elysium Testnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.elysium.kinetiq.xyz'] } },
  blockExplorers: { default: { name: 'Elysium', url: 'https://elysium.kinetiq.xyz/testnet-explorer' } },
  testnet: true,
});
export const explorer = elysium.blockExplorers.default.url;
export const config = deployment;
// Serialize provider reads at two requests/second; never retry a failed RPC call.
const upstream = http(elysium.rpcUrls.default.http[0], { retryCount: 0, timeout: 15000 })({ chain: elysium });
let queue: Promise<unknown> = Promise.resolve();
let lastRequest = 0;
export const publicClient = createPublicClient({ chain: elysium, transport: custom({
  request: ({ method, params }) => {
    const result = queue.then(async () => {
      const delay = Math.max(0, 550 - (Date.now() - lastRequest));
      if (delay) await new Promise(resolve => setTimeout(resolve, delay));
      lastRequest = Date.now();
      return upstream.request({ method, params } as Parameters<typeof upstream.request>[0]);
    });
    queue = result.catch(() => {});
    return result;
  },
}, { retryCount: 0 }) });
