export const SHOT_SOURCES = {
  MANUAL: 'manual',
  VOICE: 'voice',
  CAMERA: 'camera',
}

export const ZONES = [
  { id: 'top', label: 'Top / Key' },
  { id: 'left-wing', label: 'Left Wing' },
  { id: 'right-wing', label: 'Right Wing' },
  { id: 'left-corner', label: 'Left Corner' },
  { id: 'right-corner', label: 'Right Corner' },
]

export const DEFAULT_RIM_CALIBRATION = {
  cx: 0.5,
  cy: 0.28,
  radius: 0.08,
}

export function createShot({
  result,
  zone = null,
  source = SHOT_SOURCES.MANUAL,
  confidence = null,
  confirmed = true,
  zoneSource = null,
}) {
  return {
    result,
    zone,
    timestamp: Date.now(),
    source,
    confidence,
    confirmed,
    zoneSource,
  }
}

export function getSessionStats(shots) {
  const makes = shots.filter((s) => s.result === 'make').length
  const total = shots.length
  return {
    makes,
    misses: total - makes,
    total,
    percentage: total > 0 ? Math.round((makes / total) * 100) : 0,
  }
}