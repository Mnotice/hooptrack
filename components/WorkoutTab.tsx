'use client';

import { useState } from 'react'
import type { Shot, ShootingSession, ZoneId } from '@/lib/types'
import type { ShotAnimation } from '@/lib/types'

interface WorkoutTabProps {
  currentSession: ShootingSession
  onAddShot: (shot: Shot) => void
  onEndSession: () => void
}

interface LocalShotAnimation extends ShotAnimation {}
import Court from '@/components/Court'
import VoiceControl from '@/components/VoiceControl'
import { Check, X } from 'lucide-react'
import '../styles/WorkoutTab.css'

export default function WorkoutTab({ currentSession, onAddShot, onEndSession }: WorkoutTabProps) {
  const [selectedZone, setSelectedZone] = useState<ZoneId | null>(null)
  const [shotAnimation, setShotAnimation] = useState<LocalShotAnimation | null>(null)

  const logShot = (result: Shot['result'], zone: ZoneId | null) => {
    if (!zone) return
    const timestamp = Date.now()
    onAddShot({ result, zone, timestamp })
    setShotAnimation({ result, zone, key: timestamp })
    setSelectedZone(null)
  }

  const handleMakeShot = () => logShot('make', selectedZone)
  const handleMissShot = () => logShot('miss', selectedZone)

  const handleVoiceAddShot = (shot: Shot) => {
    onAddShot(shot)
    if (shot.zone) {
      setShotAnimation({ result: shot.result, zone: shot.zone, key: shot.timestamp || Date.now() })
    }
  }

  const makes = currentSession.shots.filter((s) => s.result === 'make').length
  const misses = currentSession.shots.filter((s) => s.result === 'miss').length
  const total = makes + misses
  const percentage = total > 0 ? Math.round((makes / total) * 100) : 0

  return (
    <div className="workout-container">
      <div className="workout-stats-bar">
        <div className="workout-stat">
          <span className="workout-stat-value makes">{makes}</span>
          <span className="workout-stat-label">Makes</span>
        </div>
        <div className="workout-stat">
          <span className="workout-stat-value misses">{misses}</span>
          <span className="workout-stat-label">Misses</span>
        </div>
        <div className="workout-stat">
          <span className="workout-stat-value">{percentage}%</span>
          <span className="workout-stat-label">FG%</span>
        </div>
        <div className="workout-stat">
          <span className="workout-stat-value">{total}</span>
          <span className="workout-stat-label">Shots</span>
        </div>
      </div>

      <Court
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
        shots={currentSession.shots}
        shotAnimation={shotAnimation}
      />

      <div className="workout-actions">
        <VoiceControl
          selectedZone={selectedZone}
          onZoneSelect={setSelectedZone}
          currentSession={currentSession}
          onAddShot={handleVoiceAddShot}
          onEndSession={onEndSession}
        />

        <div className="shot-buttons">
          <button
            type="button"
            className="shot-btn shot-btn-make"
            onClick={handleMakeShot}
            disabled={!selectedZone}
          >
            <Check size={22} strokeWidth={3} />
            Make
          </button>
          <button
            type="button"
            className="shot-btn shot-btn-miss"
            onClick={handleMissShot}
            disabled={!selectedZone}
          >
            <X size={22} strokeWidth={3} />
            Miss
          </button>
        </div>
      </div>

      <button
        type="button"
        className="end-session-btn"
        onClick={onEndSession}
        disabled={total === 0}
      >
        End Session
      </button>
    </div>
  )
}