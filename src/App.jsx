import { useState, useEffect } from 'react'
import './App.css'
import WorkoutTab from './components/WorkoutTab'
import ProgressTab from './components/ProgressTab'
import HistoryTab from './components/HistoryTab'

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
