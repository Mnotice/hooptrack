# HoopTrack

Free basketball shot tracker for practice sessions. Log makes and misses by court zone, see your stats, and install it on your phone as an app — no account required.

## Quick start

```bash
git clone https://github.com/Mnotice/hooptrack.git
cd hooptrack
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). For production: `npm run build` then deploy the `dist` folder.

## Install on your phone (PWA)

1. Open HoopTrack in **Safari** (iPhone/iPad) or **Chrome** (Android)
2. Use **Add to Home Screen** / **Install app**
3. Launch from your home screen like a native app

Works offline after the first load. Data stays on your device.

## How to track a session

1. Open **Workout**
2. Tap a zone on the mini court (Top, Wings, Corners)
3. Tap **Make** or **Miss** — you'll see a ball animation (swish, airball, or rebound)
4. Tap **End Session** when done

**Voice (optional):** Tap the mic, say a zone ("left wing"), then "made" or "missed". Works best in Chrome or Edge. Not available in the iPhone installed app — use Safari in the browser or the buttons instead.

**Camera (optional):** The **Camera** tab can assist with rim calibration and shot suggestions. Fixed phone + good lighting works best.

## Tabs

| Tab | What it does |
|-----|----------------|
| **Workout** | Log shots on the court |
| **Camera** | Camera-assisted tracking (calibrate rim, confirm shots) |
| **Progress** | Weekly FG%, zone heat map, trends |
| **History** | Past sessions — expand for zone breakdown, delete if needed |

Zones turn **green** (65%+), **yellow** (45–65%), or **red** (&lt;45%) based on your shooting.

## Your data

Everything saves in your browser (`localStorage`). Nothing is sent to a server. Clearing browser data removes your sessions.

## Voice cheat sheet

| Say | Does |
|-----|------|
| "left wing" / "top" / etc. | Select zone |
| "made" / "missed" | Log shot (zone required) |
| "made from right corner" | Zone + make in one phrase |
| "what's my percentage?" | Hear current FG% |

See [VOICE_QUICK_REFERENCE.md](VOICE_QUICK_REFERENCE.md) for the full list.

## License

MIT — contributions welcome.