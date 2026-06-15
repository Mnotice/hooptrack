import { useCallback, useEffect, useRef, useState } from 'react'
import { RimMotionDetector } from '../utils/rimMotionDetector'
import { BallTracker } from '../utils/ballDetector'
import { inferZoneFromReleasePoint, inferZoneFromTrajectory } from '../utils/zoneMapper'

const PHASES = {
  CALIBRATION: 1,
  RIM_MOTION: 2,
  BALL_TRACKING: 3,
  ZONE_INFERENCE: 4,
}

export function useShotDetection({ captureFrame, rimRoi, enabled, phase = 4 }) {
  const rimDetectorRef = useRef(new RimMotionDetector())
  const ballTrackerRef = useRef(new BallTracker())
  const rafRef = useRef(null)
  const [metrics, setMetrics] = useState({
    rimDelta: 0,
    ballDetected: false,
    activePhase: PHASES.CALIBRATION,
  })
  const [suggestion, setSuggestion] = useState(null)

  const resetDetectors = useCallback(() => {
    rimDetectorRef.current.reset()
    ballTrackerRef.current.reset()
    setSuggestion(null)
    setMetrics({
      rimDelta: 0,
      ballDetected: false,
      activePhase: rimRoi ? PHASES.RIM_MOTION : PHASES.CALIBRATION,
    })
  }, [rimRoi])

  const buildSuggestion = useCallback((rimResult, ballResult, zoneResult) => {
    const signals = []

    if (phase >= 2 && rimResult?.isShotEvent) {
      signals.push({
        source: 'rim',
        result: rimResult.suggestedResult,
        confidence: rimResult.confidence,
        weight: 0.45,
      })
    }

    if (phase >= 3 && ballResult?.shotCompleted) {
      const traj = ballTrackerRef.current.analyzeTrajectory(ballResult.trajectory, rimRoi)
      if (traj.reachedRim) {
        signals.push({
          source: 'ball',
          result: traj.suggestedResult,
          confidence: traj.confidence,
          weight: 0.4,
        })
      }
    }

    let zoneId = null
    let zoneConfidence = 0
    if (phase >= 4) {
      const zoneInference = zoneResult
        || (ballResult?.releasePoint
          ? inferZoneFromReleasePoint(ballResult.releasePoint.x, ballResult.releasePoint.y)
          : null)
        || (ballResult?.trajectory
          ? inferZoneFromTrajectory(ballResult.trajectory)
          : null)

      if (zoneInference) {
        zoneId = zoneInference.zoneId
        zoneConfidence = zoneInference.confidence
      }
    }

    if (signals.length === 0) return null

    const makeWeight = signals
      .filter((s) => s.result === 'make')
      .reduce((sum, s) => sum + s.confidence * s.weight, 0)
    const missWeight = signals
      .filter((s) => s.result === 'miss')
      .reduce((sum, s) => sum + s.confidence * s.weight, 0)

    const result = makeWeight >= missWeight ? 'make' : 'miss'
    const confidence = Math.min(0.95, Math.max(makeWeight, missWeight) + (signals.length > 1 ? 0.1 : 0))

    return {
      result,
      confidence,
      zone: zoneId,
      zoneConfidence,
      sources: signals.map((s) => s.source),
      phases: {
        rim: phase >= 2 && rimResult?.isShotEvent,
        ball: phase >= 3 && ballResult?.shotCompleted,
        zone: phase >= 4 && !!zoneId,
      },
    }
  }, [phase, rimRoi])

  const dismissSuggestion = useCallback(() => {
    setSuggestion(null)
    ballTrackerRef.current.reset()
    rimDetectorRef.current.lastEventAt = Date.now()
  }, [])

  const rimKey = rimRoi ? `${rimRoi.cx}-${rimRoi.cy}-${rimRoi.radius}` : 'none'

  useEffect(() => {
    if (!enabled || !captureFrame || !rimRoi) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return undefined
    }

    rimDetectorRef.current.reset()
    ballTrackerRef.current.reset()

    let lastTick = 0
    const tick = (timestamp) => {
      if (timestamp - lastTick < 120) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      lastTick = timestamp

      const frame = captureFrame()
      if (!frame) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const { imageData, width, height } = frame
      let rimResult = { isShotEvent: false, confidence: 0, delta: 0 }
      let ballResult = { detected: false, shotCompleted: false }

      if (phase >= 2) {
        rimResult = rimDetectorRef.current.analyze(imageData, width, height, rimRoi)
      }

      if (phase >= 3) {
        ballResult = ballTrackerRef.current.detect(imageData, width, height)
      }

      const zoneResult = phase >= 4 && ballResult.releasePoint
        ? inferZoneFromReleasePoint(ballResult.releasePoint.x, ballResult.releasePoint.y)
        : null

      setMetrics({
        rimDelta: rimResult.delta || 0,
        ballDetected: ballResult.detected,
        activePhase: phase,
        zonePreview: zoneResult?.zoneId ?? null,
      })

      const nextSuggestion = buildSuggestion(rimResult, ballResult, zoneResult)
      if (nextSuggestion && nextSuggestion.confidence >= 0.35) {
        setSuggestion((prev) => {
          if (prev && Date.now() - prev.createdAt < 1500) return prev
          return { ...nextSuggestion, createdAt: Date.now() }
        })
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, captureFrame, rimRoi, rimKey, phase, buildSuggestion])

  return {
    metrics,
    suggestion,
    dismissSuggestion,
    resetDetectors,
    phases: PHASES,
  }
}