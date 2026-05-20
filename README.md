# Synth Bloom

A cinematic AI music visualizer inspired by TouchDesigner and interactive performance art. Use hand gestures to play ambient chords while organic flowers bloom beside your face, surrounded by floating particles that respond to your voice.

## Tech stack

- React + Vite
- Three.js + React Three Fiber
- Tone.js
- MediaPipe Hands & Face Mesh
- Tailwind CSS v4

## Requirements

- Node.js 18+
- Webcam
- Microphone (optional, for voice-reactive blooms)
- Modern browser (Chrome, Edge, or Safari recommended)

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5174` — port 5173 is often used by other Vite apps). Click **Enter** to grant camera/microphone access and start the experience.

## Build for production

```bash
npm run build
npm run preview
```

## How to use

1. **Pick chords** — Omnichord-style grid (12 keys × 7 qualities). Tap up to 4 chords; hear a short preview on each tap.
2. **Assign gestures** — Your chords auto-map to hand poses (1 finger → 2 → 3 → open palm).
3. **Perform** — Face the camera, raise your hand, hold a gesture. That chord plays with a dreamy pad and flowers bloom beside your face.

| Chord quality | Flower |
|---------------|--------|
| Major | Daisy |
| Minor | Sakura |
| M7 | Lily |
| m7 | Orchid |
| 7 | Sakura |
| Aug / Dim | Orchid / Lily |

Voice volume still scales bloom intensity. Use **Change chords** (top right) to pick a new set.

## Project structure

```
src/
  components/
    CameraFeed.jsx    # Fullscreen mirrored webcam
    HandTracker.jsx   # MediaPipe hand gestures
    FaceTracker.jsx   # Face mesh → cheek bloom anchors
    FlowerSystem.jsx  # R3F sprite blooms
    ParticleSystem.jsx
    AudioEngine.jsx   # Tone.js ambient pad
  hooks/
  shaders/
  utils/
  App.jsx
```

## Notes

- First load downloads MediaPipe WASM models from jsDelivr CDN — an internet connection is required on first run.
- Audio starts only after clicking **Enter** (browser autoplay policy).
- For best tracking, use even lighting and keep your face and hand in frame.
# synth-
