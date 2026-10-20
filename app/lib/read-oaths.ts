import { isAddress, type Address } from 'viem';
import { publicClient, config } from './chain';
import { horkosRegistryAbi, horkosLensAbi, oathVaultAbi, mockFeeHookAbi, testCoinAbi } from './abis';
import type { Verdict } from './model';
import { ReadCache } from './read-cache';

const registry = config.contracts.HorkosRegistry as Address;
const hook = config.contracts.MockFeeHook as Address;
const snapshots = new ReadCache<Verdict>(5000);
const history = new ReadCache<Verdict['events']>(30000);
const creationBlocks = new ReadCache<bigint>(3600000);
const metadata = new ReadCache<{ decimals: number; symbol: string }>(3600000);
const ids = new ReadCache<bigint>(5000);
type CheckedBlock = Awaited<ReturnType<typeof publicClient.getBlock>> & { number: bigint };
const blocks = new ReadCache<CheckedBlock>(5000);

async function checkedBlock() {
  return blocks.get('current', async () => {
    if (await publicClient.getChainId() !== 99801) throw new Error('RPC returned an unexpected chain ID');
    const block = await publicClient.getBlock();
    if (block.number === null) throw new Error('RPC did not return a mined block');
    return { ...block, number: block.number };
  });
}

async function readSnapshot(id: bigint): Promise<Verdict> {
  if (id < 1n) throw new Error('Oath not found');
  return snapshots.get(id.toString(), async () => {
    const block = await checkedBlock();
    const blockNumber = block.number;
    const count = await ids.get('count', () => publicClient.readContract({ address: registry, abi: horkosRegistryAbi, functionName: 'oathCount', blockNumber }));
    if (id > count) throw new Error('Oath not found');
    const s = await publicClient.readContract({ address: config.contracts.HorkosLens as Address, abi: horkosLensAbi, functionName: 'snapshot', args: [registry, id], blockNumber });
    const asset = await metadata.get(s.token.toLowerCase(), async () => ({
      decimals: await publicClient.readContract({ address: s.token, abi: testCoinAbi, functionName: 'decimals', blockNumber }),
      symbol: await publicClient.readContract({ address: s.token, abi: testCoinAbi, functionName: 'symbol', blockNumber }),
    }));
    return {
      token: s.token, oathId: id.toString(), creator: s.creator, vault: s.vault,
      mode: s.mode === 0 ? 'vest' : 'burn', terms: { start: Number(s.start), cliff: Number(s.cliff), end: Number(s.end), burnBps: s.burnBps },
      status: (['Active', 'Fulfilled', 'Breached'] as const)[s.status], locked: s.locked.toString(), released: s.released.toString(), burned: s.burned.toString(),
      totalReceived: s.totalReceived.toString(), claimable: s.claimable.toString(), nextUnlock: Number(s.nextUnlock),
      checkedAt: new Date(Number(block.timestamp) * 1000).toISOString(), blockNumber: blockNumber.toString(),
      source: 'mock-hook', chainId: 99801, ...asset, feeRecipient: s.feeRecipient, events: [],
    };
  });
}

async function readEvents(oath: Verdict) {
  return history.get(oath.oathId, async () => {
    const blockNumber = BigInt(oath.blockNumber);
    const deployed = BigInt(config.deploymentBlock);
    const sample = config.samples.find(sample => String(sample.oathId) === oath.oathId);
    const creationTx = sample ? config.transactions[`oath:${sample.token}` as keyof typeof config.transactions] : undefined;
    const origin = creationTx ? await creationBlocks.get(oath.oathId, async () =>
      (await publicClient.getTransactionReceipt({ hash: creationTx as `0x${string}` })).blockNumber
    ) : deployed;
    const recent = blockNumber > deployed + 3999n ? blockNumber - 3999n : deployed;
    const ranges: { fromBlock: bigint; toBlock: bigint }[] = [];
    for (const [begin, end] of [[origin, origin + 3999n < blockNumber ? origin + 3999n : blockNumber], [recent, blockNumber]]) {
      for (let fromBlock = begin; fromBlock <= end; fromBlock += 2000n) {
        const toBlock = fromBlock + 1999n < end ? fromBlock + 1999n : end;
        if (!ranges.some(range => fromBlock <= range.toBlock && toBlock >= range.fromBlock)) ranges.push({ fromBlock, toBlock });
      }
    }
    const events: Verdict['events'] = [];
    for (const range of ranges) {
      const settlements = await publicClient.getContractEvents({ address: oath.vault as Address, abi: oathVaultAbi, eventName: 'Settled', ...range });
      const trades = await publicClient.getContractEvents({ address: hook, abi: mockFeeHookAbi, eventName: 'MockTrade', args: { token: oath.token as Address }, ...range });
      const changes = await publicClient.getContractEvents({ address: hook, abi: mockFeeHookAbi, eventName: 'FeeRecipientChanged', args: { token: oath.token as Address }, ...range });
      const created = await publicClient.getContractEvents({ address: registry, abi: horkosRegistryAbi, eventName: 'OathCreated', args: { oathId: BigInt(oath.oathId) }, ...range });
      for (const log of settlements) events.push({ type: 'Settled', transactionHash: log.transactionHash!, blockNumber: log.blockNumber!.toString(), logIndex: log.logIndex!, detail: `Released ${log.args.releasedNow} · burned ${log.args.burnedNow} base units` });
      for (const log of trades) events.push({ type: 'Mock trade', transactionHash: log.transactionHash!, blockNumber: log.blockNumber!.toString(), logIndex: log.logIndex!, detail: `Creator fee: ${log.args.creatorFee} base units` });
      for (const log of changes) events.push({ type: 'Recipient changed', transactionHash: log.transactionHash!, blockNumber: log.blockNumber!.toString(), logIndex: log.logIndex!, detail: `Recipient ${log.args.recipient} · revision ${log.args.revision}` });
      for (const log of created) events.push({ type: 'Oath created', transactionHash: log.transactionHash!, blockNumber: log.blockNumber!.toString(), logIndex: log.logIndex!, detail: 'Immutable terms recorded; creator fees bound to vault' });
    }
    events.sort((a, b) => Number(BigInt(b.blockNumber) - BigInt(a.blockNumber)) || b.logIndex - a.logIndex);
    return events.slice(0, 50);
  });
}

export async function readOath(id: bigint, includeEvents = true): Promise<Verdict> {
  const oath = await readSnapshot(id);
  return includeEvents ? { ...oath, events: await readEvents(oath) } : oath;
}
export async function oathForToken(token: string): Promise<Verdict> {
  if (!isAddress(token)) throw new Error('Invalid token address');
  const id = await ids.get('token:' + token.toLowerCase(), () => publicClient.readContract({ address: registry, abi: horkosRegistryAbi, functionName: 'oathForToken', args: [token] }));
  return readOath(id, false);
}
export async function listOaths(): Promise<{ oaths: Verdict[]; count: string }> {
  const block = await checkedBlock();
  const count = await ids.get('count', () => publicClient.readContract({ address: registry, abi: horkosRegistryAbi, functionName: 'oathCount', blockNumber: block.number }));
  const oaths: Verdict[] = [];
  for (let i = count; i > 0n && i > count - 20n; i--) oaths.push(await readOath(i, false));
  return { oaths, count: count.toString() };
}
