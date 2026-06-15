# HoopTrack Voice Commands Guide

## Overview
The HoopTrack basketball tracking app now features comprehensive **Web Speech API** voice command support. Simply tap the microphone button to start voice recognition and speak naturally to log shots, select zones, and query statistics.

---

## Voice Command Categories

### 🎯 Quick Shot Logging

| Command | Action | Example |
|---------|--------|---------|
| **"Made"** or **"Make"** | Log a made shot at current zone | "Made!" |
| **"Missed"** or **"Miss"** | Log a missed shot at current zone | "Miss" |
| **"Made [number] of [total]"** | Log multiple shots at once | "Made 7 of 10" → logs 7 makes & 3 misses |
| **"Made from [zone]"** | Switch zone and log a make | "Made from right corner" |
| **"Missed from [zone]"** | Switch zone and log a miss | "Missed from top of key" |

### 📍 Zone Selection Commands

| Command | Zone | Example |
|---------|------|---------|
| **"Top"** or **"Key"** or **"Top of key"** | Top/Key zone | "Top" switches to top zone |
| **"Left wing"** or **"L wing"** or **"LW"** | Left wing | "Left wing" |
| **"Right wing"** or **"R wing"** or **"RW"** | Right wing | "Right wing" |
| **"Left corner"** or **"L corner"** or **"LC"** | Left corner | "Left corner" |
| **"Right corner"** or **"R corner"** or **"RC"** | Right corner | "Right corner" |

**Note:** Zone selection accepts flexible naming and abbreviations.

### ⏱️ Session Control Commands

| Command | Action | Example |
|---------|--------|---------|
| **"Start session"** | Begin new workout | "Start session" |
| **"End session"** or **"Finish"** or **"Done"** | Complete current session | "End session" |
| **"Pause"** | Pause tracking | "Pause" |
| **"Resume"** | Resume tracking | "Resume" |

### 📊 Statistics Query Commands

| Command | Returns | Example |
|---------|---------|---------|
| **"What's my percentage?"** or **"Percentage"** | Current FG% in session | "What's my percentage?" → "📊 65%" |
| **"How many shots?"** or **"Total shots"** | Total shots attempted | "How many shots?" → "🏀 20 shots" |
| **"What's my streak?"** or **"Current streak"** | Current make/miss streak | "What's my streak?" → "🔥 3 in a row" |

---

## Voice Recognition Features

### ✅ Supported Features

- **Continuous Listening** - Stay in listening mode to log multiple shots back-to-back
- **Natural Language Processing** - Commands accept variations and natural speech patterns
- **Filler Word Filtering** - Automatically filters out: "um", "uh", "like", "you know", "basically", etc.
- **Case-Insensitive** - Commands work in any case
- **Zone Aliases** - Multiple names for each zone recognized
- **Real-time Feedback** - Visual and audio feedback for each command
- **Multi-Shot Logging** - Log multiple shots with one command ("Made 7 of 10")

### 🎨 Visual Feedback States

The microphone button displays different states:

| State | Appearance | Meaning |
|-------|------------|---------|
| **OFF** | Gray button, "Tap to speak" | Voice recognition is disabled |
| **LISTENING** | Purple/blue pulse animation, "Listening..." | Microphone is actively listening |
| **PROCESSING** | Orange spinning animation, "Processing..." | Command is being processed |
| **ERROR** | Red shake animation, "Error" | Command not recognized or error occurred |
| **IDLE** | Gray, "Tap to speak" | Ready for next command |

### 🔊 Audio Feedback

- **Success Beep** - Two ascending tones (800Hz → 1200Hz) when command recognized
- **Error Beep** - Single low tone (300Hz) when command not recognized
- **Real-time Transcript** - Shows spoken text and interim recognition in real-time

### 🛡️ Browser Compatibility

| Platform | Voice support |
|----------|---------------|
| Chrome / Edge (desktop, Android) | ✅ Full — tap to speak, stays listening |
| Safari (macOS) | ✅ Supported |
| Safari (iPhone/iPad, in browser) | ⚠️ Limited — may need to tap again after silence |
| Installed PWA (iPhone/iPad) | ❌ Not available — open in Safari instead |
| Firefox | ❌ Not supported |

- **Unsupported browsers**: A clear "Voice unavailable" message is shown instead of hiding the control
- **Zone required**: Say a zone first (e.g. "left wing") or tap the court before "made" / "missed"
- **Permission**: Browser requests microphone access on first tap
- **Privacy**: No audio is recorded or stored — recognition happens locally in the browser

---

## Usage Examples

