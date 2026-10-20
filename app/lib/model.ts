export type Verdict = {
  token: string; oathId: string; creator: string; vault: string;
  mode: 'vest' | 'burn'; terms: { start: number; cliff: number; end: number; burnBps: number };
  status: 'Active' | 'Fulfilled' | 'Breached'; locked: string; released: string; burned: string;
  totalReceived: string; claimable: string; nextUnlock: number; checkedAt: string; blockNumber: string;
  source: 'mock-hook'; chainId: number; decimals: number; symbol: string; feeRecipient: string;
  events: { type: string; transactionHash: string; blockNumber: string; detail: string; logIndex: number }[];
};
export function formatAmount(raw: string, decimals = 18): string {
  const n = BigInt(raw); const unit = 10n ** BigInt(decimals);
  const whole = n / unit; const fraction = (n % unit).toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '');
  return whole.toLocaleString('en-US') + (fraction ? '.' + fraction : '');
}
export function shortAddress(value: string): string { return value.slice(0, 6) + '…' + value.slice(-4); }
export function validateTerms(mode: 'vest' | 'burn', days: number, cliffDays: number, burnPercent: number): string | null {
  if (!Number.isFinite(days) || days < 1 / 86400 || days > 3650) return 'Choose a duration between one second and ten years.';
  if (mode === 'vest' && (!Number.isFinite(cliffDays) || cliffDays < 0 || cliffDays > days)) return 'The cliff must be between zero and the oath duration.';
  if (mode === 'burn' && (!Number.isFinite(burnPercent) || burnPercent < 0.01 || burnPercent > 100)) return 'Choose a burn percentage between 0.01% and 100%.';
  return null;
}
