export type ShotResult = 'make' | 'miss';
export type SessionType = 'shooting' | 'dribbling';
export type ShotSource = 'manual' | 'voice' | 'camera';
export type ZoneId = 'top' | 'left-wing' | 'right-wing' | 'left-corner' | 'right-corner';
export type TabId = 'workout' | 'drills' | 'progress' | 'history';
export type DrillCategory = 'fundamentals' | 'handles' | 'athletic' | 'advanced';

export interface Shot {
  result: ShotResult;
  zone: ZoneId | null;
  timestamp: number;
  source?: ShotSource;
  confidence?: number | null;
  confirmed?: boolean;
  zoneSource?: string | null;
}

export interface ShootingSession {
  id: number;
  startTime: number;
  shots: Shot[];
  type: 'shooting';
}

export interface DribbleSession {
  id: number;
  startTime: number;
  type: 'dribbling';
  drillName: string;
  duration: number;
  repsCompleted: number;
  rating: number;
  timestamp: number;
}

export type Session = ShootingSession | DribbleSession;

export interface ShotAnimation {
  result: ShotResult;
  zone: ZoneId;
  key: number;
}

export interface SessionStats {
  makes: number;
  misses: number;
  total: number;
  percentage: number;
}
