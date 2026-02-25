import { DrawnCard } from '@/types';

export interface BirthProfile {
  id: string;
  name: string;
  date: string;
  time: string;
  place: string;
  lat?: string;
  lon?: string;
  timezone?: string;
  isDefault?: boolean;
}

export interface TarotSession {
  id: string;
  spread: string;
  question?: string;
  drawn: DrawnCard[];
  interpretation: string;
  hermeticProfile: string;
  createdAt: string;
}

const profilesKey = 'gypsy-ai-profiles';
const sessionsKey = 'gypsy-ai-tarot-sessions';

export function loadProfiles(): BirthProfile[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(profilesKey) ?? '[]');
}
export function saveProfiles(profiles: BirthProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(profilesKey, JSON.stringify(profiles));
}
export function loadTarotSessions(): TarotSession[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(sessionsKey) ?? '[]');
}
export function saveTarotSessions(sessions: TarotSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(sessionsKey, JSON.stringify(sessions));
}

export function markDefaultProfile(profiles: BirthProfile[], id: string) {
  return profiles.map((p) => ({ ...p, isDefault: p.id === id }));
}
