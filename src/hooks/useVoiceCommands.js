import { useEffect, useRef, useState, useCallback } from 'react'

const ZONES = [
  { id: 'top', aliases: ['top', 'key', 'topkey', 'top of key', 'top of the key', 'elbow', 'free throw line'] },
  { id: 'left-wing', aliases: ['left wing', 'l wing', 'lw', 'wing left'] },
  { id: 'right-wing', aliases: ['right wing', 'r wing', 'rw', 'wing right'] },
  { id: 'left-corner', aliases: ['left corner', 'l corner', 'lc', 'corner left'] },
  { id: 'right-corner', aliases: ['right corner', 'r corner', 'rc', 'corner right'] },
]

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'okay', 'yeah', 'yes', 'no']

export const useVoiceCommands = ({
  onMake,
  onMiss,
  onZoneChange,
  onStartSession,
  onEndSession,
  onPause,
  onResume,
  onGetPercentage,
  onGetShotCount,
  onGetStreak,
  onError,
}) => {
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('idle')

  const onMakeRef = useRef(onMake)
  const onMissRef = useRef(onMiss)
  const onZoneChangeRef = useRef(onZoneChange)
  const onStartSessionRef = useRef(onStartSession)
  const onEndSessionRef = useRef(onEndSession)
  const onPauseRef = useRef(onPause)
  const onResumeRef = useRef(onResume)
  const onGetPercentageRef = useRef(onGetPercentage)
  const onGetShotCountRef = useRef(onGetShotCount)
  const onGetStreakRef = useRef(onGetStreak)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onMakeRef.current = onMake
    onMissRef.current = onMiss
    onZoneChangeRef.current = onZoneChange
    onStartSessionRef.current = onStartSession
    onEndSessionRef.current = onEndSession
    onPauseRef.current = onPause
    onResumeRef.current = onResume
    onGetPercentageRef.current = onGetPercentage
    onGetShotCountRef.current = onGetShotCount
    onGetStreakRef.current = onGetStreak
    onErrorRef.current = onError
  }, [onMake, onMiss, onZoneChange, onStartSession, onEndSession, onPause, onResume, onGetPercentage, onGetShotCount, onGetStreak, onError])

  const cleanText = useCallback((text) => {
    let cleaned = text.toLowerCase().trim()
    FILLER_WORDS.forEach(word => {
      cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ')
    })
    return cleaned.replace(/\s+/g, ' ').trim()
  }, [])

  const parseZone = useCallback((text) => {
    const cleanedText = cleanText(text)
    for (const zone of ZONES) {
      for (const alias of zone.aliases) {
        if (cleanedText.includes(alias.toLowerCase())) {
          return zone.id
        }
      }
    }
    return null
  }, [cleanText])

  const parseCount = useCallback((text) => {
    const match = text.match(/(\d+)\s*(?:of|out of|\/)\s*(\d+)/)
    if (match) {
      const makes = parseInt(match[1])
      const total = parseInt(match[2])
      const misses = total - makes
      return { makes, misses }
    }
    return null
  }, [])

  const playSound = useCallback((type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      if (type === 'success') {
        const now = audioContext.currentTime
        const osc1 = audioContext.createOscillator()
        const osc2 = audioContext.createOscillator()
        const gain1 = audioContext.createGain()
        const gain2 = audioContext.createGain()
        osc1.frequency.value = 800
        osc2.frequency.value = 1200
        gain1.gain.setValueAtTime(0.3, now)
        gain2.gain.setValueAtTime(0.3, now + 0.1)
        osc1.connect(gain1)
        osc2.connect(gain2)
        gain1.connect(audioContext.destination)
        gain2.connect(audioContext.destination)
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        osc1.start(now)
        osc1.stop(now + 0.1)
        osc2.start(now + 0.1)
        osc2.stop(now + 0.2)
      } else if (type === 'error') {
        const now = audioContext.currentTime
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()
        osc.frequency.value = 300
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
        osc.connect(gain)
        gain.connect(audioContext.destination)
        osc.start(now)
        osc.stop(now + 0.2)
      }
    } catch {
      // Audio not available
    }
  }, [])

  const handleCommand = useCallback((command) => {
    const cleanedCommand = cleanText(command)
    setStatus('processing')

    if (cleanedCommand.includes('start session') || cleanedCommand.includes('start workout')) {
      setFeedback('✓ Starting new session')
      playSound('success')
      onStartSessionRef.current?.()
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    if (cleanedCommand.includes('end session') || cleanedCommand.includes('finish session') || cleanedCommand.includes('done')) {
      setFeedback('✓ Session ended')
      playSound('success')
      onEndSessionRef.current?.()
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    if (cleanedCommand.includes('pause')) {
      setFeedback('⏸ Paused')
      playSound('success')
      onPauseRef.current?.()
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    if (cleanedCommand.includes('resume')) {
      setFeedback('▶ Resumed')
      playSound('success')
      onResumeRef.current?.()
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    if (cleanedCommand.includes("what's my percentage") || cleanedCommand.includes('percentage')) {
      const percentage = onGetPercentageRef.current?.()
      setFeedback(`📊 ${percentage}%`)
      playSound('success')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }

    if (cleanedCommand.includes('how many shots') || cleanedCommand.includes('total shots')) {
      const count = onGetShotCountRef.current?.()
      setFeedback(`🏀 ${count} shots`)
      playSound('success')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }

    if (cleanedCommand.includes("what's my streak") || cleanedCommand.includes('current streak')) {
      const streak = onGetStreakRef.current?.()
      setFeedback(`🔥 ${streak} in a row`)
      playSound('success')
      setTimeout(() => setStatus('idle'), 2000)
      return
    }

    const zone = parseZone(command)
    if (zone && !cleanedCommand.includes('made') && !cleanedCommand.includes('miss')) {
      setFeedback(`📍 ${zone.replace('-', ' ').toUpperCase()}`)
      playSound('success')
      onZoneChangeRef.current?.(zone)
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    const isMake = cleanedCommand.includes('made') || cleanedCommand.includes('make')
    const isMiss = cleanedCommand.includes('miss') || cleanedCommand.includes('missed')

    if (isMake || isMiss) {
      const countInfo = parseCount(command)
      if (countInfo) {
        for (let i = 0; i < countInfo.makes; i++) {
          onMakeRef.current?.(zone)
        }
        for (let i = 0; i < countInfo.misses; i++) {
          onMissRef.current?.(zone)
        }
        setFeedback(`✓ Logged ${countInfo.makes}/${countInfo.makes + countInfo.misses}`)
        playSound('success')
        setTimeout(() => setStatus('idle'), 1000)
        return
      }

      if (isMake) {
        onMakeRef.current?.(zone)
        setFeedback(`✓ Made${zone ? ` from ${zone.replace('-', ' ')}` : ''}`)
      } else {
        onMissRef.current?.(zone)
        setFeedback(`✗ Missed${zone ? ` from ${zone.replace('-', ' ')}` : ''}`)
      }

      playSound('success')
      setTimeout(() => setStatus('idle'), 1000)
      return
    }

    setFeedback('❓ Command not recognized')
    playSound('error')
    setTimeout(() => setStatus('idle'), 1500)
  }, [cleanText, parseZone, parseCount, playSound])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i].transcript
        if (event.results[i].isFinal) {
          final += text + ' '
        } else {
          interim += text
        }
      }

      setInterimTranscript(interim)
      if (final) {
        setTranscript(final)
        handleCommand(final)
      }
    }

    recognition.onerror = (event) => {
      setStatus('error')
      setFeedback(`❌ ${event.error}`)
      onErrorRef.current?.(event.error)
      setTimeout(() => {
        setStatus('idle')
        setFeedback('')
      }, 2000)
    }

    recognition.onend = () => {
      setIsListening(false)
      setStatus('idle')
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [handleCommand])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatus('idle')
    } else {
      setTranscript('')
      setInterimTranscript('')
      setFeedback('')
      setStatus('listening')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setStatus('idle')
    }
  }, [isListening])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    feedback,
    status,
    toggleListening,
    stopListening,
  }
}
