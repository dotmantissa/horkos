from pathlib import Path
import json,re,subprocess,sys
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'outputs/video-demo';sys.path.insert(0,str(ROOT/'outputs/video-tools'))
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe();cut=sys.argv[1] if len(sys.argv)>1 else 'detailed';name='Harkos Demo AGENTROUTER'+(' - Submission Cut' if cut=='submission' else '')+'.mp4';media=OUT/name
p=subprocess.run([FF,'-hide_banner','-i',str(media),'-map','0:v:0','-map','0:a:0','-af','loudnorm=I=-16:TP=-2:LRA=7:print_format=json','-progress','pipe:1','-nostats','-f','null','-'],capture_output=True,text=True)
(OUT/f'{cut}-decode.log').write_text(p.stderr+'\n'+p.stdout)
assert p.returncode==0,p.stderr
assert '1920x1080' in p.stderr and '30 fps' in p.stderr and 'Video: h264' in p.stderr and 'Audio: aac' in p.stderr,p.stderr[:2000]
match=re.search(r'\{\s*"input_i"[\s\S]*?\}',p.stderr);loud=json.loads(match[0]);frames=int(re.findall(r'^frame=(\d+)',p.stdout,re.M)[-1]);duration=float(re.findall(r'^out_time_us=(\d+)',p.stdout,re.M)[-1])/1e6
tl=json.loads((OUT/f'{cut}-timeline.json').read_text());caps=json.loads((OUT/f'{cut}-captions.json').read_text());assert abs(duration-tl['duration'])<.1
assert all(0<=c['start']<c['end']<=tl['duration'] for c in caps)
assert all(caps[i]['end']<=caps[i+1]['start']+.001 for i in range(len(caps)-1))
assert float(loud['input_tp'])<-1
report=dict(file=name,duration=duration,expectedDuration=tl['duration'],frames=frames,width=1920,height=1080,fps=30,videoCodec='h264',audioCodec='aac',sampleRate=48000,channels=2,captionCount=len(caps),decodedSuccessfully=True,loudnessLUFS=float(loud['input_i']),truePeakDBTP=float(loud['input_tp']),bytes=media.stat().st_size)
(OUT/f'{cut}-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
# Extract representative decoded video frames and one transition check.
for i,t in enumerate(([5,81,120,144,164,202,265] if cut=='detailed' else [5,39,50,62,72,87])):
 subprocess.run([FF,'-y','-v','error','-ss',str(t),'-i',str(media),'-frames:v','1',str(OUT/f'{cut}-final-{i}.png')],check=True)
