# FixedGap Harvard Pitch

A scroll-driven web presentation of FixedGap, built for a pitch at Harvard on 11 June 2026. Instead of slides, the story plays as a video you move through with the scroll wheel, with text and small interactive pieces layered on top.

## What it is

FixedGap is a software-only way to monitor stroke recovery at home: the patient does short tasks in front of a webcam (framed as a game), computer vision turns the movement into functional data, and clinicians see trends between visits instead of relying on what the patient remembers. This repo is the pitch for it, not the product itself.

The page walks through the usual pitch sections: the monitoring gap (hundreds of post-stroke patients per clinician, spaced visits), the "what if" moment, the solution, a clinical view, a business plan slide, traction and milestones, then a team section and the pre-seed ask. It was built in a few days by the team for the Harvard Health Systems Innovation Lab event.

## How it works

- A 759-frame video (`public/frames/frame_0001.jpg` to `frame_0759.jpg`) is loaded in batches of 20 and drawn to a full-screen `<canvas>`. Scroll position maps to a frame index, so scrolling plays the video forward or backward.
- Seven key frames (1, 95, 225, 350, 483, 616, 720) are "snap" points. Near them the page locks briefly, swaps in a sharper PNG from `public/frames-hq/`, and fades in that section's overlay (title, subtitle, custom graphics).
- The first 313 frames are shown full-screen with white text; from frame 314 the image shrinks to 70% on a white background and text switches to dark. A bottom gradient hides the generator watermark on the early frames.
- Custom overlays include a typewriter line, an SVG chart of what gets observed in clinic versus at home (`app/Problem2Overlay.tsx`), a three-step "how it works" strip, a traction block with milestones and partner names, and a counter that animates the funding ask.
- After the video, two normal sections follow: team (photo, backgrounds, Spain/USA/HSIL badges) and the ask.

Everything is client-side; there is no backend and no data collection.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion (listed, animations are mostly hand-rolled with `requestAnimationFrame` and inline styles).

## Run it

```bash
npm ci
npm run build
npm run start
```

Then open http://localhost:3000. For development use `npm run dev`. Frames total about 85 MB, so the first load takes a moment; a progress bar shows while they load.

## Project layout

```
app/
  page.tsx            renders ScrollCanvas
  ScrollCanvas.tsx    frame loading, scroll mapping, snap logic, all overlays and post-scroll sections
  Problem2Overlay.tsx SVG chart for the second problem section
  layout.tsx          fonts and metadata
  globals.css         Tailwind import and a few keyframes
public/
  frames/             759 JPG video frames
  frames-hq/          sharper PNGs used at the snap frames
  fix.png, logo.png   FixedGap logos
  HSIL.png, spain.png, usa.png, team.jpeg   assets for the team section
```

## Team

- Luis Molina Salvador
- Mateo Perez
- alvarog-prog
