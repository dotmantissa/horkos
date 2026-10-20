// Every visual is authored SVG: paths, shapes, text, and deterministic motion.
export const W=1920,H=1080;
const C={bg:'#F5F6EF',ink:'#172D25',green:'#285D45',muted:'#718176',line:'#D9E1D5',lime:'#D8EF9F',soft:'#E8EEDF',white:'#FFFFFF',red:'#A94738',redBg:'#F9E8DF'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=v=>1-Math.pow(1-clamp(v),3);
const rr=(x,y,w,h,fill=C.white,r=18,stroke='none',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,stroke=C.green,sw=3,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle=(x,y,r,fill=C.green,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
function text(x,y,s,size=28,fill=C.ink,weight=400,extra=''){return `<text x="${x}" y="${y}" fill="${fill}" font-family="DM Sans" font-size="${size}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;}
function heading(x,y,s,size=62,fill=C.ink){return `<text x="${x}" y="${y}" fill="${fill}" font-family="Manrope" font-size="${size}" font-weight="700" letter-spacing="-2">${esc(s)}</text>`;}
function lines(x,y,arr,size=27,fill=C.muted,gap=40,weight=400){return arr.map((s,i)=>text(x,y+i*gap,s,size,fill,weight)).join('');}
function label(x,y,s,fill=C.green){return text(x,y,s,18,fill,700,'letter-spacing="2.4"');}
function mono(x,y,s,size=22,fill=C.muted){return `<text x="${x}" y="${y}" fill="${fill}" font-family="DejaVu Sans Mono" font-size="${size}">${esc(s)}</text>`;}
function enter(content,t,delay=0,dx=0,dy=22,dur=.65){let v=ease((t-delay)/dur);return `<g opacity="${v}" transform="translate(${dx*(1-v)} ${dy*(1-v)})">${content}</g>`;}
function pill(x,y,s,fill=C.soft,ink=C.green,w=160){return rr(x,y,w,44,fill,22)+circle(x+20,y+22,4,ink)+text(x+34,y+29,s,18,ink,600);}
function arrow(x1,y1,x2,y2,color=C.green,sw=3){return path(`M${x1} ${y1} L${x2} ${y2}`,color,sw)+path(`M${x2-10} ${y2-7} L${x2} ${y2} L${x2-10} ${y2+7}`,color,sw);}
function shield(x,y,s=1,color=C.green){return `<g transform="translate(${x} ${y}) scale(${s})">${path('M0 -25 L22 -16 V2 C22 18 10 28 0 33 C-10 28 -22 18 -22 2 V-16 Z',color,2.4)}${path('M-10 1 L-2 9 L12 -7',color,3)}</g>`;}
function lock(x,y,s=1,color=C.green){return `<g transform="translate(${x} ${y}) scale(${s})">${rr(-20,-3,40,33,'none',5,color,3)}${path('M-12 -3 V-15 A12 12 0 0 1 12 -15 V-3',color,3)}${circle(0,10,3,color)}${path('M0 10 V18',color,3)}</g>`;}
function flame(x,y,s=1,color=C.green){return `<g transform="translate(${x} ${y}) scale(${s})">${path('M0 -29 C14 -12 8 -6 17 0 C33 24 8 36 -5 29 C-25 24 -21 5 -10 -5 C-6 5 -2 -1 0 -29 Z',color,3)}</g>`;}
function vault(x,y,s=1,dark=false){let color=dark?C.lime:C.green;return `<g transform="translate(${x} ${y}) scale(${s})">${rr(-116,-134,232,258,dark?'#214D3C':C.soft,25,color,2)}${rr(-97,-113,194,215,'none',16,color,2)}${circle(0,-7,58,'none',`stroke="${color}" stroke-width="3"`)}${circle(0,-7,35,'none',`stroke="${color}" stroke-width="2"`)}${[0,60,120].map(a=>`<g transform="rotate(${a} 0 -7)">${path('M-56 -7 H56',color,4)}</g>`).join('')}${circle(0,-7,10,color)}${rr(-125,-73,19,35,color,4)}${rr(-125,35,19,35,color,4)}${path('M75 -41 V35',color,5)}${circle(0,-7,3,dark?C.ink:C.white)}</g>`;}
function node(x,y,w,title,amount,detail,kind='plain'){return rr(x,y,w,182,C.white,20,C.line)+label(x+26,y+39,title)+heading(x+26,y+104,amount,48)+text(x+26,y+147,detail,22,C.muted);}
function particles(t,x1,y1,x2,y2,n=4,color=C.green){return Array.from({length:n},(_,i)=>{let p=((t*.22+i/n)%1+1)%1;return circle(x1+(x2-x1)*p,y1+(y2-y1)*p,5,color);}).join('');}
function cursor(x,y,t){const scale=1-.12*Math.sin(clamp(t)*Math.PI);return `<g transform="translate(${x} ${y}) scale(${scale})">${path('M0 0 L0 29 L8 22 L15 37 L22 33 L15 18 L27 18 Z',C.white,5)}<path d="M0 0 L0 29 L8 22 L15 37 L22 33 L15 18 L27 18 Z" fill="${C.ink}"/></g>`;}
function browser(x,y,w,h,url){return rr(x,y,w,h,C.white,20,C.line)+rr(x,y,w,62,C.soft,20)+rr(x,y+40,w,22,C.soft,0)+[0,1,2].map((i)=>circle(x+28+i*20,y+31,5,['#A3B49D','#B7C5AE','#CDDAC4'][i])).join('')+rr(x+120,y+15,w-250,32,C.bg,8)+text(x+143,y+38,url,17,C.muted);}
function sceneTitle(k,t,title,tag='VECTOR WALKTHROUGH'){return enter(label(96,164,`${String(k+1).padStart(2,'0')} / ${tag}`),t,0,0,12)+enter(heading(96,240,title),t,.06,0,16);}
const short=a=>a.slice(0,8)+'…'+a.slice(-6);

function intro(t,d){return `<rect width="1920" height="1080" fill="${C.ink}"/>`+
[165,225,295].map((r,i)=>`<ellipse cx="1425" cy="500" rx="${r*1.25}" ry="${r}" fill="none" stroke="#49624A" stroke-width="1.5" opacity="${.6-i*.12}" transform="rotate(-18 1425 500)"/>`).join('')+
enter(label(100,213,'BUILT TO COMPLEMENT ASCEND',C.lime),t,.15)+
enter(heading(96,365,'A promise.',112,C.bg),t,.35)+enter(heading(96,497,'With proof.',112,C.lime),t,.65)+
enter(lines(100,600,['Verifiable commitments around','a token launcher’s trading-fee income.'],32,'#B9CABC',48),t,1)+
enter(pill(100,735,'ELYSIUM TESTNET','#2B4537',C.lime,260),t,1.4)+
enter(vault(1425,500,1.35,true),t,.7,30,0,1.1)+enter(pill(1323,742,'PUBLIC PROOF','#2B4537',C.lime,220),t,1.6)+
particles(t,1160,305,1620,305,3,C.lime);}
function problem(t,d){return sceneTitle(1,t,'Ascend creates fee income. Horkos makes it accountable.')+
enter(rr(96,320,505,470,C.white,22,C.line)+label(132,373,'01 / ASCEND')+heading(132,447,'Launch & trade',44)+lines(132,507,['Tokens launch. Trading generates fees.','The eligible launcher receives a share.'],25,C.muted,40)+rr(132,640,428,104,C.soft,12)+label(157,677,'DEFAULT LAUNCHER SHARE')+text(157,716,'25% of the 1% token trading fee',25,C.green,600),t,.25)+
enter(rr(708,320,505,470,C.green,22)+shield(768,381,.8,C.lime)+label(818,387,'02 / HORKOS',C.lime)+heading(746,465,'Commit the income',39,C.white)+lines(746,528,['Immutable terms for deposited fees.','Vesting or a pledged dead-address share.'],24,'#D8E3D3',40)+pill(746,666,'FEE VAULT','#386B51',C.lime,190),t,1)+
enter(rr(1320,320,505,470,C.white,22,C.line)+label(1356,373,'03 / HOLDERS')+heading(1356,447,'Verify the record',41)+lines(1356,507,['Inspect amounts, routing, and status.','No wallet connection required.'],25,C.muted,40)+pill(1356,666,'PUBLIC VERDICT',C.soft,C.green,245),t,1.8)+
enter(arrow(618,550,689,550),t,1.2)+enter(arrow(1230,550,1301,550),t,2.1)+
enter(text(96,858,'Designed for Ascend launchers and operators • Current fee integration is a labeled mock',23,C.muted),t,2.5);}
function create(t,d,data,q){const p=t/d, b1=q?.cues?.[2]?.start??d*.31, b2=q?.cues?.[3]?.start??d*.64,stage=t<b1?0:t<b2?1:2;
let left=label(96,343,'LAUNCHER FLOW')+['Connect on chain 99801','Choose the commitment','Confirm immutable terms'].map((s,i)=>rr(96,390+i*116,465,88,stage===i?C.green:C.soft,14)+text(124,444+i*116,`0${i+1}`,25,stage===i?C.lime:C.green,700)+text(180,443+i*116,s,25,stage===i?C.white:C.ink,500)).join('')+lines(96,794,['Vector reconstruction of the app flow.','No new transaction is submitted in this video.'],22,C.muted,34);
let b=browser(615,300,1210,590,'horkos-oaths.vercel.app/create')+text(655,412,'Pledge your trading-fee income.',34,C.ink,700)+pill(1475,385,'CHAIN 99801',C.soft,C.green,290)+label(655,468,'01 / YOUR REGISTERED TOKEN')+rr(655,488,1115,57,C.bg,10,C.line)+mono(678,526,'0x… registered ERC-20 on the demo hook',23)+label(655,593,'02 / CHOOSE YOUR COMMITMENT')+
rr(655,615,540,78,C.soft,12,stage>=1?C.green:C.line,stage>=1?2:1)+lock(684,646,.48)+text(719,661,'Vest my fee share',26,C.green,600)+rr(1215,615,555,78,C.bg,12,C.line)+flame(1245,652,.45)+text(1277,661,'Burn my fee share',26,C.muted,500)+
text(655,742,'Duration',21,C.muted)+rr(655,756,260,55,C.bg,8,C.line)+text(677,793,'30 days',25,C.ink,600)+text(965,742,'Cliff',21,C.muted)+rr(965,756,260,55,C.bg,8,C.line)+text(986,793,'1 day',25,C.ink,600)+rr(1300,755,470,57,C.green,8)+text(1425,793,'Commit on chain',24,C.white,600);
if(stage===2)b+=enter(rr(1020,330,760,51,C.lime,8)+text(1042,364,'Confirmation → deploy vault + route future creator fees',22,C.green,600),t,b2);
return sceneTitle(2,t,'Make the oath. Keep the terms.')+enter(left,t,.3)+enter(b,t,.6,30,0)+enter(cursor(stage===0?1665:stage===1?1120:1650,stage===0?430:stage===1?670:790,p*3%1),t,1.2);}
function routing(t,d,data,q){const feeAt=q?.cues?.[1]?.start??1,shareAt=q?.cues?.[2]?.start??3;return sceneTitle(3,t,'The fee share becomes a commitment.')+
enter(node(96,360,390,'01 / MOCK VOLUME','1,000 OATH','Declared trade notional'),t,feeAt-.3)+
enter(node(625,360,390,'02 / TOKEN TRADING FEE','10 OATH','1% of the declared notional'),t,feeAt+1.4)+
enter(arrow(505,452,604,452)+particles(t,505,452,604,452,2),t,feeAt+1.4)+
enter(path('M1034 452 H1130 V382 H1230')+particles(t,1130,382,1230,382,2),t,2)+
enter(rr(1250,303,575,162,C.soft,18)+label(1282,346,'75% / MOCK PROTOCOL')+heading(1282,409,'7.50 OATH',46),t,2.2)+
enter(path('M1130 452 V652 H1230')+particles(t,1130,652,1230,652,2),t,shareAt)+
enter(rr(1250,537,575,224,C.green,18)+label(1282,584,'25% / LAUNCHER’S VAULT',C.lime)+heading(1282,659,'2.50 OATH',58,C.white)+text(1282,710,'Bound by the selected oath terms',24,'#D5E1D0'),t,shareAt+.2)+
enter(rr(96,634,920,126,C.white,16,C.line)+label(126,679,'ASCEND’S DEFAULT TOKEN-FEE MODEL')+text(126,725,'25% default launcher share • 50% for approved arrangements',23,C.muted),t,4.2)+
enter(text(96,858,'Illustrated mock trade: only the fee moves. No AMM swap or token purchase occurs.',24,C.muted),t,4.8);}
function vesting(t,d){let v=ease((t-1.5)/(d*.65));let pts=`220,743 405,743 ${405+1220*v},${743-310*v}`;
return sceneTitle(4,t,'Vesting turns time into the commitment.')+
enter(pill(96,294,'ILLUSTRATION',C.soft,C.green,205)+text(325,324,'One deposit • 1-day cliff • 30-day duration',24,C.muted),t,.2)+
enter(rr(96,359,1728,473,C.white,20,C.line),t,.35)+
[430,550,670,744].map((y)=>path(`M220 ${y} H1700`,C.line,1)).join('')+
label(142,408,'FEES RELEASED')+mono(148,438,'2.50',20)+mono(148,753,'0.00',20)+
path('M220 744 H1700',C.muted,2)+path('M405 420 V744',C.line,2,'stroke-dasharray="6 8"')+
`<polyline points="${pts}" fill="none" stroke="${C.green}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`+
circle(405+1220*v,743-310*v,11,C.green)+circle(405+1220*v,743-310*v,20,'none',`stroke="${C.green}" opacity=".2" stroke-width="6"`)+
text(201,790,'Day 0',22,C.muted)+text(370,790,'Day 1',22,C.green,700)+text(1585,790,'Day 30',22,C.green,700)+
enter(rr(500,391,910,82,C.soft,14)+lock(537,425,.55)+text(577,442,'Locked at the cliff. Released linearly after it.',30,C.green,600),t,1)+
enter(text(96,882,'Anyone can settle • Terms cannot be edited • Schematic timeline; existing oath schedule governs new deposits',22,C.muted),t,3);}
function burn(t,d){const amt=1.25*ease((t-1.2)/1.5);return sceneTitle(5,t,'Commit a share. Settle to fixed destinations.')+
enter(rr(96,315,650,502,C.green,22)+label(132,366,'ILLUSTRATIVE VAULT DEPOSIT',C.lime)+heading(132,430,'2.50 OATH',56,C.white)+circle(420,633,121,'none',`stroke="#4C7556" stroke-width="33"`)+circle(420,633,121,'none',`stroke="${C.lime}" stroke-width="33" stroke-dasharray="380 760" transform="rotate(-90 420 633)"`)+heading(420,652,'50%',67,C.white).replace('<text ','<text text-anchor="middle" ')+text(420,699,'pledged to burn',20,C.lime,400,'text-anchor="middle"'),t,.25)+
enter(arrow(775,565,938,565)+particles(t,775,565,938,565,3),t,.9)+
enter(rr(970,315,855,225,C.white,20,C.line)+flame(1030,375,.7)+label(1082,383,'DEAD ADDRESS')+heading(1010,467,`${amt.toFixed(2)} OATH`,58)+mono(1400,463,'0x0000…dEaD',25),t,1.2)+
enter(rr(970,586,855,231,C.white,20,C.line)+shield(1030,650,.7)+label(1082,658,'TOKEN LAUNCHER')+heading(1010,742,`${amt.toFixed(2)} OATH`,58)+text(1450,737,'Remainder',25,C.muted),t,1.7)+
enter(text(96,878,'Permissionless settlement • Dead-address transfers leave ERC-20 total supply unchanged',24,C.muted),t,3);}
function record(t,d,data){const o=data[0];return sceneTitle(6,t,'The public record is already on chain.','DEPLOYED SNAPSHOT')+
enter(browser(96,292,1728,592,'horkos-oaths.vercel.app/oath/1'),t,.2)+
enter(label(132,404,'OATH #001 / VESTING')+heading(132,463,'Time is the promise.',43)+pill(1600,390,o.status,C.soft,C.green,180),t,.6)+
[[132,'HELD IN THE VAULT','7.50'],[693,'RELEASED TO LAUNCHER','0.00'],[1254,'SENT TO DEAD ADDRESS','0.00']].map(([x,l,a],i)=>enter(label(x,525,l)+heading(x,598,a,61)+text(x+200,596,'OATH',25,C.muted),t,.9+i*.2)).join('')+
enter(rr(132,637,790,201,C.bg,14)+label(160,675,'THE UNLOCK SCHEDULE')+text(160,722,'1-day cliff → linear release through day 30',28,C.ink,600)+path('M160 756 H882',C.line,8)+circle(160,756,7,C.green)+text(160,804,'Immutable terms • Funds read from the vault',22,C.muted),t,1.8)+
enter(rr(956,637,831,201,C.bg,14)+label(984,675,'THE CHAIN IS THE SOURCE')+mono(984,721,`Vault   ${short(o.vault)}`,22)+mono(984,763,`Block   ${Number(o.blockNumber).toLocaleString('en-US')}`,22)+text(984,804,'Explorer-linked creation and transaction events',22,C.muted),t,2.4)+
enter(text(96,925,`Recorded ${o.checkedAt.slice(0,10)} • ${o.checkedAt.slice(11,19)} UTC • Elysium Testnet • mock-hook`,21,C.muted),t,3.3);}
function settled(t,d,data){const o=data[1];return sceneTitle(7,t,'A settlement you can inspect.','DEPLOYED SNAPSHOT')+
enter(browser(96,294,1728,590,'horkos-oaths.vercel.app/oath/2'),t,.2)+
enter(label(132,409,'OATH #002 / 50% BURN')+heading(132,473,'A share, committed.',44)+pill(1595,392,o.status,C.soft,C.green,190),t,.5)+
[[132,'RECEIVED BY THE VAULT','7.50',C.ink],[700,'TO THE LAUNCHER','3.75',C.green],[1268,'TO THE DEAD ADDRESS','3.75',C.green]].map(([x,l,a,col],i)=>enter(rr(x,517,520,195,i?C.soft:C.bg,16)+label(x+26,559,l)+heading(x+26,640,a,64,col)+text(x+225,639,'OATH',25,C.muted),t,.85+i*.45)).join('')+
enter(rr(132,751,1650,88,C.bg,14)+circle(165,795,5,C.green)+text(190,805,'Active: settlement is complete, but the 30-day commitment period is still running.',27,C.ink,500),t,2.7)+
enter(text(96,926,`Recorded ${o.checkedAt.slice(0,10)} • Block ${Number(o.blockNumber).toLocaleString('en-US')} • Actual deployed burn-vault balances`,21,C.muted),t,3.3);}
function breach(t,d){let broken=t>1.65;let returned=t>4.3;return sceneTitle(8,t,'Routing can change. The history cannot.','BEHAVIOR ILLUSTRATION')+
enter(node(96,370,420,'01 / FUTURE FEES','Launcher share','Recipient can be redirected'),t,.2)+
enter(vault(1070,530,.78),t,.6)+enter(label(935,718,'EXISTING DEPOSITS')+text(897,759,'Still bound by original terms',26,C.green,600),t,1.4)+
enter(rr(1430,365,395,156,broken?C.redBg:C.soft,18)+label(1460,411,'LAUNCHER WALLET',broken?C.red:C.green)+text(1460,466,'Redirected recipient',26,C.ink,600),t,.8)+
enter(path(broken&&!returned?'M540 461 H697 V327 H1620 V350':'M540 461 H940',broken&&!returned?C.red:C.green,4)+particles(t,540,461,broken&&!returned?697:940,461,3,broken?C.red:C.green),t,1)+
enter(pill(1413,622,broken?'BREACHED':'ACTIVE',broken?C.redBg:C.soft,broken?C.red:C.green,330),t,1.4)+
(returned?enter(text(1300,742,'Routing restored. Breach remains.',25,C.red,600),t,4.3):'')+
enter(rr(96,815,1728,88,C.white,14,C.line)+text(124,870,'Changing the recipient after creation leaves a permanent breach, even if the vault is restored.',27,broken?C.red:C.green,600),t,1.7);}
function api(t,d,data){const o=data[0], rows=[['status',`"${o.status}"`],['locked',`"${o.locked}"`],['decimals','18'],['blockNumber',`"${o.blockNumber}"`],['chainId','99801'],['source','"mock-hook"']];return sceneTitle(9,t,'Public evidence, ready for other apps.')+
enter(rr(96,320,650,536,C.green,22)+shield(157,390,.85,C.lime)+heading(132,486,'One public verdict.',46,C.white)+lines(132,550,['A holder, dashboard, or verifier','can read the same chain evidence.'],28,'#DAE4D5',43)+pill(132,690,'NO WALLET REQUIRED','#3D6C50',C.lime,340)+text(132,796,'Amounts use integer token base units.',23,'#CCDCC7'),t,.25)+
enter(rr(800,320,1024,536,C.ink,22)+label(837,366,'GET /api/oath/{token-address}',C.lime)+mono(837,413,'{',27,'#E6EDDF')+rows.map(([k,v],i)=>enter(mono(867,462+i*49,`"${k}":`,24,'#AFC5A5')+mono(1180,462+i*49,v,24,C.white),t,.7+i*.25)).join('')+mono(837,804,'}',27,'#E6EDDF'),t,.55,20,0)+
enter(text(96,917,'Walletless verification • Checked at a mined block • No server signing key',24,C.muted),t,2.6);}
function scope(t,d){return sceneTitle(10,t,'A natural next layer for the Ascend ecosystem.')+
enter(rr(96,321,790,480,C.white,22,C.line)+label(132,374,'WORKING ON ELYSIUM TESTNET')+heading(132,449,'The commitment layer',45)+[
'Immutable vesting and burn vaults','Permanent recipient-diversion record','Public dapp, events, and verdict API'].map((s,i)=>shield(152,521+i*84,.38)+text(185,529+i*84,s,29,C.ink,500)).join(''),t,.3)+
enter(arrow(915,550,1004,550)+particles(t,915,550,1004,550,2),t,.9)+
enter(rr(1038,321,786,480,C.green,22)+label(1074,374,'NEXT / VALIDATE REAL ASCEND ROUTING',C.lime)+heading(1074,449,'From fee share to proof',42,C.white)+lines(1074,523,['Ascend supplies the launch and fee flow.','Horkos records the launcher’s commitment.','Holders verify what happened to the income.'],27,'#E0E8D8',57)+pill(1074,714,'INTEGRATION TO VALIDATE','#3A6B50',C.lime,420),t,1.1)+
enter(text(96,870,'Current demo: directly deployed OATH tokens + mock fee hook • No live Ascend pool integration is claimed',23,C.muted),t,2.1);}
function close(t,d){return `<rect width="1920" height="1080" fill="${C.ink}"/>`+
enter(label(100,214,'ASCEND × HORKOS',C.lime),t,.2)+enter(heading(96,358,'Launch the token.',93,C.bg),t,.3)+enter(heading(96,475,'Make the fee pledge',88,C.lime),t,.55)+enter(heading(96,583,'verifiable.',88,C.lime),t,.75)+
enter(rr(96,682,1115,91,'#2D4B3B',14)+text(126,741,'horkos-oaths.vercel.app',40,C.white,500),t,1.05)+
enter(text(100,831,'github.com/dotmantissa/horkos',28,'#C1D3BB')+text(100,886,'Testnet prototype • Mock fee hook • Verify the terms and source',22,'#91AA91'),t,1.35)+
enter(vault(1550,511,1.22,true),t,.7,20,0)+[190,255].map(r=>`<circle cx="1550" cy="500" r="${r}" fill="none" stroke="#3A5740" stroke-width="1.4"/>`).join('');}
const SCENES=[intro,problem,create,routing,vesting,burn,record,settled,breach,api,scope,close];
function header(dark,index){let ink=dark?C.bg:C.ink,line=dark?'#34503D':C.line;return rr(96,48,42,42,'none',11,dark?C.lime:C.green,2)+text(106,78,'H',25,dark?C.lime:C.green,700)+text(153,81,'HORKOS',27,ink,700,'letter-spacing="3"')+text(1830,78,'ELYSIUM TESTNET / 99801',19,dark?'#BDCEB7':C.muted,500,'text-anchor="end" letter-spacing="1.4"')+path('M96 112 H1824',line,1);}
function wrapCaption(s,max=88){let words=s.split(/\s+/),ls=[''];for(const word of words){if((ls.at(-1)+' '+word).trim().length>max)ls.push(word);else ls[ls.length-1]=(ls.at(-1)+' '+word).trim();}return ls;}
function footer(globalT,timeline,captions){let current=captions.find(c=>globalT>=c.start&&globalT<c.end),total=timeline.at(-1).end,idx=timeline.findIndex(c=>globalT<c.end);const caption=current?wrapCaption(current.text):[];return rr(0,948,1920,132,C.ink,0)+path('M96 949 H1824','#3B5540',1)+caption.map((s,i)=>text(960,caption.length===1?1017:994+i*40,s,31,C.bg,500,'text-anchor="middle"')).join('')+rr(0,1073,1920,7,'#294233',0)+rr(0,1073,1920*clamp(globalT/total),7,C.lime,0);}
export function frame(globalT,timeline,captions,data){let idx=timeline.findIndex(c=>globalT<c.end);if(idx<0)idx=timeline.length-1;const scene=timeline[idx],t=Math.max(0,globalT-scene.start),dur=scene.end-scene.start,dark=idx===0||idx===11;let body=SCENES[idx](t,dur,data,scene)+header(dark,idx);let incoming=ease(t/.55),off=20*(1-incoming);let out=`<g opacity="${incoming}" transform="translate(${off} 0)">${body}</g>`;
// Whole-scene dissolve uses the preceding scene underneath. This avoids a flash or a black gap.
if(idx>0&&t<.55){let prev=timeline[idx-1];let old=SCENES[idx-1](prev.end-prev.start,prev.end-prev.start,data,prev)+header(idx-1===0||idx-1===11,idx-1);out=`<g opacity="${1-incoming}">${old}</g>`+out;}
return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="${C.bg}"/>${out}${footer(globalT,timeline,captions)}</svg>`;}
