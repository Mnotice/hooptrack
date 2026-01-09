import { useState, useEffect } from 'react'
import './App.css'
import WorkoutTab from './components/WorkoutTab'
import ProgressTab from './components/ProgressTab'
import HistoryTab from './components/HistoryTab'

// Generate random test sessions for development
function generateTestSessions() {
  const zones = ['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner']
  const testSessions = []
  const now = Date.now()
  
  // Create 5 sessions from different days
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const sessionStart = now - (dayOffset * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000)
    const shotCount = Math.floor(Math.random() * 15) + 10 // 10-25 shots per session
    const makes = Math.floor(Math.random() * shotCount)
    
    const shots = []
    for (let i = 0; i < shotCount; i++) {
      const randomZone = zones[Math.floor(Math.random() * zones.length)]
      const isMake = i < makes
      shots.push({
        zone: randomZone,
        result: isMake ? 'make' : 'miss',
        timestamp: sessionStart + (i * (Math.random() * 30000 + 10000))
      })
    }
    
    testSessions.push({
      id: sessionStart,
      startTime: sessionStart,
      shots: shots
    })
  }
  
  return testSessions
}

function App() {
  const [activeTab, setActiveTab] = useState('workout')
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState({
    id: Date.now(),
    startTime: Date.now(),
    shots: []
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('hooptrack_sessions')
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions))
      } catch (error) {
        console.error('Error loading sessions:', error)
      }
    } else {
      // Load test sessions on first run
      const testSessions = generateTestSessions()
      setSessions(testSessions)
      localStorage.setItem('hooptrack_sessions', JSON.stringify(testSessions))
    }
  }, [])

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hooptrack_sessions', JSON.stringify(sessions))
  }, [sessions])

  const handleAddShot = (shot) => {
    setCurrentSession(prev => ({
      ...prev,
      shots: [...prev.shots, shot]
    }))
  }

  const handleEndSession = () => {
    if (currentSession.shots.length > 0) {
      setSessions(prev => [...prev, currentSession])
      setCurrentSession({
        id: Date.now(),
        startTime: Date.now(),
        shots: []
      })
      // Optionally switch to history tab to show the saved session
      setActiveTab('history')
    }
  }

  const handleDeleteSession = (sessionId) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
  }

  return (
    <div className="app-container">
      <div className="container">
        <header className="header">
          <h1>HoopTrack</h1>
          <p>Basketball Training Tracker</p>
        </header>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
          >
            Workout
          </button>
          <button
            className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        <div className="content">
          {activeTab === 'workout' && (
            <WorkoutTab
              currentSession={currentSession}
              onAddShot={handleAddShot}
              onEndSession={handleEndSession}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressTab sessions={sessions} />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
