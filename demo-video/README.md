# Horkos hackathon film

A 116-second, 1920×1080, 30 fps narrated motion demo for Ascend's hackathon. All artwork, diagrams, interface reconstructions, animation, and captions are authored SVG. The delivery MP4 is a normal raster video encoded as H.264/AAC for submission; the editable master remains vector.

The male English narrator uses Microsoft's `en-US-GuyNeural` synthetic voice. Sentence metadata from the generated speech drives caption timing; each measured clip is paced 1.12× with FFmpeg, then placed on a fixed timeline. The quiet music bed and transition sounds are original sine-wave synthesis with no sampled music. No generative image or video model is used.

## Content and evidence

The film introduces Horkos as a complementary commitment layer for Ascend launcher fee income. Creation is an explicit vector reconstruction; breach is an explicit behavior illustration. The oath detail scenes reproduce actual public testnet API records captured on 2026-10-20, rather than pretending a new transaction was signed during this production.

Oath 1: Active, 7.5 OATH held, one-day cliff and 30-day duration; checked block 12326088. Oath 2: Active, 3.75 OATH released and 3.75 OATH transferred to the dead address; checked block 12326190. The film identifies directly deployed demo tokens and mock fee routing; real Ascend pool integration remains a validation step. A dead-address transfer does not reduce token supply. Immutable terms apply to deposited funds; the breach record exposes future routing changes.

Ascend's official [Trading Fee Breakdown](https://ascendlaunch.gitbook.io/docs/trading-fee-breakdown) was rechecked during production. It documents a 1% token trading fee with a 25% default deployer share, or a 50% share for approved active creators/takeover operators. These arrangements are alternatives. The diagram follows the demo's default model. The 1% is not an all-in trading cost; separate swap and network fees may apply.

## Files

- `storyboard.json`: narration and chapter order.
- `scenes.mjs`: vector artwork and deterministic motion.
- `narrate.py`: speech and sentence-cue generation; bounded retries and recoverable clips.
- `assemble.py`: pacing, exact timeline, captions, and original sound design.
- `render.mjs`: vector frames, four parallel encoder processes, and final mux.
- `preview.mjs`: offline, interactive SVG player generator.
- `fonts/`: DM Sans and Manrope from Google Fonts, with their OFL licenses.

Outputs live under ignored `outputs/demo-video/`. `preview.html` in the delivered source archive plays the original SVG scenes against the finished audio and supports scrubbing, chapter selection, and caption toggling. Unzip the source archive, then open that file; keep its relative folders in place.

## Reproduce from repository root

```sh
uv venv outputs/demo-video/.venv
uv pip install --python outputs/demo-video/.venv/bin/python -r demo-video/requirements.txt
npm ci --prefix demo-video
outputs/demo-video/.venv/bin/python demo-video/narrate.py
outputs/demo-video/.venv/bin/python demo-video/assemble.py
node demo-video/render.mjs --stills
node demo-video/render.mjs
node demo-video/preview.mjs
```

Speech generation needs internet access; rendering existing narration is local. Source archive includes the measured audio clips, timing JSON, public snapshots, complete soundtrack and fonts, so those can be reused without generating speech again. The renderer uses the isolated imageio-ffmpeg executable and Linux DejaVu Sans Mono; the archive includes that font for portable preview. Runtime dependencies are isolated from the dapp. This work does not change or deploy the dapp, send blockchain transactions, or submit to the hackathon.

## Extended narrated cuts

The requested exact-named 4½-minute film and 90-second cut use a separate Ryan voice production under [extended/](extended/README.md). That source and its measured assets preserve the earlier 116-second film unchanged.
