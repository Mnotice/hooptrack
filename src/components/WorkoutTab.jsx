import { useState } from 'react'
import Court from './Court'
import VoiceControl from './VoiceControl'
import { Target, Flame, BarChart3 } from 'lucide-react'
import '../styles/WorkoutTab.css'

export default function WorkoutTab({ currentSession, onAddShot, onEndSession }) {
  const [selectedZone, setSelectedZone] = useState(null)

  const handleMakeShot = () => {
    onAddShot({ result: 'make', zone: selectedZone, timestamp: Date.now() })
    setSelectedZone(null)
  }

  const handleMissShot = () => {
    onAddShot({ result: 'miss', zone: selectedZone, timestamp: Date.now() })
    setSelectedZone(null)
  }

  const makes = currentSession.shots.filter(s => s.result === 'make').length
  const misses = currentSession.shots.filter(s => s.result === 'miss').length
  const total = makes + misses
  const percentage = total > 0 ? Math.round((makes / total) * 100) : 0

  return (
    <div className="workout-container">
      <div className="workout-header">
        <div className="workout-title">Today's Workout</div>
        <div className="workout-stats">
          <div className="stat">
            <span>Makes: {makes}</span>
          </div>
          <div className="stat">
            <span>Misses: {misses}</span>
          </div>
          <div className="stat">
            <span>FG%: {percentage}%</span>
          </div>
        </div>
      </div>

      <Court 
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
        shots={currentSession.shots}
      />

      <VoiceControl
        selectedZone={selectedZone}
        onZoneSelect={setSelectedZone}
        currentSession={currentSession}
        onAddShot={onAddShot}
        onEndSession={onEndSession}
      />

      <div className="shot-buttons">
        <button 
          className="shot-btn shot-btn-make"
          onClick={handleMakeShot}
          disabled={!selectedZone}
        >
          <span className="shot-count">✓</span>
          Make
        </button>
        <button 
          className="shot-btn shot-btn-miss"
          onClick={handleMissShot}
          disabled={!selectedZone}
        >
          <span className="shot-count">✗</span>
          Miss
        </button>
      </div>

      <div className="session-summary">
        <div className="stat-card">
          <div className="stat-icon makes-icon">
            <Target size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{makes}</div>
            <div className="stat-label">Makes</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon flames-icon">
            <Flame size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{percentage}</div>
            <div className="stat-label">FG%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon shots-icon">
            <BarChart3 size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      <button 
        className="end-session-btn"
        onClick={onEndSession}
        disabled={total === 0}
      >
        End Session & Save
      </button>
    </div>
  )
}