### Scenario 1: Quick Workout Session
```
User: "Start session"
App: ✓ Starting new session

User: "Made from right corner"
App: ✓ Made from RIGHT CORNER

User: "Miss from left wing"
App: ✗ Missed from LEFT WING

User: "What's my percentage?"
App: 📊 50%

User: "End session"
App: ✓ Session ended
```

### Scenario 2: Multiple Shot Logging
```
User: "Made 7 of 10"
App: ✓ Logged 7/10 (7 makes, 3 misses logged instantly)

User: "How many shots?"
App: 🏀 10 shots

User: "What's my streak?"
App: 🔥 1 in a row (since last miss)
```

### Scenario 3: Natural Language Variations
```
User: "Make from the top"
App: ✓ Made from TOP

User: "Uh, missed, like, from the right wing"
App: ✗ Missed from RIGHT WING (filler words filtered)

User: "Give me my percentage"
App: 📊 62%
```

---

## Tips for Best Results

### 🎤 Microphone Setup
- Use device microphone or compatible Bluetooth headset
- Position microphone close to mouth for best recognition
- Speak clearly without shouting
- Minimize background noise

### 🗣️ Speaking Tips
- Speak naturally - don't rush
- Complete your phrase before pausing
- Use standard English pronunciation
- Filler words are automatically ignored

### 🎯 Command Tips
- Keep commands simple and focused
- Use zone names that match the app display
- For statistics, ask the full question or key word
- Let the app finish processing before next command

### 🚀 Workflow Optimization
- Tap microphone button to toggle continuous listening
- View real-time transcript to verify recognition
- Use visual feedback to confirm commands
- Fall back to manual buttons if voice not working

---

## Troubleshooting

### Issue: "Voice button not visible"
**Solution**: Web Speech API not supported in your browser. Use Chrome, Edge, or Safari instead.

### Issue: "Commands not recognized"
**Solutions**:
- Speak more clearly and slower
- Check microphone is unmuted
- Reduce background noise
- Verify command syntax
- Use simpler, shorter commands

### Issue: "Zone not switching"
**Solution**: Ensure zone name matches. Try full name: "Right corner" instead of "RC"

### Issue: "Audio feedback not working"
**Solution**: Check if device volume is muted. Audio feedback volume is controlled by device volume.

### Issue: "Microphone permission denied"
**Solution**: Go to browser settings → Site Settings → Microphone and allow the app

---

## Technical Details

### Web Speech API Usage
- **API**: `SpeechRecognition` / `webkitSpeechRecognition`
- **Mode**: Continuous listening with interim results
- **Language**: en-US (configurable in hook)
- **Timeout**: Auto-resets after 10 seconds of no speech

### Command Parsing
- **Regex Patterns**: Flexible matching for natural language
- **Zone Recognition**: 5 zones with multiple aliases each
- **Count Parsing**: Pattern matching for "X of Y" format
- **Filler Word Removal**: 10 common filler words filtered

### Performance
- **Latency**: ~1-2 seconds from speech to command execution
- **CPU Usage**: Minimal during listening
- **Memory**: Refs used to prevent unnecessary re-renders
- **Callbacks**: Safe async callback execution via refs

---

## Implementation Files

- **Hook**: `src/hooks/useVoiceCommands.js` - All voice logic
- **Component**: `src/components/VoiceControl.jsx` - Voice UI
- **Styles**: `src/styles/VoiceControl.css` - Voice button animations
- **Integration**: `src/components/WorkoutTab.jsx` - Integrated into workout

---

## Future Enhancements

Potential improvements for future versions:
- Custom command training
- Noise filtering and noise cancellation
- Multi-language support (Spanish, Chinese, etc.)
- Command chaining ("Make 3 from top")
- Performance analytics queries
- Voice feedback confirmation
- Offline mode with local recognition

---

## Privacy & Security

✅ **What HoopTrack does NOT do:**
- Does not record or store audio
- Does not send audio to external servers
- Does not collect microphone data
- Uses only browser's local speech recognition

✅ **Microphone Permissions:**
- Only requested when voice button is tapped
- Can be revoked anytime in browser settings
- No background listening
- User has full control

---

## Keyboard Shortcuts (Future)

Currently coming soon:
- `Space` - Toggle voice listening
- `Ctrl+/` - Show voice command help
- `Esc` - Cancel voice recognition

---

## Support

For issues or suggestions about voice commands:
1. Check Troubleshooting section above
2. Verify browser compatibility
3. Test microphone with other apps
4. Try manual buttons as backup

Enjoy voice-powered basketball tracking! 🏀🎤
