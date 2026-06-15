# 🎤 Voice Commands Quick Reference

## Tap the microphone button to start voice recognition

---

## 🎯 LOG SHOTS

```
"Made"              → Log make at current zone
"Missed"            → Log miss at current zone
"Made 7 of 10"      → Log 7 makes + 3 misses
"Made from [zone]"  → Switch zone + log make
```

---

## 📍 SELECT ZONE

```
"Top" / "Key"           → Top of key zone
"Left wing"             → Left wing zone
"Right wing"            → Right wing zone
"Left corner"           → Left corner zone
"Right corner"          → Right corner zone
```

---

## ⏱️ SESSION CONTROL

```
"Start session"     → Begin new workout
"End session"       → End current session
"Pause"             → Pause tracking
"Resume"            → Resume tracking
```

---

## 📊 STATS

```
"What's my percentage?"  → Show FG%
"How many shots?"        → Show total shots
"What's my streak?"      → Show current streak
```

---

## 💡 TIPS

- Speak naturally - filler words are filtered automatically
- Zone abbreviations work: "LW" = Left Wing, "RC" = Right Corner
- Commands are case-insensitive
- Real-time transcript shows what's being recognized
- Audio beeps confirm commands

---

**Browser Support:**
- ✅ Chrome & Edge (desktop + Android) — full support
- ✅ Safari (macOS) — supported
- ⚠️ Safari (iPhone/iPad, in browser) — limited; tap to speak may stop after each phrase
- ❌ Installed PWA on iPhone/iPad — not supported (use Safari in browser, or manual buttons)
- ❌ Firefox — not supported (Web Speech API unavailable)

**Privacy:** No audio stored or recorded — local recognition only  
**Fallback:** Manual Make/Miss buttons always available

---

## SUPPORTED ZONE ALIASES

| Zone | Aliases |
|------|---------|
| Top | top, key, topkey, "top of key", "top of the key", elbow |
| Left Wing | "left wing", "l wing", lw |
| Right Wing | "right wing", "r wing", rw |
| Left Corner | "left corner", "l corner", lc |
| Right Corner | "right corner", "r corner", rc |

---

For more details, see [VOICE_COMMANDS.md](VOICE_COMMANDS.md)
