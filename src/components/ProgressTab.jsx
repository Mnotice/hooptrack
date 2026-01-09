import { useState, useMemo } from 'react'
import { TrendingUp, Award, Target, Calendar } from 'lucide-react'
import '../styles/ProgressTab.css'

export default function ProgressTab({ sessions }) {
  const stats = useMemo(() => {
    const now = Date.now()
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000
    const twoWeeksMs = 14 * 24 * 60 * 60 * 1000

    // Current week sessions
    const currentWeekSessions = sessions.filter(s => (now - s.startTime) < oneWeekMs)
    const lastWeekSessions = sessions.filter(
      s => (now - s.startTime) >= oneWeekMs && (now - s.startTime) < twoWeeksMs
    )

    // Calculate current week stats
    const currentWeekShots = currentWeekSessions.flatMap(s => s.shots)
    const currentWeekMakes = currentWeekShots.filter(s => s.result === 'make').length
    const currentWeekTotal = currentWeekShots.length
    const currentWeekPercentage = currentWeekTotal > 0 ? Math.round((currentWeekMakes / currentWeekTotal) * 100) : 0

    // Calculate last week stats
    const lastWeekShots = lastWeekSessions.flatMap(s => s.shots)
    const lastWeekMakes = lastWeekShots.filter(s => s.result === 'make').length
    const lastWeekTotal = lastWeekShots.length
    const lastWeekPercentage = lastWeekTotal > 0 ? Math.round((lastWeekMakes / lastWeekTotal) * 100) : 0

    // Calculate all-time stats
    const allShots = sessions.flatMap(s => s.shots)
    const allMakes = allShots.filter(s => s.result === 'make').length
    const allTotal = allShots.length
    const overallPercentage = allTotal > 0 ? Math.round((allMakes / allTotal) * 100) : 0

    // Zone breakdown for current week
    const zoneStats = {}
    const zones = ['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner']
    
    zones.forEach(zone => {
      const zoneShots = currentWeekShots.filter(s => s.zone === zone)
      const zoneMakes = zoneShots.filter(s => s.result === 'make').length
      const zoneTotal = zoneShots.length
      const zonePercentage = zoneTotal > 0 ? Math.round((zoneMakes / zoneTotal) * 100) : 0
      
      zoneStats[zone] = {
        makes: zoneMakes,
        attempts: zoneTotal,
        percentage: zonePercentage,
      }
    })

    return {
      currentWeek: {
        shots: currentWeekTotal,
        makes: currentWeekMakes,
        percentage: currentWeekPercentage,
        sessions: currentWeekSessions.length,
      },
      lastWeek: {
        shots: lastWeekTotal,
        makes: lastWeekMakes,
        percentage: lastWeekPercentage,
        sessions: lastWeekSessions.length,
      },
      overall: {
        percentage: overallPercentage,
        makes: allMakes,
        shots: allTotal,
      },
      zones: zoneStats,
    }
  }, [sessions])

  const getZoneColor = (percentage) => {
    if (percentage >= 65) return 'green'
    if (percentage >= 45) return 'yellow'
    return 'red'
  }

  const percentageChange = stats.lastWeek.shots > 0
    ? stats.currentWeek.percentage - stats.lastWeek.percentage
    : 0

  return (
    <div className="progress-container">
      <h2 className="section-title">Your Progress</h2>

      {stats.currentWeek.shots === 0 && stats.lastWeek.shots === 0 ? (
        <div className="empty-state">
          <Target size={48} />
          <p>No data yet. Start a workout to track your progress!</p>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="overall-stats">
            <div className="stat-card large">
              <div className="stat-label">Overall FG%</div>
              <div className="stat-value">{stats.overall.percentage}%</div>
              <div className="stat-detail">{stats.overall.makes}/{stats.overall.shots} shots</div>
            </div>
          </div>

          {/* Current Week Section */}
          <div className="week-section">
            <h3 className="week-title">
              <Calendar size={16} />
              This Week
            </h3>

            {stats.currentWeek.shots > 0 ? (
              <>
                {/* Shot Volume with Progress Bar */}
                <div className="shot-volume">
                  <div className="volume-header">
                    <span className="volume-label">Shot Volume</span>
                    <span className="volume-count">{stats.currentWeek.shots} shots</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((stats.currentWeek.shots / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-labels">
                    <span>{stats.currentWeek.sessions} sessions</span>
                    <span>{Math.round(stats.currentWeek.shots / (stats.currentWeek.sessions || 1))} avg per session</span>
                  </div>
                </div>

                {/* Shooting Percentage */}
                <div className="shooting-stats">
                  <div className="shooting-card">
                    <span className="shooting-label">FG% This Week</span>
                    <span className="shooting-value">{stats.currentWeek.percentage}%</span>
                  </div>
                  <div className={`shooting-card comparison ${percentageChange >= 0 ? 'positive' : 'negative'}`}>
                    <span className="shooting-label">vs. Last Week</span>
                    <span className="shooting-value">
                      {percentageChange >= 0 ? '+' : ''}{percentageChange}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-week-data">
                <p>No shots this week yet. Get shooting!</p>
              </div>
            )}
          </div>

          {/* Zone Heat Map */}
          <div className="zone-heatmap-section">
            <h3 className="zone-heatmap-title">Zone Performance Heat Map</h3>
            <div className="heatmap-container">
              <div className="heatmap-grid">
                {['top', 'left-wing', 'right-wing', 'left-corner', 'right-corner'].map((zone) => {
                  const zoneData = stats.zones[zone]
                  const color = getZoneColor(zoneData.percentage)
                  const zoneLabel = {
                    'top': 'Top/Key',
                    'left-wing': 'Left Wing',
                    'right-wing': 'Right Wing',
                    'left-corner': 'Left Corner',
                    'right-corner': 'Right Corner',
                  }[zone]

                  return (
                    <div key={zone} className={`heatmap-item color-${color}`}>
                      <div className="heatmap-zone-name">{zoneLabel}</div>
                      <div className="heatmap-value">{zoneData.percentage}%</div>
                      <div className="heatmap-detail">
                        {zoneData.attempts > 0 ? `${zoneData.makes}/${zoneData.attempts}` : '—'}
                      </div>
                      {zoneData.attempts === 0 && (
                        <div className="heatmap-empty">No data</div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="heatmap-legend">
                <div className="legend-item">
                  <span className="legend-color green"></span>
                  <span className="legend-label">Good (65%+)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color yellow"></span>
                  <span className="legend-label">Fair (45-65%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color red"></span>
                  <span className="legend-label">Needs Work (&lt;45%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Week Comparison */}
          {stats.lastWeek.shots > 0 && (
            <div className="week-comparison">
              <h3 className="comparison-title">Last Week</h3>
              <div className="comparison-stats">
                <div className="comparison-item">
                  <span className="comparison-label">Shots</span>
                  <span className="comparison-value">{stats.lastWeek.shots}</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-label">FG%</span>
                  <span className="comparison-value">{stats.lastWeek.percentage}%</span>
                </div>
                <div className="comparison-item">
                  <span className="comparison-label">Sessions</span>
                  <span className="comparison-value">{stats.lastWeek.sessions}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
