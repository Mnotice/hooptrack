import '../styles/Court.css'

const ZONES = [
  { id: 'top', label: 'Top', name: '3PT Top', top: '5%', left: '50%', transform: 'translateX(-50%)' },
  { id: 'left-wing', label: 'L-Wing', name: '3PT Wing', top: '30%', left: '10%' },
  { id: 'right-wing', label: 'R-Wing', name: '3PT Wing', top: '30%', right: '10%' },
  { id: 'left-corner', label: 'L-Corner', name: '3PT Corner', bottom: '10%', left: '5%' },
  { id: 'right-corner', label: 'R-Corner', name: '3PT Corner', bottom: '10%', right: '5%' },
]

export default function Court({ selectedZone, onZoneSelect, shots = [] }) {
  // Calculate stats for each zone
  const getZoneStats = (zoneId) => {
    const zoneShots = shots.filter(shot => shot.zone === zoneId)
    const makes = zoneShots.filter(shot => shot.result === 'make').length
    const attempts = zoneShots.length
    const percentage = attempts > 0 ? Math.round((makes / attempts) * 100) : 0
    
    return { makes, attempts, percentage }
  }

  return (
    <div className="court-container">
      <div className="court-label">Select a zone and log your shot</div>
      <div className="court">
        {/* Court Elements */}
        <div className="three-point-line"></div>
        <div className="key"></div>
        <div className="rim"></div>

        {/* Shot Zones */}
        {ZONES.map(zone => {
          const stats = getZoneStats(zone.id)
          const isSelected = selectedZone === zone.id

          return (
            <div
              key={zone.id}
              className={`shot-zone ${isSelected ? 'selected' : ''}`}
              style={{
                top: zone.top,
                bottom: zone.bottom,
                left: zone.left,
                right: zone.right,
                transform: zone.transform,
              }}
              onClick={() => onZoneSelect(zone.id)}
              title={`${zone.name}\n${stats.makes}/${stats.attempts} (${stats.percentage}%)`}
            >
              <div className="zone-content">
                <div className="zone-label">{zone.label}</div>
                {stats.attempts > 0 && (
                  <div className="zone-stats">
                    <span className="zone-makes">{stats.makes}</span>
                    <span className="zone-slash">/</span>
                    <span className="zone-attempts">{stats.attempts}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Zone Statistics Summary */}
      <div className="zone-stats-summary">
        <h4>Zone Statistics</h4>
        <div className="stats-grid">
          {ZONES.map(zone => {
            const stats = getZoneStats(zone.id)
            return (
              <div key={zone.id} className="zone-stat-item">
                <div className="stat-zone-name">{zone.label}</div>
                <div className="stat-values">
                  {stats.attempts > 0 ? (
                    <>
                      <span className="stat-percentage">{stats.percentage}%</span>
                      <span className="stat-fraction">{stats.makes}/{stats.attempts}</span>
                    </>
                  ) : (
                    <span className="stat-empty">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
