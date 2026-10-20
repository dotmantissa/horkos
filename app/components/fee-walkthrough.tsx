'use client';

import { useState } from 'react';
import { ArrowRight, Check, Flame, LockKeyhole, Pause, Play, ShieldCheck } from 'lucide-react';

const stages = ['Fees arrive', 'Midway', 'Completed'] as const;

/** A local explanation of the demo's fee split; never sends a wallet request. */
export function FeeWalkthrough() {
  const [mode, setMode] = useState<'vest' | 'burn'>('vest');
  const [stage, setStage] = useState(0);
  const [notional, setNotional] = useState(1000);
  const [diverted, setDiverted] = useState(false);
  const [paused, setPaused] = useState(false);
  const fee = notional / 100;
  const share = fee / 4;
  const released = mode === 'vest' ? share * stage / 2 : stage === 0 ? 0 : share / 2;
  const burned = mode === 'burn' && stage > 0 ? share / 2 : 0;
  const held = share - released - burned;
  const status = diverted ? 'Breached' : stage === 2 ? 'Fulfilled' : 'Active';
  const amount = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });

  return <section className={`fee-lab ${paused ? 'motion-paused' : ''} ${diverted ? 'flow-diverted' : ''}`} aria-labelledby="fee-lab-title">
    <div className="lab-heading">
      <div><div className="eyebrow">FOLLOW THE MONEY</div><h2 id="fee-lab-title">A token trades. A promise gets tested.</h2><p>Move through an example to see what happens to the token launcher’s fee income.</p></div>
      <span className="lab-local"><span/> Interactive illustration · no wallet needed</span>
    </div>
    <div className="lab-body">
      <div className="lab-controls">
        <fieldset className="lab-modes"><legend>What does the token launcher promise?</legend>
          <button type="button" aria-pressed={mode === 'vest'} onClick={() => setMode('vest')}><LockKeyhole size={17}/><span>Lock & vest<small>1-day cliff, released through day 30</small></span>{mode === 'vest' && <Check size={15}/>}</button>
          <button type="button" aria-pressed={mode === 'burn'} onClick={() => setMode('burn')}><Flame size={17}/><span>Commit 50% to burn<small>Half of received fees to the dead address</small></span>{mode === 'burn' && <Check size={15}/>}</button>
        </fieldset>
        <label className="lab-range" htmlFor="example-volume">Example trading volume <output htmlFor="example-volume">{amount(notional)} OATH</output></label>
        <input id="example-volume" type="range" min="1000" max="10000" step="1000" value={notional} onChange={event => setNotional(Number(event.target.value))}/>
        <p className="lab-footnote">Uses the demo’s 1% fee and 25% launcher share. OATH is a test token; this slider transfers nothing.</p>
        <div className="lab-stages" role="group" aria-label="Example settlement stage">{stages.map((label, index) => <button key={label} type="button" aria-pressed={stage === index} onClick={() => setStage(index)}><span>0{index + 1}</span>{label}</button>)}</div>
      </div>
      <div className="lab-flow">
        <svg className="fee-paths" viewBox="0 0 600 285" preserveAspectRatio="none" aria-hidden="true"><path className="flow-base" d="M120 54 H300 V145 H455 V218"/><path className="flow-moving" d="M120 54 H300 V145 H455 V218"/><path className="flow-return" d="M300 54 H490"/></svg>
        <div className="flow-node flow-trade"><span>01 / TOKEN TRADING FEE</span><strong key={`fee-${notional}`} className="value-enter">{amount(fee)} <small>OATH</small></strong><p>1% of {amount(notional)} OATH volume</p></div>
        <div className="flow-protocol"><span>75% / MOCK PROTOCOL</span><strong>{amount(fee - share)} OATH</strong></div>
        <div className="flow-node flow-vault"><span><ShieldCheck size={13}/> 02 / LAUNCHER’S FEE VAULT</span><strong key={`vault-${notional}-${stage}-${mode}`} className="value-enter">{amount(held)} <small>OATH held</small></strong><p>Receives {amount(share)} OATH · 25% of the fee</p></div>
        <div className="flow-destination"><span>03 / SETTLEMENT</span><div><span><LockKeyhole size={13}/> To launcher <strong>{amount(released)} OATH</strong></span><span><Flame size={13}/> To dead address <strong>{amount(burned)} OATH</strong></span></div></div>
        <button className="motion-toggle" type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play fee flow animation' : 'Pause fee flow animation'}>{paused ? <Play size={13}/> : <Pause size={13}/>} {paused ? 'Play motion' : 'Pause motion'}</button>
      </div>
    </div>
    <div className="lab-verdict" aria-live="polite" aria-atomic="true"><span className={`status ${status.toLowerCase()}`}><i/>{status}</span><p>{diverted ? 'The launcher redirected future fees. The pledge is breached; existing deposits still follow their original terms.' : stage === 0 ? 'Fees have arrived. The vault holds them until settlement under the chosen terms.' : stage === 1 ? mode === 'vest' ? 'Halfway through the release period, half of the deposited fees can be paid to the launcher.' : 'Settlement sends half to the dead address and half to the launcher. The oath period is still running.' : 'The period has ended and all received fees are settled in this example.'}</p></div>
    <div className="lab-breach"><label><input type="checkbox" checked={diverted} onChange={event => setDiverted(event.target.checked)}/> Illustrate a redirected fee recipient</label><span>Example reset is reversible. An on-chain breach is permanent.</span></div>
    <p className="lab-footnote lab-scope">Simplified illustration: one fee deposit, settlement at each stage, no further deposits. Dead-address transfers leave total supply unchanged. <a href="/docs">Read the exact rules <ArrowRight size={12}/></a></p>
  </section>;
}
