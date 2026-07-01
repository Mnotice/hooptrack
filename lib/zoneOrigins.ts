import type { ZoneId } from '@/lib/types';

export const ZONE_ORIGINS = {
  top: { x: 50, y: 11 },
  'left-wing': { x: 17, y: 32 },
  'right-wing': { x: 83, y: 32 },
  'left-corner': { x: 17, y: 83 },
  'right-corner': { x: 83, y: 83 },
}

export const RIM_TARGET = { x: 50, y: 86 }

export function getMissVariant(zone: ZoneId) {
  const origin = ZONE_ORIGINS[zone] || ZONE_ORIGINS.top
  const airballChance = origin.y < 40 ? 0.55 : 0.4
  const isAirball = Math.random() < airballChance

  if (isAirball) {
    const drift = origin.x < 50 ? -22 : origin.x > 50 ? 22 : (Math.random() < 0.5 ? -18 : 18)
    return { type: 'airball', drift }
  }

  const reboundX = origin.x < 50 ? 72 : 28
  return { type: 'rebound', reboundX }
}