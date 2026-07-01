// @ts-nocheck
import { ZONES } from './shotTypes'

export function inferZoneFromReleasePoint(x, y) {
  const clampedX = Math.max(0, Math.min(1, x))
  const clampedY = Math.max(0, Math.min(1, y))

  let zoneId
  let confidence

  if (clampedX < 0.22) {
    zoneId = clampedY > 0.55 ? 'left-corner' : 'left-wing'
    confidence = 0.55 + (clampedY > 0.55 ? 0.15 : 0.1)
  } else if (clampedX > 0.78) {
    zoneId = clampedY > 0.55 ? 'right-corner' : 'right-wing'
    confidence = 0.55 + (clampedY > 0.55 ? 0.15 : 0.1)
  } else if (clampedX >= 0.38 && clampedX <= 0.62) {
    zoneId = 'top'
    confidence = 0.65
  } else if (clampedX < 0.5) {
    zoneId = 'left-wing'
    confidence = 0.6
  } else {
    zoneId = 'right-wing'
    confidence = 0.6
  }

  const zone = ZONES.find((z) => z.id === zoneId)
  return {
    zoneId,
    zoneLabel: zone?.label ?? zoneId,
    confidence: Math.min(0.85, confidence),
    releasePoint: { x: clampedX, y: clampedY },
  }
}

export function inferZoneFromTrajectory(trajectory) {
  if (!trajectory || trajectory.length === 0) return null
  const release = trajectory[0]
  return inferZoneFromReleasePoint(release.x, release.y)
}