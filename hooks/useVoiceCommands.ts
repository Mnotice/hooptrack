// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback } from 'react'
import { getVoiceSupport } from '@/lib/voiceSupport'

const ZONES = [
  { id: 'top', aliases: ['top', 'key', 'topkey', 'top of key', 'top of the key', 'elbow', 'free throw line'] },
  { id: 'left-wing', aliases: ['left wing', 'l wing', 'lw', 'wing left'] },
  { id: 'right-wing', aliases: ['right wing', 'r wing', 'rw', 'wing right'] },
  { id: 'left-corner', aliases: ['left corner', 'l corner', 'lc', 'corner left'] },
  { id: 'right-corner', aliases: ['right corner', 'r corner', 'rc', 'corner right'] },
]

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'okay', 'yeah', 'yes', 'no']

function safeStart(recognition) {
  if (!recognition) return false
  try {
    recognition.start()
    return true
  } catch {
    return false
  }
}

function safeStop(recognition) {
  if (!recognition) return
  try {
    recognition.stop()
  } catch {
    // already stopped
  }
}

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
  onGetSelectedZone,
  onError,
}) => {
  const recognitionRef = useRef(null)
  const wantsListeningRef = useRef(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupport] = useState(() => getVoiceSupport())
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
  const onGetSelectedZoneRef = useRef(onGetSelectedZone)
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
    onGetSelectedZoneRef.current = onGetSelectedZone
    onErrorRef.current = onError
  }, [onMake, onMiss, onZoneChange, onStartSession, onEndSession, onPause, onResume, onGetPercentage, onGetShotCount, onGetStreak, onGetSelectedZone, onError])

  const cleanText = useCallback((text) => {
    let cleaned = text.toLowerCase().trim()
    FILLER_WORDS.forEach((word) => {
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
      const makes = parseInt(match[1], 10)
      const total = parseInt(match[2], 10)
      const misses = total - makes
      return { makes, misses }
    }
    return null
  }, [])

  const resolveZone = useCallback((parsedZone) => {
    return parsedZone || onGetSelectedZoneRef.current?.() || null
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
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    if (cleanedCommand.includes('end session') || cleanedCommand.includes('finish session') || cleanedCommand.includes('done')) {
      setFeedback('✓ Session ended')
      playSound('success')
      onEndSessionRef.current?.()
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    if (cleanedCommand.includes('pause')) {
      setFeedback('⏸ Paused')
      playSound('success')
      onPauseRef.current?.()
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    if (cleanedCommand.includes('resume')) {
      setFeedback('▶ Resumed')
      playSound('success')
      onResumeRef.current?.()
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    if (cleanedCommand.includes("what's my percentage") || cleanedCommand.includes('percentage')) {
      const percentage = onGetPercentageRef.current?.()
      setFeedback(`📊 ${percentage}%`)
      playSound('success')
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 2000)
      return
    }

    if (cleanedCommand.includes('how many shots') || cleanedCommand.includes('total shots')) {
      const count = onGetShotCountRef.current?.()
      setFeedback(`🏀 ${count} shots`)
      playSound('success')
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 2000)
      return
    }

    if (cleanedCommand.includes("what's my streak") || cleanedCommand.includes('current streak')) {
      const streak = onGetStreakRef.current?.()
      setFeedback(`🔥 ${streak} in a row`)
      playSound('success')
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 2000)
      return
    }

    const parsedZone = parseZone(command)
    if (parsedZone && !cleanedCommand.includes('made') && !cleanedCommand.includes('miss')) {
      setFeedback(`📍 ${parsedZone.replace('-', ' ').toUpperCase()}`)
      playSound('success')
      onZoneChangeRef.current?.(parsedZone)
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    const isMake = cleanedCommand.includes('made') || cleanedCommand.includes('make')
    const isMiss = cleanedCommand.includes('miss') || cleanedCommand.includes('missed')

    if (isMake || isMiss) {
      const zone = resolveZone(parsedZone)
      const countInfo = parseCount(command)

      if (!zone && !countInfo) {
        setFeedback('📍 Select a zone first — tap the court or say "left wing"')
        playSound('error')
        setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 2000)
        return
      }

      if (countInfo) {
        if (!zone) {
          setFeedback('📍 Say a zone with your count, e.g. "made 7 of 10 from top"')
          playSound('error')
          setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 2000)
          return
        }
        for (let i = 0; i < countInfo.makes; i++) {
          onMakeRef.current?.(zone)
        }
        for (let i = 0; i < countInfo.misses; i++) {
          onMissRef.current?.(zone)
        }
        setFeedback(`✓ Logged ${countInfo.makes}/${countInfo.makes + countInfo.misses}`)
        playSound('success')
        setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
        return
      }

      if (isMake) {
        onMakeRef.current?.(zone)
        setFeedback(`✓ Made from ${zone.replace('-', ' ')}`)
      } else {
        onMissRef.current?.(zone)
        setFeedback(`✗ Missed from ${zone.replace('-', ' ')}`)
      }

      playSound('success')
      setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1000)
      return
    }

    setFeedback('❓ Command not recognized')
    playSound('error')
    setTimeout(() => setStatus(wantsListeningRef.current ? 'listening' : 'idle'), 1500)
  }, [cleanText, parseZone, parseCount, resolveZone, playSound])

  const restartListening = useCallback(() => {
    if (!wantsListeningRef.current || !recognitionRef.current) return
    const started = safeStart(recognitionRef.current)
    if (started) {
      setIsListening(true)
      setStatus('listening')
    }
  }, [])

  useEffect(() => {
    if (!voiceSupport.supported) return undefined

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
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
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (wantsListeningRef.current) {
          restartListening()
        }
        return
      }

      if (event.error === 'not-allowed') {
        wantsListeningRef.current = false
      }

      setStatus('error')
      setFeedback(`❌ Microphone ${event.error === 'not-allowed' ? 'permission denied' : event.error}`)
      onErrorRef.current?.(event.error)
      setTimeout(() => {
        setStatus('idle')
        if (event.error !== 'not-allowed') setFeedback('')
      }, 2500)
    }

    recognition.onend = () => {
      if (wantsListeningRef.current) {
        setTimeout(() => restartListening(), 200)
      } else {
        setIsListening(false)
        setStatus('idle')
      }
    }

    return () => {
      wantsListeningRef.current = false
      safeStop(recognition)
    }
  }, [voiceSupport.supported, handleCommand, restartListening])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !voiceSupport.supported) return

    if (isListening || wantsListeningRef.current) {
      wantsListeningRef.current = false
      safeStop(recognitionRef.current)
      setIsListening(false)
      setStatus('idle')
      return
    }

    setTranscript('')
    setInterimTranscript('')
    setFeedback('')
    wantsListeningRef.current = true
    setStatus('listening')

    const started = safeStart(recognitionRef.current)
    setIsListening(started)
    if (!started) {
      wantsListeningRef.current = false
      setStatus('error')
      setFeedback('❌ Could not start microphone — tap to try again')
    }
  }, [isListening, voiceSupport.supported])

  const stopListening = useCallback(() => {
    wantsListeningRef.current = false
    safeStop(recognitionRef.current)
    setIsListening(false)
    setStatus('idle')
  }, [])

  return {
    voiceSupport,
    isSupported: voiceSupport.supported,
    isListening,
    transcript,
    interimTranscript,
    feedback,
    status,
    toggleListening,
    stopListening,
  }
}