import { Mic, MicOff, AlertCircle } from 'lucide-react'
import { useVoiceCommands } from '../hooks/useVoiceCommands'
import '../styles/VoiceControl.css'

export default function VoiceControl({
  selectedZone,
  onZoneSelect,
  currentSession,
  onAddShot,
  onEndSession,
}) {
  const voice = useVoiceCommands({
    onMake: (zone) => {
      onAddShot({ result: 'make', zone, timestamp: Date.now(), source: 'voice' })
    },
    onMiss: (zone) => {
      onAddShot({ result: 'miss', zone, timestamp: Date.now(), source: 'voice' })
    },
    onZoneChange: (zone) => {
      onZoneSelect(zone)
    },
    onGetSelectedZone: () => selectedZone,
    onStartSession: () => {},
    onEndSession: () => {
      onEndSession?.()
    },
    onPause: () => {},
    onResume: () => {},
    onGetPercentage: () => {
      const makes = currentSession.shots.filter((s) => s.result === 'make').length
      const total = currentSession.shots.length
      return total > 0 ? Math.round((makes / total) * 100) : 0
    },
    onGetShotCount: () => currentSession.shots.length,
    onGetStreak: () => {
      const shots = currentSession.shots
      if (!shots || shots.length === 0) return 0

      let streak = 0
      const lastResult = shots[shots.length - 1]?.result

      for (let i = shots.length - 1; i >= 0; i--) {
        if (shots[i].result === lastResult) {
          streak++
        } else {
          break
        }
      }
      return streak
    },
    onError: (error) => {
      console.error('Voice error:', error)
    },
  })

  const { voiceSupport } = voice

  if (!voiceSupport.supported) {
    return (
      <div className="voice-control voice-control-unsupported">
        <div className="voice-unsupported-banner">
          <MicOff size={18} />
          <div>
            <p className="voice-unsupported-title">Voice unavailable</p>
            <p className="voice-unsupported-text">{voiceSupport.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusClass = () => {
    switch (voice.status) {
      case 'listening':
        return 'voice-btn-listening'
      case 'processing':
        return 'voice-btn-processing'
      case 'error':
        return 'voice-btn-error'
      default:
        return voice.isListening ? 'voice-btn-active' : ''
    }
  }

  const getStatusText = () => {
    switch (voice.status) {
      case 'listening':
        return 'Listening...'
      case 'processing':
        return 'Processing...'
      case 'error':
        return 'Mic error'
      default:
        return voice.isListening ? 'Listening' : 'Tap to speak'
    }
  }

  return (
    <div className="voice-control">
      {voiceSupport.limited && (
        <div className="voice-limited-banner">
          <AlertCircle size={16} />
          <span>{voiceSupport.message}</span>
        </div>
      )}

      <button
        type="button"
        className={`voice-btn ${getStatusClass()}`}
        onClick={voice.toggleListening}
        title={getStatusText()}
        aria-pressed={voice.isListening}
      >
        <Mic size={20} />
        <span className="voice-btn-text">{getStatusText()}</span>
        {voice.isListening && <span className="voice-pulse" />}
      </button>

      {voice.feedback && (
        <div className="voice-feedback">
          {voice.feedback}
        </div>
      )}

      {(voice.transcript || voice.interimTranscript) && (
        <div className="voice-transcript">
          <span className="voice-final">{voice.transcript}</span>
          {voice.interimTranscript && (
            <span className="voice-interim">{voice.interimTranscript}</span>
          )}
        </div>
      )}
    </div>
  )
}