import '../styles/Court.css'

const ZONES = [
  { id: 'top', label: 'Top / Key', name: '3PT Top', description: 'Top of the key' },
  { id: 'left-wing', label: 'Left Wing', name: '3PT Wing Left', description: 'Left side' },
  { id: 'right-wing', label: 'Right Wing', name: '3PT Wing Right', description: 'Right side' },
  { id: 'left-corner', label: 'Left Corner', name: '3PT Corner Left', description: 'Left corner' },
  { id: 'right-corner', label: 'Right Corner', name: '3PT Corner Right', description: 'Right corner' },
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
      <div className="court-label">Tap a zone to select, then log your shot</div>
      <div className="court">
        {/* Court Elements */}
        <div className="three-point-line"></div>
        <div className="key"></div>
        <div className="rim"></div>

        {/* Clickable Zone Areas */}
        {/* Top Center Zone */}
        <div
          className={`zone-area zone-top ${selectedZone === 'top' ? 'selected' : ''}`}
          onClick={() => onZoneSelect('top')}
          title={ZONES[0].description}
        >
          <div className="zone-label">TOP</div>
          <div className="zone-fraction">{getZoneStats('top').makes}/{getZoneStats('top').attempts}</div>
        </div>

        {/* Left Wing Zone */}
        <div
          className={`zone-area zone-left-wing ${selectedZone === 'left-wing' ? 'selected' : ''}`}
          onClick={() => onZoneSelect('left-wing')}
          title={ZONES[1].description}
        >
          <div className="zone-label">LEFT<br/>WING</div>
          <div className="zone-fraction">{getZoneStats('left-wing').makes}/{getZoneStats('left-wing').attempts}</div>
        </div>

        {/* Right Wing Zone */}
        <div
          className={`zone-area zone-right-wing ${selectedZone === 'right-wing' ? 'selected' : ''}`}
          onClick={() => onZoneSelect('right-wing')}
          title={ZONES[2].description}
        >
          <div className="zone-label">RIGHT<br/>WING</div>
          <div className="zone-fraction">{getZoneStats('right-wing').makes}/{getZoneStats('right-wing').attempts}</div>
        </div>

        {/* Left Corner Zone */}
        <div
          className={`zone-area zone-left-corner ${selectedZone === 'left-corner' ? 'selected' : ''}`}
          onClick={() => onZoneSelect('left-corner')}
          title={ZONES[3].description}
        >
          <div className="zone-label">LEFT<br/>CORNER</div>
          <div className="zone-fraction">{getZoneStats('left-corner').makes}/{getZoneStats('left-corner').attempts}</div>
        </div>

        {/* Right Corner Zone */}
        <div
          className={`zone-area zone-right-corner ${selectedZone === 'right-corner' ? 'selected' : ''}`}
          onClick={() => onZoneSelect('right-corner')}
          title={ZONES[4].description}
        >
          <div className="zone-label">RIGHT<br/>CORNER</div>
          <div className="zone-fraction">{getZoneStats('right-corner').makes}/{getZoneStats('right-corner').attempts}</div>
        </div>
      </div>

      {/* Zone Statistics Summary */}
      <div className="zone-stats-summary">
        <h4>Zone Performance</h4>
        <div className="stats-grid">
          {ZONES.map(zone => {
            const stats = getZoneStats(zone.id)
            const percentage = stats.percentage
            let percentColor = '#999'
            if (stats.attempts > 0) {
              percentColor = percentage >= 65 ? '#11998e' : percentage >= 45 ? '#f9a825' : '#eb3349'
            }
            
            return (
              <div 
                key={zone.id} 
                className={`zone-stat-item ${selectedZone === zone.id ? 'highlighted' : ''}`}
                onClick={() => onZoneSelect(zone.id)}
              >
                <div className="stat-zone-name">{zone.label}</div>
                <div className="stat-values">
                  {stats.attempts > 0 ? (
                    <>
                      <span className="stat-percentage" style={{ color: percentColor }}>{stats.percentage}%</span>
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
