'use client';

import { useState } from 'react'
import type { Session, ShootingSession } from '@/lib/types'

interface HistoryTabProps {
  sessions: Session[]
  onDeleteSession: (sessionId: number) => void
}
import { Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import '../styles/HistoryTab.css'

export default function HistoryTab({ sessions, onDeleteSession }: HistoryTabProps) {
  const [expandedSession, setExpandedSession] = useState<number | null>(null)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getSessionDuration = (session: ShootingSession) => {
    if (session.shots.length === 0) return '0 min'
    const firstShotTime = session.shots[0].timestamp
    const lastShotTime = session.shots[session.shots.length - 1].timestamp
    const durationMs = lastShotTime - firstShotTime
    const minutes = Math.round(durationMs / 60000)
    return minutes > 0 ? `${minutes} min` : '< 1 min'
  }

  const getSessionStats = (session: ShootingSession) => {
    const makes = session.shots.filter(s => s.result === 'make').length
    const total = session.shots.length
    const percentage = total > 0 ? Math.round((makes / total) * 100) : 0
    return { makes, misses: total - makes, total, percentage }
  }

  const getZoneStats = (session: ShootingSession) => {
    const zones = ['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner']
    return zones.map(zone => {
      const zoneShots = session.shots.filter(s => s.zone === zone)
      const zoneMakes = zoneShots.filter(s => s.result === 'make').length
      const zonePercentage = zoneShots.length > 0 ? Math.round((zoneMakes / zoneShots.length) * 100) : 0
      return {
        zone,
        name: zone === 'top' ? 'Top/Key' : zone.replace('-', ' '),
        makes: zoneMakes,
        attempts: zoneShots.length,
        percentage: zonePercentage,
      }
    }).filter(z => z.attempts > 0)
  }

  const determineSessionType = (session: ShootingSession) => {
    if (session.shots.length === 0) return 'Empty'
    const percentage = getSessionStats(session).percentage
    if (percentage >= 70) return 'Hot 🔥'
    if (percentage >= 50) return 'Good ✓'
    return 'Cold ❄️'
  }

  const shootingSessions = sessions.filter((s): s is ShootingSession => s.type === 'shooting')
  const sortedSessions = [...shootingSessions].reverse()

  return (
    <div className="history-container">
      <h2 className="section-title">Session History</h2>

      {shootingSessions.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No sessions yet. Complete a workout to see your history!</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sortedSessions.map((session, index) => {
            const stats = getSessionStats(session)
            const sessionType = determineSessionType(session)
            const isExpanded = expandedSession === session.id
            const zoneStats = getZoneStats(session)
            const duration = getSessionDuration(session)

            return (
              <div key={session.id} className="session-card">
                <button
                  className="session-card-button"
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                >
                  <div className="session-header">
                    <div className="session-main-info">
                      <div className="session-type-badge">{sessionType}</div>
                      <div className="session-date-time">
                        <h3 className="session-date">
                          <Calendar size={16} />
                          {formatDate(session.startTime)}
                        </h3>
                        <span className="session-time">{formatTime(session.startTime)}</span>
                      </div>
                    </div>

                    <div className="session-quick-stats">
                      <div className="quick-stat">
                        <span className="quick-value">{stats.total}</span>
                        <span className="quick-label">shots</span>
                      </div>
                      <div className="quick-stat highlight">
                        <span className="quick-value">{stats.percentage}%</span>
                        <span className="quick-label">FG%</span>
                      </div>
                    </div>

                    <div className="expand-icon">
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="session-expanded">
                    <div className="expanded-divider"></div>

                    {/* Detailed Stats */}
                    <div className="detailed-stats">
                      <div className="stat-row">
                        <span className="stat-row-label">Makes</span>
                        <span className="stat-row-value makes">{stats.makes}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Misses</span>
                        <span className="stat-row-value misses">{stats.misses}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Duration</span>
                        <span className="stat-row-value">{duration}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-row-label">Field Goal %</span>
                        <span className="stat-row-value percentage">{stats.percentage}%</span>
                      </div>
                      {session.shots.some(s => s.source === 'camera') && (
                        <div className="stat-row">
                          <span className="stat-row-label">Camera Shots</span>
                          <span className="stat-row-value">{session.shots.filter(s => s.source === 'camera').length}</span>
                        </div>
                      )}
                    </div>

                    {/* Zone Breakdown */}
                    {zoneStats.length > 0 && (
                      <div className="zone-breakdown-section">
                        <h4 className="breakdown-title">Zone Performance</h4>
                        <div className="zone-stats-grid">
                          {zoneStats.map(zone => (
                            <div key={zone.zone} className="zone-stat-card">
                              <div className="zone-header">
                                <span className="zone-name">{zone.name}</span>
                                <span className="zone-percent">{zone.percentage}%</span>
                              </div>
                              <div className="zone-fraction">{zone.makes}/{zone.attempts}</div>
                              <div className="zone-bar">
                                <div
                                  className="zone-bar-fill"
                                  style={{
                                    width: `${zone.percentage}%`,
                                    backgroundColor:
                                      zone.percentage >= 65
                                        ? '#11998e'
                                        : zone.percentage >= 45
                                        ? '#f9a825'
                                        : '#eb3349',
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="session-actions">
                      <button
                        className="delete-session-btn"
                        onClick={() => onDeleteSession(session.id)}
                        title="Delete this session"
                      >
                        <Trash2 size={16} />
                        Delete Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="history-footer">
          <div className="footer-stat">
            <span className="footer-label">Total Sessions:</span>
            <span className="footer-value">{shootingSessions.length}</span>
          </div>
          <div className="footer-stat">
            <span className="footer-label">Total Shots:</span>
            <span className="footer-value">{shootingSessions.flatMap(s => s.shots).length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
