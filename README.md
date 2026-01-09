# 🏀 HoopTrack - Basketball Shot Tracker

A professional basketball training analytics app that helps players track their shooting performance in real-time.

## Overview

HoopTrack is a responsive web application designed for basketball players to log their shots during training sessions, analyze performance across different court zones, and track progress over time. With an intuitive interface optimized for both mobile and desktop, players can immediately see their shooting statistics and identify areas for improvement.

## ✨ Key Features

### 📊 Real-Time Shot Tracking
- **5 Court Zones:** Log shots from Top, Left Wing, Right Wing, Left Corner, and Right Corner
- **Large Clickable Areas:** Easy-to-tap zone selection optimized for mobile devices
- **Instant Feedback:** See your makes, misses, and FG% in real-time
- **Make/Miss Buttons:** Green (make) and red (miss) buttons with NBA color scheme

### 📈 Performance Analytics
- **Zone Statistics:** Detailed makes/misses breakdown by zone
- **Color-Coded Performance:** Green (≥65%), Yellow (45-65%), Red (<45%)
- **Weekly Trends:** Track progress week-over-week
- **Heat Maps:** Visual representation of shooting zones colored by performance

### 📱 Responsive Design
- **Mobile First:** Optimized for phones with bottom tab navigation
- **Desktop Layout:** Sidebar navigation with expanded content area
- **Full-Screen:** Uses entire viewport for immersive experience
- **Touch-Friendly:** Large targets and smooth interactions

### 📋 Session Management
- **Automatic Saving:** All sessions stored in browser localStorage
- **Session History:** View past sessions with detailed breakdowns
- **Expandable Details:** Tap sessions to see zone-by-zone performance
- **Delete Sessions:** Remove sessions you don't want to keep

## 🎨 Design & Branding

- **NBA Color Palette:** Navy (#17408B), Red (#C9082A), Gold (#FDB927), Green (#00843D)
- **Professional UI:** Clean, modern design with smooth animations
- **Visual Hierarchy:** Clear stat cards, icons, and performance indicators
- **Responsive Typography:** Scales beautifully across all screen sizes

## 🛠 Technology Stack

- **React 19** - UI framework
- **Vite** - Fast build tool with HMR
- **Lucide React** - Beautiful icons
- **CSS3** - Responsive styling with media queries
- **localStorage** - Persistent data storage

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Mnotice/hooptrack.git
cd hooptrack

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

## 📱 How to Use

1. **Start a Session:** The workout tab loads automatically with a new session
2. **Select a Zone:** Tap any of the 5 court zones to select it
3. **Log Your Shot:** 
   - Tap **Make** (green) if you made the shot
   - Tap **Miss** (red) if you missed
4. **Track Progress:** Watch your stats update in real-time
5. **View History:** Switch to the History tab to see all past sessions
6. **Analyze Trends:** Check the Progress tab for weekly stats and heat maps

## 📊 UI Sections

### Workout Tab
- Live court diagram with clickable zones
- Real-time shot counter
- Make/Miss buttons with clear visual distinction
- Session summary showing total shots and FG%
- End Session button to save and start a new one

### Progress Tab
- Weekly shot volume with progress bars
- Overall shooting percentage
- Zone heat map with color-coded performance
- Week-over-week comparison

### History Tab
- All past sessions sorted by most recent
- Session type badges (Hot 🔥, Good ✓, Cold ❄️)
- Expandable session details with zone breakdown
- One-tap zone performance viewing
- Delete option for each session

## 🎯 Features by Zone

Each zone displays:
- **Makes/Attempts:** Current session statistics
- **Shooting %:** Color-coded performance indicator
- **Zone-Specific Stats:** Detailed breakdown in history and progress tabs

## 📱 Responsive Breakpoints

| Device | Layout | Navigation |
|--------|--------|------------|
| Mobile (<768px) | Single column | Bottom tabs |
| Tablet (768px-1024px) | Sidebar + Content | Sidebar nav |
| Desktop (>1024px) | Optimized spacing | Sidebar nav |

## 🔐 Data Storage

All data is stored locally in your browser using `localStorage`:
- Sessions persist even after closing the app
- No cloud sync (for now) - data stays on your device
- Clear your browser data to reset the app

## 🎮 Controls

| Action | Mobile | Desktop |
|--------|--------|---------|
| Switch Tabs | Bottom tabs | Sidebar nav |
| Select Zone | Tap zone area | Click zone area |
| Log Shot | Make/Miss buttons | Make/Miss buttons |
| View Session | Tap card | Click card |
| End Session | End Session button | End Session button |

## 🏆 Future Enhancements

- Voice commands for hands-free logging
- Cloud sync and user accounts
- Advanced analytics and trend analysis
- Comparison with other players
- Video integration for shot analysis
- Custom training programs

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created as a basketball training analytics tool. Contributions welcome!

---

**HoopTrack** - Track Your Game, Improve Your Shot 🏀
