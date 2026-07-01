'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { DribbleSession, DrillCategory } from '@/lib/types';

interface DrillDefinition {
  id: string;
  name: string;
  duration: number;
  description: string;
  repsTarget: number;
  category: DrillCategory;
  difficulty: string;
}

interface DrillsTabProps {
  onEndSession: (session: DribbleSession) => void;
}
import { Play, Pause, RotateCcw, Star, Timer, Target, Award } from 'lucide-react';
import '../styles/DrillsTab.css';

const CATEGORIES = [
  { id: 'all', label: 'All Drills' },
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'handles', label: 'Handles' },
  { id: 'athletic', label: 'Athletic' },
  { id: 'advanced', label: 'Advanced' },
];

const DRILLS: DrillDefinition[] = [
  { 
    id: 'pound', 
    name: 'Stationary Pound', 
    duration: 120, 
    description: 'Low, powerful dribbling with both hands. Focus on control and speed.', 
    repsTarget: 240,
    category: 'fundamentals',
    difficulty: 'Beginner',
  },
  { 
    id: 'figure8', 
    name: 'Figure 8 + Crossover', 
    duration: 90, 
    description: 'Continuous figure 8 with explosive crossovers. Keep eyes up.', 
    repsTarget: 80,
    category: 'handles',
    difficulty: 'Intermediate',
  },
  { 
    id: 'behindback', 
    name: 'Behind the Back Series', 
    duration: 120, 
    description: 'Continuous behind-the-back dribble changes. Build rhythm.', 
    repsTarget: 100,
    category: 'handles',
    difficulty: 'Intermediate',
  },
  { 
    id: 'spider', 
    name: 'Spider Dribble', 
    duration: 90, 
    description: '4-way simultaneous dribble control. Master all directions.', 
    repsTarget: 90,
    category: 'advanced',
    difficulty: 'Advanced',
  },
  { 
    id: 'speed', 
    name: 'Speed Dribble Sprints', 
    duration: 60, 
    description: 'Full court speed dribbling bursts. Push maximum velocity.', 
    repsTarget: 12,
    category: 'athletic',
    difficulty: 'Intermediate',
  },
  { 
    id: 'combo', 
    name: 'Advanced Combo Challenge', 
    duration: 180, 
    description: 'Mix of all moves at game speed. Game-like decision making.', 
    repsTarget: 150,
    category: 'advanced',
    difficulty: 'Advanced',
  },
];

export default function DrillsTab({ onEndSession }: DrillsTabProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDrill, setSelectedDrill] = useState<DrillDefinition | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reps, setReps] = useState(0);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startDrill = (drill: DrillDefinition) => {
    setSelectedDrill(drill);
    setTimeLeft(drill.duration);
    setReps(0);
    setRating(0);
    setIsActive(true);
    setShowRating(false);
    setSessionComplete(false);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetDrill = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setSelectedDrill(null);
    setTimeLeft(0);
    setReps(0);
    setRating(0);
    setShowRating(false);
    setSessionComplete(false);
  };

  const finishDrill = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setShowRating(true);
  };

  const saveSession = () => {
    if (!selectedDrill) return;
    const session: DribbleSession = {
      id: Date.now(),
      startTime: Date.now(),
      type: 'dribbling',
      drillName: selectedDrill.name,
      duration: selectedDrill.duration - timeLeft,
      repsCompleted: reps,
      rating: rating || 4,
      timestamp: Date.now()
    };
    
    onEndSession(session);
    setSessionComplete(true);
    
    setTimeout(() => {
      resetDrill();
    }, 1500);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishDrill();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = selectedDrill ? ((selectedDrill.duration - timeLeft) / selectedDrill.duration) * 100 : 0;

  const filteredDrills = activeCategory === 'all'
    ? DRILLS
    : DRILLS.filter((drill) => drill.category === activeCategory);

  return (
    <div className="drills-container">
      <div className="drills-header">
        <div className="header-content">
          <Award className="header-icon" size={32} />
          <div>
            <h1>Dribbling Lab</h1>
            <p className="subtitle">
              {DRILLS.length} drills available • Master your handles
            </p>
          </div>
        </div>
      </div>

      {!selectedDrill ? (
        <>
          <div className="drill-filters">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`filter-chip ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <p className="drill-count">
            Showing {filteredDrills.length} of {DRILLS.length} drills
          </p>

          <div className="drill-grid">
            {filteredDrills.map((drill) => (
              <div 
                key={drill.id} 
                className="drill-card glass-card"
                onClick={() => startDrill(drill)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && startDrill(drill)}
              >
                <div className="drill-visual">
                  <Target size={42} className="drill-icon" />
                  <div className="duration-badge">{Math.floor(drill.duration / 60)}′</div>
                </div>
                
                <div className="drill-content">
                  <div className="drill-meta">
                    <span className={`difficulty-badge ${drill.category}`}>
                      {drill.difficulty}
                    </span>
                  </div>
                  <h3>{drill.name}</h3>
                  <p className="description">{drill.description}</p>
                  
                  <div className="drill-stats">
                    <div className="stat">
                      <Timer size={16} />
                      <span>{Math.floor(drill.duration / 60)} min</span>
                    </div>
                    <div className="stat">
                      <Target size={16} />
                      <span>{drill.repsTarget} touches</span>
                    </div>
                  </div>
                </div>
                
                <button type="button" className="start-drill-btn neon-button">
                  BEGIN DRILL
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="active-session glass-card">
          <div className="session-header">
            <h2>{selectedDrill.name}</h2>
            <p className="session-desc">{selectedDrill.description}</p>
          </div>

          <div className="progress-ring-container">
            <div className="progress-circle" style={{ '--progress': `${progress}%` } as CSSProperties}>
              <div className="time-left">
                <div className="time-value">{formatTime(timeLeft)}</div>
                <div className="time-label">REMAINING</div>
              </div>
            </div>
          </div>

          <div className="reps-display">
            <div className="reps-label">TOUCHES</div>
            <div className="reps-count">{reps}</div>
            <div className="reps-target">/ {selectedDrill.repsTarget}</div>
          </div>

          <div className="session-controls">
            <button 
              onClick={toggleTimer} 
              className={`control-btn timer-btn ${isActive ? 'active' : ''}`}
            >
              {isActive ? <Pause size={32} /> : <Play size={32} />}
            </button>
            
            <button 
              onClick={() => setReps(r => Math.max(0, r + 1))} 
              className="control-btn rep-btn"
            >
              +1 TOUCH
            </button>
            
            <button onClick={resetDrill} className="control-btn reset-btn">
              <RotateCcw size={24} />
            </button>
          </div>

          {showRating && (
            <div className="rating-overlay">
              <div className="rating-card glass-card">
                <h3>How did that feel?</h3>
                <p className="rating-subtitle">Rate your technique and control</p>
                
                <div className="star-rating">
                  {[1,2,3,4,5].map((star) => (
                    <Star
                      key={star}
                      size={52}
                      className={`star ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      fill={star <= rating ? "#ffd700" : "transparent"}
                    />
                  ))}
                </div>

                {rating > 0 && (
                  <button onClick={saveSession} className="save-btn neon-button">
                    {sessionComplete ? '✓ SAVED TO HISTORY' : 'SAVE SESSION'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
