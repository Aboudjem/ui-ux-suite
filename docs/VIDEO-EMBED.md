# Demo video embed guide

The README hero is a silent, looping GIF (`/.github/assets/demo.gif`), the only fully
autonomous, render-anywhere embed GitHub supports in Markdown. A voiced **`output.mp4`**
(H.264, 1920×1080, ~32s) is also built for the native HTML5 player.

## What's committed

- `/.github/assets/demo.gif`, the live hero, embedded at the top of `README.md`:
  `![ui-ux-suite demo](.github/assets/demo.gif)`
- Everything else lives in `demo-output/` (gitignored): `scenes/*.html`, `narration/*.txt`,
  `frames/*.png`, `audio/*.aiff`, per-scene `clip*.mp4`, and `output.mp4`.

## Add the voiced mp4 as a native player (manual, one-time)

GitHub does not embed local `.mp4` files via Markdown; it only plays videos you upload to its
CDN. To get the HTML5 player with audio:

1. Open any GitHub **issue, PR, or release** comment box on this repo.
2. **Drag `demo-output/output.mp4`** into the comment box. GitHub uploads it and returns a
   `https://github.com/user-attachments/assets/…` URL.
3. Paste that URL on its own line at the **top of `README.md`, above the GIF**. GitHub renders
   it as an inline `<video>` player. The GIF stays as the fallback for npm/mirrors that don't
   run the player.

**Upload limits:** 10 MB on the free tier, 100 MB on paid. Allowed: `.mp4`, `.mov`, `.webm`.
Use H.264 + `yuv420p` (already the case here). `output.mp4` is ~2 MB, well inside the free tier.

## Narration note (regenerating higher-quality voice)

Narration here uses the **offline macOS `say` voice** (`say -v Alex`) because **edge-tts cannot run
in this environment**: the system clock is set to 2026, so Microsoft's speech endpoint rejects the
time-based `Sec-MS-GEC` token with WebSocket close code 1007, and edge-tts only self-corrects on a
403 that never fires here. To regenerate higher-quality neural narration on a machine with a correct
clock:

```bash
# per scene (s1..s5), then rebuild the clips + concat + GIF
edge-tts --voice en-US-AndrewNeural --file demo-output/narration/s1.txt --write-media demo-output/audio/s1.mp3
```

Swap the `.aiff` inputs for the regenerated `.mp3` files in the per-scene `ffmpeg` clip build, then
re-run the concat (`-filter_complex_script demo-output/xfade.filter`) and the
palettegen/paletteuse + `gifsicle` GIF step.

## Rebuild from scratch

```bash
# 1. Frames (chromium via playwright)
for n in 1 2 3 4 5; do
  playwright screenshot --viewport-size=1920,1080 --wait-for-timeout=2600 \
    "file://$PWD/demo-output/scenes/s$n.html" "demo-output/frames/s$n.png"
done

# 2. Narration (offline fallback)
for n in 1 2 3 4 5; do
  say -v Alex -r 188 -o "$PWD/demo-output/audio/s$n.aiff" "$(cat demo-output/narration/s$n.txt)"
done

# 3. Per-scene clips → 4. concat with 0.3s crossfades (demo-output/xfade.filter) → output.mp4
# 5. output.mp4 → palettegen/paletteuse → gifsicle -O3 --lossy=80 --colors 200 → .github/assets/demo.gif
```

## Scene breakdown (~32s)

| # | Beat | Focus | ~dur |
|---|------|-------|------|
| 1 | Hook | "Your design review is vibes, not data." | 4.5s |
| 2 | Command | `npx ui-ux-suite .` typed live + local scan | 7.6s |
| 3 | Scorecard | 12 dimensions animate in + overall grade | 7.0s |
| 4 | One finding | `.hero-subtitle` 1.03:1 · WCAG 1.4.3 fail · before `#fbfbfb` → after `#767676` | 7.6s |
| 5 | Close | "Design quality, measured." + `npx ui-ux-suite` + repo URL | 7.0s |

**Accuracy:** ui-ux-suite is **audit-only / read-only**. It locates, measures, and *shows you* the
exact before→after fix you apply yourself; it never edits code. The demo says "shows you the exact
fix," never "applies it for you," and shows no fix-applying command.
