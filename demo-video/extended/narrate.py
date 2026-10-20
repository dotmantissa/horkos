"""Generate missing male English narration clips; reuse verified clips on resume."""
from pathlib import Path
import sys, asyncio, json, subprocess, wave
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'outputs/video-demo';OUT.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(ROOT/'outputs/video-tools'))
import edge_tts, imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
async def main():
 for cut in ['detailed','submission']:
  scenes=json.loads((Path(__file__).parent/f'{cut}-script.json').read_text()); elapsed=0
  for i,scene in enumerate(scenes):
   target=OUT/f'{cut}-{i:02}.mp3'
   if not target.exists() or target.stat().st_size<1000:
    await asyncio.wait_for(edge_tts.Communicate(scene['narration'],voice='en-GB-RyanNeural',rate='+5%' if cut=='submission' else '+0%').save(str(target)),timeout=60)
   pcm=OUT/f'{cut}-{i:02}.wav'
   if not pcm.exists():subprocess.run([FF,'-y','-v','error','-i',str(target),'-ar','48000','-ac','1',str(pcm)],check=True)
   with wave.open(str(pcm)) as w:duration=w.getnframes()/w.getframerate()
   scene.update(audio=pcm.name,speechDuration=duration,duration=duration+.85,start=elapsed);elapsed+=scene['duration']
   print(cut,i,round(duration,3),flush=True)
  (OUT/f'{cut}-timeline.json').write_text(json.dumps({'cut':cut,'duration':elapsed,'scenes':scenes},indent=2)+'\n')
asyncio.run(main())
