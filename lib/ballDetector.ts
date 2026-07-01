// @ts-nocheck
function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  const v = max
  return { h, s, v }
}

function isBallColor(r, g, b) {
  const { h, s, v } = rgbToHsv(r, g, b)
  const isOrange = h >= 5 && h <= 45 && s >= 0.35 && v >= 0.25
  const isBrown = h >= 15 && h <= 35 && s >= 0.2 && v >= 0.15 && v <= 0.7
  return isOrange || isBrown
}

export class BallTracker {
  constructor() {
    this.positions = []
    this.lastSeenAt = 0
    this.releasePoint = null
    this.isInFlight = false
    this.cooldownUntil = 0
  }

  reset() {
    this.positions = []
    this.lastSeenAt = 0
    this.releasePoint = null
    this.isInFlight = false
    this.cooldownUntil = 0
  }

  detect(imageData, width, height) {
    const now = Date.now()
    if (now < this.cooldownUntil) {
      return { detected: false, inFlight: false, releasePoint: this.releasePoint }
    }

    let sumX = 0
    let sumY = 0
    let count = 0
    const step = 4

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4
        if (isBallColor(imageData[idx], imageData[idx + 1], imageData[idx + 2])) {
          sumX += x
          sumY += y
          count += 1
        }
      }
    }

    if (count < 3) {
      if (this.isInFlight && now - this.lastSeenAt > 400) {
        this.isInFlight = false
        this.cooldownUntil = now + 1200
        return {
          detected: false,
          inFlight: false,
          shotCompleted: true,
          releasePoint: this.releasePoint,
          trajectory: [...this.positions],
        }
      }
      return { detected: false, inFlight: this.isInFlight, releasePoint: this.releasePoint }
    }

    const cx = sumX / count / width
    const cy = sumY / count / height
    this.lastSeenAt = now

    if (!this.isInFlight) {
      this.releasePoint = { x: cx, y: cy }
      this.isInFlight = true
      this.positions = [{ x: cx, y: cy, t: now }]
    } else {
      this.positions.push({ x: cx, y: cy, t: now })
      if (this.positions.length > 40) this.positions.shift()
    }

    const velocity = this.getVelocity()
    return {
      detected: true,
      x: cx,
      y: cy,
      inFlight: true,
      releasePoint: this.releasePoint,
      velocity,
      trajectory: [...this.positions],
    }
  }

  getVelocity() {
    if (this.positions.length < 2) return 0
    const a = this.positions[this.positions.length - 2]
    const b = this.positions[this.positions.length - 1]
    const dt = Math.max(1, b.t - a.t)
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy) / dt * 1000
  }

  analyzeTrajectory(trajectory, rimRoi) {
    if (!trajectory || trajectory.length < 3) {
      return { reachedRim: false, confidence: 0, suggestedResult: null }
    }

    const rimY = rimRoi.cy
    const rimX = rimRoi.cx
    const rimR = rimRoi.radius

    const nearRim = trajectory.some((p) => {
      const dx = p.x - rimX
      const dy = p.y - rimY
      return Math.sqrt(dx * dx + dy * dy) < rimR * 2.5
    })

    const ascending = trajectory.slice(-5).every((p, i, arr) => i === 0 || p.y <= arr[i - 1].y + 0.02)
    const descending = trajectory.slice(-3).every((p, i, arr) => i === 0 || p.y >= arr[i - 1].y - 0.02)

    const reachedRim = nearRim && (ascending || descending)
    const confidence = reachedRim ? Math.min(0.9, 0.45 + trajectory.length * 0.03) : 0

    return {
      reachedRim,
      confidence,
      suggestedResult: reachedRim ? 'make' : null,
    }
  }
}