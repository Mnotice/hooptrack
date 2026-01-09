import { useState } from 'react'
import Court from './Court'
import VoiceRecognition from './VoiceRecognition'
import InputBlueprint from './InputBlueprint'
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

  const handleVoiceShot = (shot) => {
    onAddShot(shot)
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

      <InputBlueprint />

      <VoiceRecognition 
        onShotLogged={handleVoiceShot}
        onSessionEnded={onEndSession}
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
        <div className="summary-row">
          <span>Total Shots</span>
          <span className="summary-value">{total}</span>
        </div>
        <div className="summary-row">
          <span>Field Goal %</span>
          <span className="summary-value">{percentage}%</span>
        </div>
        <div className="summary-row">
          <span>Shooting Streak</span>
          <span className="summary-value">{currentSession.shots.length > 0 ? 'In Progress' : 'Not Started'}</span>
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
