import { Mic } from 'lucide-react'
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
      onAddShot({ result: 'make', zone: zone || selectedZone, timestamp: Date.now() })
    },
    onMiss: (zone) => {
      onAddShot({ result: 'miss', zone: zone || selectedZone, timestamp: Date.now() })
    },
    onZoneChange: (zone) => {
      onZoneSelect(zone)
    },
    onStartSession: () => {
      // New session already started in App
    },
    onEndSession: () => {
      onEndSession?.()
    },
    onPause: () => {
      // Pause functionality can be added to App state
    },
    onResume: () => {
      // Resume functionality can be added to App state
    },
    onGetPercentage: () => {
      const makes = currentSession.shots.filter(s => s.result === 'make').length
      const total = currentSession.shots.length
      return total > 0 ? Math.round((makes / total) * 100) : 0
    },
    onGetShotCount: () => {
      return currentSession.shots.length
    },
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

  if (!voice.isSupported) {
    return null
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
        return 'Error'
      default:
        return voice.isListening ? 'Listening' : 'Tap to speak'
    }
  }

  return (
    <div className="voice-control">
      <button
        className={`voice-btn ${getStatusClass()}`}
        onClick={voice.toggleListening}
        title={getStatusText()}
      >
        <Mic size={20} />
        <span className="voice-btn-text">{getStatusText()}</span>
        {voice.isListening && <span className="voice-pulse"></span>}
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
