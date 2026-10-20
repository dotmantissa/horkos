import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {Resvg} from '@resvg/resvg-js';
import {frame} from './animation.mjs';
const DIR=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(DIR,'../..'),OUT=path.join(ROOT,'outputs/video-demo');
const cut=process.argv[2]||'detailed',timeline=JSON.parse(fs.readFileSync(path.join(OUT,`${cut}-timeline.json`))),proof=JSON.parse(fs.readFileSync(path.join(OUT,'verified-state.json'))),caps=JSON.parse(fs.readFileSync(path.join(OUT,`${cut}-captions.json`)));
const ff=process.env.FFMPEG_PATH||path.join(ROOT,'outputs/video-tools/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2');
const FPS=30,TOTAL=Math.ceil(timeline.duration*FPS),PARTS=4,opts={font:{fontFiles:['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'],loadSystemFonts:false,defaultFontFamily:'DejaVu Sans'}};
if(process.argv.includes('--segment')||process.argv.includes('--benchmark')){
 const bench=process.argv.includes('--benchmark'),seg=bench?0:Number(process.argv[process.argv.indexOf('--segment')+1]),start=bench?0:Math.round(seg*TOTAL/PARTS),end=bench?60:Math.round((seg+1)*TOTAL/PARTS),target=path.join(OUT,bench?'benchmark.mp4':`${cut}-part-${seg}.mp4`);
 const encoder=spawn(ff,['-y','-v','warning','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-r','30','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',target],{stdio:['pipe','ignore','inherit']});const done=once(encoder,'exit');const begin=Date.now();
 for(let n=start;n<end;n++){const pix=new Resvg(frame(n/FPS,timeline,proof,caps),opts).render().pixels;if(!encoder.stdin.write(pix))await once(encoder.stdin,'drain');if((n-start)%300===0)console.log(`${cut} part ${seg}: ${n-start}/${end-start}`);}
 encoder.stdin.end();const [code]=await done;if(code)throw Error(`Encoder failed: ${code}`);console.log(`${cut} part ${seg} done in ${((Date.now()-begin)/1000).toFixed(1)}s`);process.exit(0);
}
await Promise.all(Array.from({length:PARTS},(_,i)=>new Promise((resolve,reject)=>{const p=spawn(process.execPath,[fileURLToPath(import.meta.url),cut,'--segment',String(i)],{stdio:'inherit'});p.on('error',reject);p.on('exit',c=>c===0?resolve():reject(Error(`Segment ${i} failed: ${c}`)));})));
const list=path.join(OUT,`${cut}-parts.txt`);fs.writeFileSync(list,Array.from({length:PARTS},(_,i)=>`file '${path.join(OUT,`${cut}-part-${i}.mp4`)}'`).join('\n')+'\n');
const target=path.join(OUT,cut==='detailed'?'Harkos Demo AGENTROUTER.mp4':'Harkos Demo AGENTROUTER - Submission Cut.mp4');
execFileSync(ff,['-y','-v','warning','-f','concat','-safe','0','-i',list,'-i',path.join(OUT,`${cut}-narration.wav`),'-i',path.join(OUT,`${cut}.srt`),'-map','0:v:0','-map','1:a:0','-map','2:s:0','-c:v','copy','-c:a','aac','-b:a','192k','-c:s','mov_text','-metadata:s:s:0','language=eng','-t',String(timeline.duration),'-movflags','+faststart','-metadata','title=Horkos — narrated vector demo','-metadata','artist=dotmantissa','-metadata','comment=Authored SVG animation with male English synthetic narration. Verified testnet snapshots and illustrative workflow. No new transactions.',target],{stdio:'inherit'});console.log(`READY: ${target}`);
