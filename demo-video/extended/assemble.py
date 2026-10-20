"""Reuse measured Ryan narration; write exact audio placement and sentence captions."""
from pathlib import Path
import json, re, wave, subprocess, sys
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'outputs/video-demo'
sys.path.insert(0,str(ROOT/'outputs/video-tools'))
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
def stamp(t):
 ms=round(t*1000); return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
for cut in ['detailed','submission']:
 timeline=json.loads((OUT/f'{cut}-timeline.json').read_text());caps=[];speech=bytearray(round(timeline['duration']*48000)*2)
 for s in timeline['scenes']:
  with wave.open(str(OUT/s['audio'])) as w:
   assert w.getframerate()==48000 and w.getnchannels()==1 and w.getsampwidth()==2
   raw=w.readframes(w.getnframes())
  off=round(s['start']*48000)*2;speech[off:off+len(raw)]=raw
  sentences=re.split(r'(?<=[.!?])\s+',s['narration']); weights=[len(re.findall(r'\w+',x)) for x in sentences]; total=sum(weights); t=s['start']
  for sentence,weight in zip(sentences,weights):
   end=t+s['speechDuration']*weight/total;caps.append(dict(start=t,end=end,text=sentence));t=end
 (OUT/f'{cut}-captions.json').write_text(json.dumps(caps,indent=2)+'\n')
 (OUT/f'{cut}.srt').write_text('\n\n'.join(f"{i+1}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}" for i,c in enumerate(caps))+'\n')
 (OUT/f'{cut}-transcript.txt').write_text('\n\n'.join(f"{stamp(s['start'])} — {s['title']}\n{s['narration']}" for s in timeline['scenes'])+'\n')
 rawfile=OUT/f'{cut}-narration-raw.wav'
 with wave.open(str(rawfile),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(speech)
 subprocess.run([FF,'-y','-v','error','-i',str(rawfile),'-af','loudnorm=I=-16:TP=-2:LRA=7','-ar','48000','-ac','2',str(OUT/f'{cut}-narration.wav')],check=True)
 print(cut,round(timeline['duration'],3),'seconds',len(caps),'sentence cues',flush=True)
