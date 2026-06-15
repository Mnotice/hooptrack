import { useEffect, useState } from 'react'
import { ZONE_ORIGINS, getMissVariant } from '../utils/zoneOrigins'
import '../styles/Court.css'

export const ZONES = [
  { id: 'top', short: 'Top', label: 'Top / Key' },
  { id: 'left-wing', short: 'L Wing', label: 'Left Wing' },
  { id: 'right-wing', short: 'R Wing', label: 'Right Wing' },
  { id: 'left-corner', short: 'L Cnr', label: 'Left Corner' },
  { id: 'right-corner', short: 'R Cnr', label: 'Right Corner' },
]

function getZoneStats(shots, zoneId) {
  const zoneShots = shots.filter((shot) => shot.zone === zoneId)
  const makes = zoneShots.filter((shot) => shot.result === 'make').length
  const attempts = zoneShots.length
  const percentage = attempts > 0 ? Math.round((makes / attempts) * 100) : null
  return { makes, attempts, percentage }
}

function getPercentColor(percentage) {
  if (percentage === null) return ''
  if (percentage >= 65) return 'good'
  if (percentage >= 45) return 'fair'
  return 'poor'
}

export default function Court({ selectedZone, onZoneSelect, shots = [], shotAnimation = null }) {
  const selected = ZONES.find((z) => z.id === selectedZone)
  const [anim, setAnim] = useState(null)

  useEffect(() => {
    if (!shotAnimation?.key || !shotAnimation.zone) return undefined

    const origin = ZONE_ORIGINS[shotAnimation.zone] || ZONE_ORIGINS.top
    const missVariant = shotAnimation.result === 'miss'
      ? getMissVariant(shotAnimation.zone)
      : null

    setAnim({
      result: shotAnimation.result,
      zone: shotAnimation.zone,
      key: shotAnimation.key,
      origin,
      missVariant,
    })

    const timer = setTimeout(() => setAnim(null), 1100)
    return () => clearTimeout(timer)
  }, [shotAnimation?.key])

  const ballStyle = anim ? {
    '--start-x': `${anim.origin.x}%`,
    '--start-y': `${anim.origin.y}%`,
    '--miss-drift': anim.missVariant?.type === 'airball' ? `${anim.missVariant.drift}%` : '0%',
    '--rebound-x': anim.missVariant?.type === 'rebound' ? `${anim.missVariant.reboundX}%` : '50%',
  } : {}

  const ballClass = anim
    ? `shot-ball anim-${anim.result === 'make' ? 'make' : anim.missVariant?.type || 'airball'}`
    : ''

  const rimClass = anim?.result === 'make'
    ? 'rim-swish'
    : anim?.missVariant?.type === 'rebound'
      ? 'rim-rebound'
      : ''

  const netClass = anim?.result === 'make' ? 'net-swish' : ''

  return (
    <div className="court-container">
      <p className="court-hint">Tap a zone on the court</p>

      <div className="court-stage">
        <div className="court" role="group" aria-label="Basketball court zones">
          <div className="court-lines" aria-hidden="true">
            <div className="court-arc" />
            <div className="court-key" />
          </div>

          <div className="court-hoop" aria-hidden="true">
            <div className="hoop-assembly">
              <div className="hoop-backboard">
                <div className="hoop-backboard-inner" />
                <div className="hoop-backboard-square" />
              </div>
              <div className="hoop-bracket" />
              <div className="hoop-rim">
                <div className={`hoop-rim-ring ${rimClass}`} />
                <div className={`hoop-net ${netClass}`}>
                  <span /><span /><span /><span /><span />
                </div>
              </div>
            </div>
          </div>

          {anim && (
            <>
              <div key={anim.key} className={ballClass} style={ballStyle} aria-hidden="true" />
              {anim.result === 'make' && (
                <span key={`label-${anim.key}`} className="shot-label shot-label-swish">Swish!</span>
              )}
              {anim.result === 'miss' && anim.missVariant?.type === 'airball' && (
                <span key={`label-${anim.key}`} className="shot-label shot-label-airball">Airball</span>
              )}
              {anim.result === 'miss' && anim.missVariant?.type === 'rebound' && (
                <span key={`label-${anim.key}`} className="shot-label shot-label-rebound">Rebound</span>
              )}
            </>
          )}

          {ZONES.map((zone) => {
            const stats = getZoneStats(shots, zone.id)
            const perf = getPercentColor(stats.percentage)
            const isSelected = selectedZone === zone.id

            return (
              <button
                key={zone.id}
                type="button"
                className={`court-zone zone-${zone.id} ${isSelected ? 'selected' : ''} ${perf}`}
                onClick={() => onZoneSelect(zone.id)}
                aria-label={`${zone.label}, ${stats.attempts > 0 ? `${stats.makes} of ${stats.attempts} made` : 'no shots yet'}`}
                aria-pressed={isSelected}
              >
                <span className="court-zone-name">{zone.short}</span>
                <span className="court-zone-stat">
                  {stats.attempts > 0 ? `${stats.makes}/${stats.attempts}` : '—'}
                </span>
                {stats.percentage !== null && (
                  <span className="court-zone-pct">{stats.percentage}%</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className={`court-selection ${selected ? 'active' : ''}`}>
        {selected ? (
          <>
            <span className="court-selection-dot" />
            <span className="court-selection-label">{selected.label}</span>
            {selectedZone && (() => {
              const s = getZoneStats(shots, selectedZone)
              return s.attempts > 0 ? (
                <span className="court-selection-stat">{s.makes}/{s.attempts} · {s.percentage}%</span>
              ) : null
            })()}
          </>
        ) : (
          <span className="court-selection-label muted">No zone selected</span>
        )}
      </div>
    </div>
  )
}