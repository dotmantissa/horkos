import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {Resvg} from '@resvg/resvg-js';
import {frame} from './scenes.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),OUT=path.join(ROOT,'outputs/demo-video');
const timeline=JSON.parse(fs.readFileSync(path.join(OUT,'timeline.json'))),captions=JSON.parse(fs.readFileSync(path.join(OUT,'captions.json'))),data=[1,2].map(i=>JSON.parse(fs.readFileSync(path.join(OUT,`oath-${i}.json`))));
const FPS=30,DURATION=timeline.at(-1).end,TOTAL=Math.round(DURATION*FPS);
const fontFiles=fs.readdirSync(path.join(ROOT,'demo-video/fonts')).filter(x=>x.endsWith('.ttf')).map(x=>path.join(ROOT,'demo-video/fonts',x));
if(!fontFiles.some(p=>p.endsWith('DejaVuSansMono.ttf')))fontFiles.push('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf');
const options={font:{fontFiles,loadSystemFonts:false,defaultFontFamily:'DM Sans'},logLevel:'error'};
const ffmpeg=execFileSync(path.join(OUT,'.venv/bin/python'),['-c','import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).trim();
if(process.argv.includes('--stills')){
 fs.mkdirSync(path.join(OUT,'stills'),{recursive:true});
 for(let i=0;i<timeline.length;i++){
   const s=timeline[i],t=s.start+(s.end-s.start)*.64,svg=frame(t,timeline,captions,data),r=new Resvg(svg,options);
   fs.writeFileSync(path.join(OUT,'stills',`${String(i).padStart(2,'0')}-${s.id}.svg`),svg);
   fs.writeFileSync(path.join(OUT,'stills',`${String(i).padStart(2,'0')}-${s.id}.png`),r.render().asPng());
 }
 console.log('Saved twelve vector masters and 1080p preview frames.');process.exit(0);
}
if(process.argv.includes('--segment')){
 const segment=Number(process.argv[process.argv.indexOf('--segment')+1]),PARTS=4;
 const start=Math.round(segment*TOTAL/PARTS),end=Math.round((segment+1)*TOTAL/PARTS),target=path.join(OUT,`part-${segment}.mp4`);
 const args=['-y','-v','warning','-f','rawvideo','-pix_fmt','rgba','-s','1920x1080','-r',String(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-threads','2','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',target];
 const encoder=spawn(ffmpeg,args,{stdio:['pipe','ignore','inherit']});let done=once(encoder,'exit');
 for(let n=start;n<end;n++){
   const svg=frame(n/FPS,timeline,captions,data),resvg=new Resvg(svg,options),pixels=resvg.render().pixels;
   if(!encoder.stdin.write(pixels))await once(encoder.stdin,'drain');
   if((n-start)%150===0)console.log(`Part ${segment+1}/4: ${n-start}/${end-start} frames`);
 }
 encoder.stdin.end();const [code]=await done;if(code!==0)throw Error(`Encoder exited ${code}`);console.log(`Part ${segment+1} complete`);process.exit(0);
}
// Independent frame ranges, same deterministic timeline. No agent delegation.
const logs=fs.createWriteStream(path.join(OUT,'render.log'),{flags:'a'});
await Promise.all([0,1,2,3].map(i=>new Promise((resolve,reject)=>{
 const proc=spawn(process.execPath,[fileURLToPath(import.meta.url),'--segment',String(i)],{stdio:['ignore','pipe','pipe']});
 for(const stream of [proc.stdout,proc.stderr])stream.on('data',b=>{process.stdout.write(b);logs.write(b)});
 proc.on('exit',code=>code===0?resolve():reject(Error(`Segment ${i} failed: ${code}`)));
})));
const list=[0,1,2,3].map(i=>`file '${path.join(OUT,`part-${i}.mp4`)}'`).join('\n');fs.writeFileSync(path.join(OUT,'parts.txt'),list+'\n');
execFileSync(ffmpeg,['-y','-v','warning','-f','concat','-safe','0','-i',path.join(OUT,'parts.txt'),'-i',path.join(OUT,'soundtrack.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t',String(DURATION),'-movflags','+faststart','-metadata','title=Horkos — Ascend Hackathon Demo','-metadata','artist=dotmantissa','-metadata','comment=116-second authored SVG motion demo. Male English narration. Deployed snapshot and illustrated flows are labeled.',path.join(OUT,'Horkos - Hackathon Demo.mp4')],{stdio:'inherit'});
logs.end();console.log('Final MP4 ready.');
