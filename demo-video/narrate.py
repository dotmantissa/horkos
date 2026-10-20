"""Generate per-scene male English narration and exact sentence cues."""
import asyncio,json,pathlib,subprocess,wave,os
import edge_tts,imageio_ffmpeg
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'outputs/demo-video'; AUDIO=OUT/'audio';AUDIO.mkdir(exist_ok=True)
STORY=json.loads((ROOT/'demo-video/storyboard.json').read_text())
async def one(index,scene):
    target=AUDIO/f'{index:02d}-{scene["id"]}'
    if target.with_suffix('.mp3').exists() and target.with_suffix('.json').exists():return
    for attempt in range(2):
        try:
            cues=[]
            com=edge_tts.Communicate(scene['narration'],'en-US-GuyNeural',rate='+6%',boundary='SentenceBoundary')
            with target.with_suffix('.mp3').open('wb') as f:
                async for item in com.stream():
                    if item['type']=='audio':f.write(item['data'])
                    elif item['type']=='SentenceBoundary':cues.append({'start':item['offset']/1e7,'end':(item['offset']+item['duration'])/1e7,'text':item['text']})
            if not cues or target.with_suffix('.mp3').stat().st_size<1000:raise RuntimeError('Empty narration')
            target.with_suffix('.json').write_text(json.dumps(cues,indent=2))
            print(index,scene['id'],'voice generated',flush=True);return
        except Exception as e:
            print(index,scene['id'],'attempt',attempt+1,type(e).__name__,str(e),flush=True)
            if attempt==1:raise
async def main():
    # Small bounded batch; one clip can be recovered without repeating completed clips.
    for i in range(0,len(STORY),2):await asyncio.gather(*[one(j,STORY[j]) for j in range(i,min(i+2,len(STORY)))])
asyncio.run(main())
