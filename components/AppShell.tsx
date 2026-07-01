'use client';

import { useState, useEffect } from 'react';
import type { Session, ShootingSession, TabId, Shot, DribbleSession } from '@/lib/types';
import { loadSessions, saveSessions } from '@/lib/storage';

import WorkoutTab from '@/components/WorkoutTab';
import DrillsTab from '@/components/DrillsTab';
import ProgressTab from '@/components/ProgressTab';
import HistoryTab from '@/components/HistoryTab';
import { Dumbbell, Activity, BarChart3, History } from 'lucide-react';
import { createShot } from '@/lib/shotTypes';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('workout');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<ShootingSession>(() => ({
    id: Date.now(),
    startTime: Date.now(),
    shots: [],
    type: 'shooting'
  }));

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const handleAddShot = (shot: Shot | Parameters<typeof createShot>[0]) => {
    const normalizedShot = 'timestamp' in shot && shot.timestamp ? shot : createShot(shot);
    setCurrentSession(prev => ({
      ...prev,
      shots: [...prev.shots, normalizedShot]
    }));
  };

  const handleEndSession = (dribbleSession: DribbleSession | null = null) => {
    const sessionToSave = dribbleSession || currentSession;
    
    if (('shots' in sessionToSave && sessionToSave.shots.length > 0) || sessionToSave.type === 'dribbling') {
      setSessions(prev => [...prev, sessionToSave]);
      
      setCurrentSession({
        id: Date.now(),
        startTime: Date.now(),
        shots: [],
        type: 'shooting'
      });
      
      setActiveTab('history');
    }
  };

  const handleDeleteSession = (sessionId: number) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <span className="logo-icon">🏀</span>
          <h1>HoopTrack</h1>
        </div>
        <p className="tagline">2026 TRAINING OS</p>
      </div>

      <div className="main">
        {/* Modern Sidebar */}
        <nav className="sidebar">
          <button
            className={`nav-item ${activeTab === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveTab('workout')}
          >
            <Dumbbell size={28} />
            <span>Shoot</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'drills' ? 'active' : ''}`}
            onClick={() => setActiveTab('drills')}
          >
            <Activity size={28} />
            <span>Drills</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <BarChart3 size={28} />
            <span>Progress</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={28} />
            <span>History</span>
          </button>
        </nav>

        <div className="content-area">
          {activeTab === 'workout' && (
            <WorkoutTab
              currentSession={currentSession}
              onAddShot={handleAddShot}
              onEndSession={handleEndSession}
            />
          )}
          {activeTab === 'drills' && <DrillsTab onEndSession={handleEndSession} />}
          {activeTab === 'progress' && <ProgressTab sessions={sessions} />}
          {activeTab === 'history' && (
            <HistoryTab
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
            />
          )}
        </div>
      </div>

      {/* Modern Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`bottom-tab ${activeTab === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveTab('workout')}
        >
          <Dumbbell size={24} />
          <span>Shoot</span>
        </button>
        <button
          className={`bottom-tab ${activeTab === 'drills' ? 'active' : ''}`}
          onClick={() => setActiveTab('drills')}
        >
          <Activity size={24} />
          <span>Drills</span>
        </button>
        <button
          className={`bottom-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <BarChart3 size={24} />
          <span>Stats</span>
        </button>
        <button
          className={`bottom-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={24} />
          <span>Log</span>
        </button>
      </nav>
    </div>
  );
}


