"""Measure narration, build an exact 116-second score, and emit timed captions."""
import json,pathlib,subprocess,wave,math
import numpy as np
import imageio_ffmpeg
ROOT=pathlib.Path(__file__).resolve().parent.parent;OUT=ROOT/'outputs/demo-video';AUDIO=OUT/'audio';SR=48000;TARGET=116;TEMPO=1.12
ff=imageio_ffmpeg.get_ffmpeg_exe();story=json.loads((ROOT/'demo-video/storyboard.json').read_text());timeline=[];captions=[];position=0
full=np.zeros(SR*TARGET,dtype=np.float32);voice=np.zeros_like(full)
for i,s in enumerate(story):
    stem=AUDIO/f'{i:02d}-{s["id"]}';wav=stem.with_name(stem.name+'-paced.wav')
    subprocess.run([ff,'-y','-v','error','-i',str(stem.with_suffix('.mp3')),'-af',f'atempo={TEMPO}','-ar',str(SR),'-ac','1',str(wav)],check=True)
    with wave.open(str(wav),'rb') as w:clip=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float32)/32768
    # No abrupt edits: short fades at the waveform edges.
    f=min(240,len(clip)//2);clip[:f]*=np.linspace(0,1,f);clip[-f:]*=np.linspace(1,0,f)
    lead=.5 if i==0 else .35;tail=.25
    start=position;audioStart=start+lead;audioEnd=audioStart+len(clip)/SR;end=audioEnd+tail
    if end>TARGET:raise RuntimeError('Narration exceeds requested duration')
    n=round(audioStart*SR);voice[n:n+len(clip)]=clip
    cues=json.loads(stem.with_suffix('.json').read_text());local=[]
    for j,c in enumerate(cues):
        cs=lead+c['start']/TEMPO;ce=lead+c['end']/TEMPO
        if j+1<len(cues):ce=min(ce,lead+cues[j+1]['start']/TEMPO)
        c2={'start':start+cs,'end':min(start+ce,audioEnd),'text':c['text']}
        captions.append(c2);local.append({'start':cs,'end':ce,'text':c['text']})
    timeline.append({**s,'start':start,'end':end,'audioStart':audioStart,'audioEnd':audioEnd,'cues':local});position=end
    print(f'{s["id"]:10} {start:6.2f}–{end:6.2f}   voice {len(clip)/SR:.2f}s',flush=True)
timeline[-1]['end']=TARGET
# Original sparse ambient bed. Sine partials, no samples and no borrowed music.
t=np.arange(len(full))/SR
chords=[[130.8128,164.8138,195.9977],[110,146.8324,164.8138],[97.9989,130.8128,164.8138],[110,130.8128,164.8138]]
bed=np.zeros_like(full)
for j,start in enumerate(np.arange(0,TARGET,8.0)):
    dur=10;ind=(t>=start)&(t<start+dur);tt=t[ind]-start;env=np.sin(np.pi*tt/dur)**2
    z=sum(np.sin(2*np.pi*f*tt+.10*np.sin(.8*tt))+.15*np.sin(2*np.pi*f*2*tt) for f in chords[j%4])/len(chords[0])
    bed[ind]+=z*env*.0032
# Gentle bespoke transition ticks, kept far below the voice.
for s in timeline[1:]:
    n=int((s['start']+.05)*SR);tt=np.arange(int(.15*SR))/SR
    tick=.006*np.sin(2*np.pi*(500*tt-900*tt**2))*np.exp(-tt*35);bed[n:n+len(tick)]+=tick
fade=np.minimum(1,t/2)*np.minimum(1,(TARGET-t)/2);bed*=fade
mix=np.clip(voice+bed,-.98,.98)
def save(name,arr):
    with wave.open(str(OUT/name),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(arr,-1,1)*32767).astype('<i2').tobytes())
save('narration.wav',voice);save('music-bed.wav',bed);save('mix-pre.wav',mix)
subprocess.run([ff,'-y','-v','error','-i',str(OUT/'mix-pre.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar',str(SR),'-ac','2',str(OUT/'soundtrack.wav')],check=True)
(OUT/'timeline.json').write_text(json.dumps(timeline,indent=2,ensure_ascii=False)+'\n');(OUT/'captions.json').write_text(json.dumps(captions,indent=2,ensure_ascii=False)+'\n')
def clock(sec,sep=','):
    ms=round(sec*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}'
srt='\n\n'.join(f'{i+1}\n{clock(c["start"])} --> {clock(c["end"])}\n{c["text"]}' for i,c in enumerate(captions))+'\n'
(OUT/'Horkos - Hackathon Demo.srt').write_text(srt)
(OUT/'transcript.txt').write_text('\n\n'.join(f'{clock(s["start"],".")}  {s["title"]}\n{s["narration"]}' for s in timeline)+'\n')
print(f'Timeline: {TARGET}s; {len(captions)} sentence cues; speech ends {timeline[-1]["audioEnd"]:.2f}s; peak {np.max(np.abs(voice)):.3f}')
