import { DrawnCard } from '@/types';
import { dbGet, dbSet } from '@/lib/local/db';

export interface BirthProfile { id: string; name: string; date: string; time: string; place: string; lat?: string; lon?: string; timezone?: string; isDefault?: boolean; }
export interface TarotSession { id: string; spread: string; question?: string; drawn: DrawnCard[]; interpretation: string; hermeticProfile: string; createdAt: string; }
export interface GeneKeysSession { id: string; name?: string; date: string; time: string; guideMode: 'contemplation'|'direct'; profile: unknown; reading: string; createdAt: string; }

const profilesKey = 'gypsy-ai-profiles';
const sessionsKey = 'gypsy-ai-tarot-sessions';
const gkKey = 'gypsy-ai-genekeys-sessions';

export const loadProfiles = (): BirthProfile[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(profilesKey) ?? '[]'));
export const saveProfiles = (profiles: BirthProfile[]) => {
  if (typeof window !== 'undefined') localStorage.setItem(profilesKey, JSON.stringify(profiles));
  dbSet('profiles', profiles).catch(() => null);
};
export const loadTarotSessions = (): TarotSession[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(sessionsKey) ?? '[]'));
export const saveTarotSessions = (sessions: TarotSession[]) => {
  if (typeof window !== 'undefined') localStorage.setItem(sessionsKey, JSON.stringify(sessions));
  dbSet('tarotSessions', sessions).catch(() => null);
};
export const loadGeneKeysSessions = (): GeneKeysSession[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(gkKey) ?? '[]'));
export const saveGeneKeysSessions = (sessions: GeneKeysSession[]) => {
  if (typeof window !== 'undefined') localStorage.setItem(gkKey, JSON.stringify(sessions));
  dbSet('geneKeysSessions', sessions).catch(() => null);
};
export const markDefaultProfile = (profiles: BirthProfile[], id: string) => profiles.map((p) => ({ ...p, isDefault: p.id === id }));

export async function hydrateLocalFromDb() {
  const profiles = await dbGet('profiles');
  const tarot = await dbGet('tarotSessions');
  const gk = await dbGet('geneKeysSessions');
  if (typeof window !== 'undefined') {
    if (profiles) localStorage.setItem(profilesKey, JSON.stringify(profiles));
    if (tarot) localStorage.setItem(sessionsKey, JSON.stringify(tarot));
    if (gk) localStorage.setItem(gkKey, JSON.stringify(gk));
  }
}
