import { loadProfiles, loadTarotSessions, loadGeneKeysSessions } from '@/lib/local/storage';
import { loadSettings } from '@/lib/local/settings';
import { extractAncestryPatterns } from '@/lib/ancestry/patterns';
import { AncestryData } from '@/lib/ancestry/types';

export interface ContextCapsule {
  profile?: unknown;
  lastTarot?: unknown;
  lastGeneKeys?: unknown;
  ancestryPatterns?: unknown;
  redaction: { includeNames: boolean; ancestryAllowed: boolean };
}

export function buildContextCapsule(ancestry: AncestryData | null): ContextCapsule {
  const s = loadSettings();
  const profile = loadProfiles().find((p) => p.isDefault) ?? loadProfiles()[0];
  const lastTarot = loadTarotSessions()[0];
  const lastGeneKeys = loadGeneKeysSessions()[0];
  const ancestryPatterns = s.allowAncestryAi && ancestry ? extractAncestryPatterns(ancestry) : undefined;
  return {
    profile: s.useBirthProfileInAssistant ? profile : undefined,
    lastTarot: s.useSessionsInAssistant ? lastTarot : undefined,
    lastGeneKeys: s.useSessionsInAssistant ? lastGeneKeys : undefined,
    ancestryPatterns,
    redaction: { includeNames: s.includeNamesInAiContext, ancestryAllowed: s.allowAncestryAi }
  };
}
