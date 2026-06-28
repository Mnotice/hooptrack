# 🏀 HoopTrack

**Privacy-first basketball shot tracker — installable PWA for focused practice sessions.**

Log makes and misses by court zone, visualize your shooting performance with heatmaps and trends, and get optional assistance from your phone's camera or voice commands. Everything stays on your device. No accounts, no servers, no tracking.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

## Features

- **Zone-based logging**: Tap zones on an interactive mini court (Top, Left/Right Wing, Left/Right Corner, and more) and record makes or misses with animated feedback.
- **Performance visualization**: Color-coded zones (green ≥ 65%, yellow 45–65%, red < 45%) and progress heatmaps.
- **Session management**: Start/end workouts, review full history with per-zone breakdowns, delete sessions as needed.
- **Camera assistance** (optional): Calibrate the rim position and receive shot suggestions or confirmations via live camera feed (best with fixed phone mount and good lighting).
- **Voice control** (optional): Hands-free operation using speech recognition — select zones and log shots verbally. Works best in desktop Chrome/Edge; limited on installed iOS PWA.
- **Progress analytics**: View weekly field goal percentage, shooting trends over time, and zone-specific insights.
- **Fully offline PWA**: Install to home screen on iOS/Android; works without internet after initial load. Data persisted in localStorage.
- **Privacy by design**: Zero data leaves your browser. Clear browser data to remove history.

## Quick Start (Development)

```bash
git clone https://github.com/Mnotice/hooptrack.git
cd hooptrack
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

For production build:
```bash
npm run build
```
The `dist/` folder contains the optimized static site ready for deployment (GitHub Pages, Vercel, Netlify, etc.).

## Install as Mobile App (PWA)

1. Open HoopTrack in **Safari** (iOS/iPadOS) or **Chrome** (Android).
2. Tap **Share** → **Add to Home Screen** (iOS) or menu → **Install app** (Android).
3. Launch from your home screen — feels like a native app.

The app supports offline use and receives updates automatically when online.

## How to Use

### Workout Tab
1. Tap **Start Session**.
2. Select a zone on the court diagram.
3. Tap **Make** or **Miss** — observe the ball animation (swish, airball, or rebound).
4. Continue logging or tap **End Session** to save.

Zones automatically update their color based on your historical accuracy in that area.

### Camera Tab
- Calibrate the rim location for better shot detection assistance.
- Use live video to help validate shots or get real-time feedback (experimental).
- Best results: Mount phone steadily, ensure bright even lighting, and align camera with the basket.

### Progress Tab
- Overview of overall FG% and session count.
- Weekly trends and zone heat map visualization.
- Identify strengths and areas for improvement.

### History Tab
- Browse past sessions with expandable details showing zone-by-zone results.
- Delete individual sessions if desired.

## Voice Commands

Voice input provides convenient hands-free logging during practice.

**Basic commands**:
- "left wing" / "right corner" / "top" — select zone
- "made" / "missed" — log result for current zone
- "made from left wing" — combined zone + make
- "what's my percentage?" — hear current overall FG%

For the complete reference including advanced phrases and tips, see [VOICE_QUICK_REFERENCE.md](VOICE_QUICK_REFERENCE.md) and [VOICE_COMMANDS.md](VOICE_COMMANDS.md).

**Note**: Voice works reliably in Chrome and Edge browsers. On iOS installed PWA it may be restricted — use the on-screen buttons or open in Safari browser tab instead.

## Data & Privacy

All sessions, statistics, and settings are stored exclusively in your browser's `localStorage`. Nothing is transmitted to any server. 

- To export data manually: Future enhancement planned (CSV/JSON).
- Clearing site data or using private/incognito mode will reset your history.
- The app requests camera and microphone permissions only when you actively use those tabs/features.

## Tech Stack

- **Frontend**: React 19, Vite (with Rolldown), Lucide React icons
- **PWA**: Vite PWA plugin + Workbox for service worker and offline support
- **Styling**: CSS modules / custom styles per component
- **Browser APIs**: MediaDevices (camera), Web Speech API (voice), Canvas / DOM for court rendering, localStorage
- **Detection logic**: Custom JavaScript utilities for ball/rim motion and zone mapping (`src/utils/`)

## Project Structure

```
hooptrack/
├── public/              # Static assets (icons, PWA images)
├── src/
│   ├── components/     # Tab UIs: Workout, Camera, History, Progress, VoiceControl
│   ├── hooks/          # Custom hooks: useCamera, useShotDetection, useVoiceCommands
│   ├── utils/          # Core logic: ballDetector, rimMotionDetector, zoneMapper, shotTypes
│   ├── styles/         # Per-component CSS
│   └── App.jsx, main.jsx, index.css
├── package.json
├── vite.config.js      # PWA configuration
├── eslint.config.js
├── README.md, VOICE_*.md, LICENSE
└── .gitignore
```

## Available Scripts

| Script          | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start local development server       |
| `npm run build` | Create optimized production build    |
| `npm run lint`  | Run ESLint for code quality          |
| `npm run preview` | Preview production build locally  |

## Development Guidelines

- Follow existing code style and component patterns.
- Run `npm run lint` before committing.
- Keep data handling local and privacy-respecting.
- Test voice and camera features across target browsers (Chrome, Edge, Safari).
- For UI changes, ensure responsive design and accessibility (labels, keyboard support).

## Contributing

Contributions are welcome! Whether it's bug reports, feature ideas, documentation improvements, or code:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-idea`).
3. Make your changes and ensure lint passes.
4. Commit with clear messages.
5. Open a Pull Request describing the changes.

Please open an issue first for significant changes to discuss approach.

See [GitHub Issues](https://github.com/Mnotice/hooptrack/issues) for current tasks.

## Roadmap & Future Ideas

- [ ] Data export/import (CSV, JSON) for backup or analysis in spreadsheets
- [ ] Customizable zones, shot types, and practice drills
- [ ] Enhanced visualizations (interactive charts, session comparisons)
- [ ] Improved computer-vision shot detection using more robust algorithms or TensorFlow.js
- [ ] Theme support (dark mode, high-contrast)
- [ ] Internationalization (i18n)
- [ ] Optional cloud sync (opt-in, end-to-end encrypted)
- [ ] GitHub Pages / Vercel live demo deployment
- [ ] Comprehensive test suite (unit + integration)
- [ ] Apple Health / Google Fit export integration

Ideas and pull requests for any of these are appreciated.

## Acknowledgments

Built with modern web technologies to help basketball players improve through deliberate practice and data-driven feedback.

## License

MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Mikhail (Mnotice). All rights reserved.
