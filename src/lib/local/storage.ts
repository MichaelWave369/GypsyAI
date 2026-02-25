import { DrawnCard } from '@/types';

export interface BirthProfile { id: string; name: string; date: string; time: string; place: string; lat?: string; lon?: string; timezone?: string; isDefault?: boolean; }
export interface TarotSession { id: string; spread: string; question?: string; drawn: DrawnCard[]; interpretation: string; hermeticProfile: string; createdAt: string; }
export interface GeneKeysSession { id: string; name?: string; date: string; time: string; guideMode: 'contemplation'|'direct'; profile: unknown; reading: string; createdAt: string; }

const profilesKey = 'gypsy-ai-profiles';
const sessionsKey = 'gypsy-ai-tarot-sessions';
const gkKey = 'gypsy-ai-genekeys-sessions';

export const loadProfiles = (): BirthProfile[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(profilesKey) ?? '[]'));
export const saveProfiles = (profiles: BirthProfile[]) => { if (typeof window !== 'undefined') localStorage.setItem(profilesKey, JSON.stringify(profiles)); };
export const loadTarotSessions = (): TarotSession[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(sessionsKey) ?? '[]'));
export const saveTarotSessions = (sessions: TarotSession[]) => { if (typeof window !== 'undefined') localStorage.setItem(sessionsKey, JSON.stringify(sessions)); };
export const loadGeneKeysSessions = (): GeneKeysSession[] => (typeof window === 'undefined' ? [] : JSON.parse(localStorage.getItem(gkKey) ?? '[]'));
export const saveGeneKeysSessions = (sessions: GeneKeysSession[]) => { if (typeof window !== 'undefined') localStorage.setItem(gkKey, JSON.stringify(sessions)); };
export const markDefaultProfile = (profiles: BirthProfile[], id: string) => profiles.map((p) => ({ ...p, isDefault: p.id === id }));
