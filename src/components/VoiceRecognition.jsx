import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'
import '../styles/VoiceRecognition.css'

const ZONES = ['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner']
const ZONE_ALIASES = {
  'top': ['top', 'key', 'elbow', 'tl'],
  'left-wing': ['left wing', 'l wing', 'left wing', 'lw'],
  'right-wing': ['right wing', 'r wing', 'rw'],
  'left-corner': ['left corner', 'l corner', 'left base', 'lc'],
  'right-corner': ['right corner', 'r corner', 'right base', 'rc'],
}

export default function VoiceRecognition({ onShotLogged, onSessionEnded }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [confidence, setConfidence] = useState(0)
  const recognitionRef = useRef(null)

  const parseZone = useCallback((text) => {
    const lowerText = text.toLowerCase()
    
    for (const [zone, aliases] of Object.entries(ZONE_ALIASES)) {
      for (const alias of aliases) {
        if (lowerText.includes(alias)) {
          return zone
        }
      }
    }
    
    return null
  }, [])

  const parseCount = useCallback((text) => {
    // Match patterns like "7 of 10" or "7/10"
    const match = text.match(/(\d+)\s+(?:of|\/)\s+(\d+)/)
    if (match) {
      return {
        makes: parseInt(match[1]),
        attempts: parseInt(match[2]),
      }
    }
    return null
  }, [])

  const processCommand = useCallback((command) => {
    const lowerCommand = command.toLowerCase().trim()
    
    console.log('Processing command:', command)
    
    // Check for end session command
    if (lowerCommand.includes('end session') || lowerCommand.includes('finish')) {
      setLastCommand('End Session')
      setFeedback('✓ Session ended!')
      setTimeout(() => onSessionEnded(), 500)
      return
    }

    // Parse zone first (needed for all shot types)
    const zone = parseZone(command)

    // Check for shorthand: "+1 TL" or "-1 RW" format
    const shorthandMatch = lowerCommand.match(/([+−-])\s*(\d+)\s*([a-z]+)/)
    if (shorthandMatch) {
      const isMake = shorthandMatch[1] === '+'
      const count = parseInt(shorthandMatch[2]) || 1
      
      for (let i = 0; i < count; i++) {
        onShotLogged({
          result: isMake ? 'make' : 'miss',
          zone: zone || null,
          timestamp: Date.now() + i,
        })
      }
      
      setLastCommand(`${isMake ? 'Made' : 'Missed'} ${count} from ${zone || 'unknown'}`)
      setFeedback(`${isMake ? '✓' : '✗'} Logged ${count} ${isMake ? 'makes' : 'misses'}`)
      return
    }

    // Check for made shots
    if (lowerCommand.includes('made') || lowerCommand.includes('make')) {
      const countInfo = parseCount(command)

      if (countInfo) {
        // Log multiple shots (e.g., "Made 7 of 10")
        setLastCommand(`Made ${countInfo.makes}/${countInfo.attempts} from ${zone || 'general'}`)
        setFeedback(`✓ Logged ${countInfo.makes} makes`)
        
        for (let i = 0; i < countInfo.makes; i++) {
          onShotLogged({
            result: 'make',
            zone: zone || null,
            timestamp: Date.now() + i,
          })
        }
        for (let i = 0; i < countInfo.attempts - countInfo.makes; i++) {
          onShotLogged({
            result: 'miss',
            zone: zone || null,
            timestamp: Date.now() + countInfo.makes + i,
          })
        }
      } else if (zone) {
        // Single shot from specific zone
        setLastCommand(`Made from ${zone}`)
        setFeedback('✓ Made shot recorded')
        onShotLogged({
          result: 'make',
          zone: zone,
          timestamp: Date.now(),
        })
      } else {
        // Generic make
        setLastCommand('Made shot')
        setFeedback('✓ Made shot recorded')
        onShotLogged({
          result: 'make',
          zone: null,
          timestamp: Date.now(),
        })
      }
      return
    }

    // Check for missed shots
    if (lowerCommand.includes('missed') || lowerCommand.includes('miss')) {
      if (zone) {
        setLastCommand(`Missed from ${zone}`)
        setFeedback('✗ Missed shot recorded')
        onShotLogged({
          result: 'miss',
          zone: zone,
          timestamp: Date.now(),
        })
      } else {
        setLastCommand('Missed shot')
        setFeedback('✗ Missed shot recorded')
        onShotLogged({
          result: 'miss',
          zone: null,
          timestamp: Date.now(),
        })
      }
      return
    }

    // No recognized command
    setFeedback('⚠️ Command not recognized. Try: "+1 TL" or "made from left wing"')
  }, [parseZone, parseCount, onShotLogged, onSessionEnded])

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.language = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setFeedback('')
    }

    recognition.onresult = (event) => {
      let interim = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i].transcript
        const isFinal = event.results[i].isFinal
        const conf = event.results[i].confidence

        if (isFinal) {
          finalTranscript += text
          if (i === event.results.length - 1) {
            setConfidence(Math.round(conf * 100))
          }
        } else {
          interim += text
        }
      }

      setInterimTranscript(interim)
      setTranscript(finalTranscript || interim)

      // Process final transcript when available
      if (finalTranscript) {
        processCommand(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [processCommand])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setTranscript('')
    } else {
      setLastCommand('')
      setFeedback('')
      setError('')
      recognitionRef.current.start()
    }
  }

  const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

  if (!SpeechRecognition) {
    return (
      <div className="voice-recognition">
        <div className="voice-error">
          <AlertCircle size={20} />
          <span>Speech Recognition not supported in this browser</span>
        </div>
      </div>
    )
  }

  if (error && !isListening) {
    return (
      <div className="voice-recognition">
        <div className="voice-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="voice-recognition">
      <button
        className="voice-toggle-btn disabled"
        disabled
        title="Voice recognition is currently disabled"
      >
        <Mic size={20} />
        <span>Voice Commands (Disabled)</span>
      </button>

      <div className="voice-disabled-notice">
        <AlertCircle size={18} />
        <div>
          <p className="notice-title">Voice Recognition Disabled</p>
          <p className="notice-text">This feature is temporarily unavailable. We're working on improvements and will have it back soon.</p>
        </div>
      </div>
    </div>
  )
}
