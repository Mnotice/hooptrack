import type { Session } from '@/lib/types';

const STORAGE_KEY = 'hooptrack_sessions';

export function loadSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as Session[];
  } catch {
    console.error('Error loading sessions');
    return [];
  }
}

export function saveSessions(sessions: Session[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
