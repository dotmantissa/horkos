import test from 'node:test';
import assert from 'node:assert/strict';
import { ReadCache } from '../lib/read-cache.ts';
import { formatAmount, validateTerms } from '../lib/model.ts';
test('concurrent callers share one RPC read, then use the success cache', async () => {
  let now=0, calls=0; const cache=new ReadCache<number>(5000,30000,()=>now);
  const read=async()=>{calls++;return 42;};
  assert.deepEqual(await Promise.all([cache.get('a',read),cache.get('a',read)]),[42,42]);
  assert.equal(calls,1);assert.equal(await cache.get('a',read),42);assert.equal(calls,1);
  now=5001;await cache.get('a',read);assert.equal(calls,2);
});
test('failed reads cool down without retries and never return stale success',async()=>{
  let now=0,calls=0;const cache=new ReadCache<number>(5,30,()=>now);
  await cache.get('a',async()=>42);now=6;
  const error=new Error('Rate Limit Exceeded');const read=async()=>{calls++;throw error;};
  await assert.rejects(cache.get('a',read),error);await assert.rejects(cache.get('a',read),error);assert.equal(calls,1);
  now=37;await assert.rejects(cache.get('a',read),error);assert.equal(calls,2);
});
test('burn and vest form terms reject invalid boundaries',()=>{
  assert.equal(validateTerms('vest',30,31,0),'The cliff must be between zero and the oath duration.');
  assert.equal(validateTerms('burn',30,0,101),'Choose a burn percentage between 0.01% and 100%.');
  assert.equal(validateTerms('vest',30,30,0),null);assert.equal(validateTerms('burn',30,0,0.01),null);
});
test('token formatting preserves big integer precision and truncates fractional display',()=>{
  assert.equal(formatAmount('7500000000000000000'),'7.5');assert.equal(formatAmount('999999999999999999'),'0.9999');
  assert.equal(formatAmount('9007199254740993000000000000000000'),'9,007,199,254,740,993');
});
