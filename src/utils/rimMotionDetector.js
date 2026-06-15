const SAMPLE_SIZE = 48

function sampleRoi(imageData, width, height, roi) {
  const cx = Math.floor(roi.cx * width)
  const cy = Math.floor(roi.cy * height)
  const radius = Math.max(8, Math.floor(roi.radius * Math.min(width, height)))

  const pixels = []
  for (let y = cy - radius; y <= cy + radius; y += Math.max(1, Math.floor((radius * 2) / SAMPLE_SIZE))) {
    for (let x = cx - radius; x <= cx + radius; x += Math.max(1, Math.floor((radius * 2) / SAMPLE_SIZE))) {
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy > radius * radius) continue
      if (x < 0 || y < 0 || x >= width || y >= height) continue
      const idx = (y * width + x) * 4
      pixels.push(imageData[idx], imageData[idx + 1], imageData[idx + 2])
    }
  }
  return pixels
}

function motionScore(prevPixels, currPixels) {
  const len = Math.min(prevPixels.length, currPixels.length)
  if (len === 0) return 0

  let total = 0
  for (let i = 0; i < len; i += 3) {
    total += Math.abs(currPixels[i] - prevPixels[i])
    total += Math.abs(currPixels[i + 1] - prevPixels[i + 1])
    total += Math.abs(currPixels[i + 2] - prevPixels[i + 2])
  }
  return total / (len / 3)
}

export class RimMotionDetector {
  constructor({ threshold = 18, cooldownMs = 1800 } = {}) {
    this.threshold = threshold
    this.cooldownMs = cooldownMs
    this.prevPixels = null
    this.baseline = 0
    this.lastEventAt = 0
    this.calibrationFrames = 0
  }

  reset() {
    this.prevPixels = null
    this.baseline = 0
    this.lastEventAt = 0
    this.calibrationFrames = 0
  }

  analyze(imageData, width, height, roi) {
    const currPixels = sampleRoi(imageData, width, height, roi)
    if (!this.prevPixels) {
      this.prevPixels = currPixels
      return { motionScore: 0, isShotEvent: false, confidence: 0 }
    }

    const score = motionScore(this.prevPixels, currPixels)
    this.prevPixels = currPixels

    if (this.calibrationFrames < 30) {
      this.baseline = (this.baseline * this.calibrationFrames + score) / (this.calibrationFrames + 1)
      this.calibrationFrames += 1
      return { motionScore: score, isShotEvent: false, confidence: 0 }
    }

    const delta = Math.max(0, score - this.baseline)
    const now = Date.now()
    const isCooldown = now - this.lastEventAt < this.cooldownMs
    const isShotEvent = !isCooldown && delta > this.threshold

    if (isShotEvent) {
      this.lastEventAt = now
      this.baseline = this.baseline * 0.7 + score * 0.3
    } else {
      this.baseline = this.baseline * 0.95 + score * 0.05
    }

    const confidence = Math.min(0.95, Math.max(0, (delta - this.threshold * 0.5) / (this.threshold * 2)))

    return {
      motionScore: score,
      delta,
      isShotEvent,
      confidence: isShotEvent ? confidence : 0,
      suggestedResult: isShotEvent ? 'make' : null,
    }
  }
}