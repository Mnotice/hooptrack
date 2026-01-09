import { Trash2, Calendar, Target } from 'lucide-react'
import '../styles/HistoryTab.css'

export default function HistoryTab({ sessions, onDeleteSession }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSessionStats = (session) => {
    const makes = session.shots.filter(s => s.result === 'make').length
    const total = session.shots.length
    const percentage = total > 0 ? Math.round((makes / total) * 100) : 0
    return { makes, misses: total - makes, total, percentage }
  }

  return (
    <div className="history-container">
      <h2 className="section-title">Session History</h2>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <p>No sessions yet. Complete a workout to see your history!</p>
        </div>
      ) : (
        <div className="sessions-list">
          {[...sessions].reverse().map((session, index) => {
            const stats = getSessionStats(session)
            const sessionIndex = sessions.length - index

            return (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-info">
                    <h3 className="session-date">
                      <Calendar size={18} />
                      {formatDate(session.startTime)}
                    </h3>
                    <span className="session-label">Session #{sessionIndex}</span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => onDeleteSession(session.id)}
                    title="Delete session"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="session-stats">
                  <div className="stat-box">
                    <span className="stat-label">Makes</span>
                    <span className="stat-number makes">{stats.makes}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Misses</span>
                    <span className="stat-number misses">{stats.misses}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Total</span>
                    <span className="stat-number">{stats.total}</span>
                  </div>
                  <div className="stat-box highlight">
                    <span className="stat-label">FG%</span>
                    <span className="stat-number percentage">{stats.percentage}%</span>
                  </div>
                </div>

                {session.shots.length > 0 && (
                  <div className="shots-breakdown">
                    <div className="breakdown-title">Shot Details</div>
                    <div className="zone-breakdown-mini">
                      {['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner'].map(zone => {
                        const zoneShots = session.shots.filter(s => s.zone === zone)
                        if (zoneShots.length === 0) return null

                        const zoneMakes = zoneShots.filter(s => s.result === 'make').length
                        return (
                          <div key={zone} className="zone-mini-item">
                            <span className="zone-mini-name">{zone.split('-')[0][0].toUpperCase()}</span>
                            <span className="zone-mini-stat">{zoneMakes}/{zoneShots.length}</span>
                          </div>
                        )
                      })}
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
          <p>Total Sessions: <strong>{sessions.length}</strong></p>
        </div>
      )}
    </div>
  )
}
