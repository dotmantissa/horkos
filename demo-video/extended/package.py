"""Package allowlisted source, public evidence, measured narration and captions."""
from pathlib import Path
import json,re,zipfile,hashlib,shutil
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'outputs/video-demo'
archive=OUT/'Harkos Demo AGENTROUTER - Editable Vector Source.zip'
allow=[]
for p in (ROOT/'demo-video').rglob('*'):
 if p.is_file() and 'node_modules' not in p.parts and '__pycache__' not in p.parts:
  allow.append((p,Path('editable-project')/p.relative_to(ROOT)))
for cut in ['detailed','submission']:
 for suffix in ['-timeline.json','-captions.json','-transcript.txt','-narration.wav','-validation.json','.srt']:
  p=OUT/f'{cut}{suffix}';allow.append((p,Path('editable-project/outputs/video-demo')/p.name))
 for p in sorted(OUT.glob(f'{cut}-[0-9][0-9].*')):
  if p.suffix in ['.mp3','.wav']:allow.append((p,Path('editable-project/outputs/video-demo')/p.name))
for n in ['verified-state.json','vector-qa.json']:
 p=OUT/n;allow.append((p,Path('editable-project/outputs/video-demo')/p.name))
for p in (OUT/'source/fonts').iterdir():allow.append((p,Path('fonts')/p.name))
secret=re.compile(r'ghp_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|PRIVATE_KEY\s*=\s*0x[0-9a-fA-F]{64}')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p,name in allow:
  assert p.exists(),str(p)
  if p.suffix in ['.md','.json','.txt','.py','.mjs']:assert not secret.search(p.read_text()),str(p)
  assert p.name not in ['TASKS.md','AGENT.md','AGENTS.md','.env']
  z.write(p,str(name))
 html=(OUT/'source/preview.html').read_text().replace('src="detailed-narration.wav"','src="editable-project/outputs/video-demo/detailed-narration.wav"').replace("audio.src=cut+'-narration.wav'","audio.src='editable-project/outputs/video-demo/'+cut+'-narration.wav'")
 z.writestr('preview.html',html)
 z.writestr('README.md',(ROOT/'demo-video/extended/README.md').read_text())
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print('Validated archive:',archive.name,archive.stat().st_size,'bytes')
