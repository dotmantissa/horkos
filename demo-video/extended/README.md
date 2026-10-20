# Horkos extended vector film

Deliverables are named **Harkos Demo AGENTROUTER.mp4** (270.812 seconds) and **Harkos Demo AGENTROUTER - Submission Cut.mp4** (90.56 seconds), following the requested filenames. The product name within the film remains Horkos.

These are authored SVG motion films, 1920 × 1080 at 30 fps, H.264/AAC, with male British English narration using Microsoft's synthetic `en-GB-RyanNeural` voice. Every visual is a vector shape or text; no generated raster artwork or generative video is used. The MP4 is a standard encoded video; the editable original remains SVG. Smooth fades, cursor movement and moving fee-flow arrows come from deterministic code.

The detailed cut explains the intended users, Ascend relationship, default fee split, creation workflow, settlement, vesting, dead-address allocation, permanent breach history, holder records, API, verified implementation and integration roadmap. The submission cut covers the same central commitment flow in about 90 seconds.

Public Elysium testnet API evidence was captured on 2026-10-20 at blocks 12326956 and 12327002. Oath 1 holds 7.5 OATH; oath 2 has settled 3.75 to the launcher and 3.75 to the dead address. Both were Active at those checked blocks. The film labels these as prepared samples. Creation and breach scenes are animated illustrations, not new transaction recordings. Tokens were deployed directly; fees come from the mock hook, and real Ascend integration remains unverified. No wallet keys are included. This production sends no transactions.

## Timing and captions

Narration clips start at the exact measured scene offsets. Each scene includes 0.85 seconds of breathing space. Sentence captions use word-weight estimates within each measured speech clip, so sentence timing is approximate while scene and track placement are exact. MP4s include selectable English captions; sidecar SRTs are provided. The offline SVG player displays the same captions and can scrub either cut.

Audio is normalized toward -16 LUFS, with a -2 dBTP normalization target, and exported as 48 kHz stereo AAC. The source archive includes the original clips, normalized WAVs, timelines, captions, public evidence and fonts/licenses. Existing narration can be reused locally without contacting the voice service.

## Source and reproduction

The source archive's `preview.html` is a self-contained SVG player with local narration and fonts. Unzip before opening; keep relative folders together. The `editable-project/` folder reproduces repository structure. Its `outputs/video-demo/` contains the public evidence and measured audio; runtime dependencies and generated MP4s are omitted.

From the project root, install the rendering dependency with `npm ci --prefix demo-video`. Install `edge-tts` and `imageio-ffmpeg` into `outputs/video-tools` if generating speech or assembling audio. A Linux DejaVu installation supplies the renderer fonts; font copies and licenses are included for the offline player. Use Node 22 or later.

```sh
python3 -m pip install --target outputs/video-tools edge-tts imageio-ffmpeg
# Optional: only needed if replacing or generating missing narration clips:
python3 demo-video/extended/narrate.py
python3 demo-video/extended/assemble.py
export FFMPEG_PATH="$(PYTHONPATH=outputs/video-tools python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')"
node demo-video/extended/render.mjs detailed
node demo-video/extended/render.mjs submission
node demo-video/extended/preview.mjs
```

The renderer uses four independent encoding processes. Completed output should be decoded and inspected before delivery; partial segment files are not final videos. The offline viewer and rendered previews were checked for text overflow, captions and audio readiness. Full exports are decoded for validation separately.

## Verified final exports

Both complete MP4s decoded successfully. The detailed film contains 8,125 frames, 52 sentence captions and measures -16.53 LUFS with -4.69 dBTP peak. The submission cut contains 2,717 frames, 19 captions and measures -16.63 LUFS with -4.69 dBTP peak. Encoded picture durations are approximately 270.833 and 90.567 seconds due to rounding to 30 fps; the speech timelines are 270.812 and 90.560 seconds. The offline player passed 93 representative scene/caption frame checks without text outside the safe frame or JavaScript errors, and narration playback was verified. Final decoded frames were visually inspected.
