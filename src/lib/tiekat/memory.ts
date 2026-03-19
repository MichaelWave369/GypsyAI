import { TiekatMemoryEntry } from '@/lib/tiekat/schema';

const TIEKAT_MEMORY_KEY = 'gypsy-ai-tiekat-memory';

export function loadTiekatMemory(): TiekatMemoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(TIEKAT_MEMORY_KEY) ?? '[]') as TiekatMemoryEntry[];
  } catch {
    return [];
  }
}

export function saveTiekatMemory(entries: TiekatMemoryEntry[], enabled: boolean) {
  if (typeof window === 'undefined') return;
  if (!enabled) {
    window.localStorage.removeItem(TIEKAT_MEMORY_KEY);
    return;
  }
  window.localStorage.setItem(TIEKAT_MEMORY_KEY, JSON.stringify(entries.slice(0, 50)));
}

export function createTiekatMemoryEntry(sessionId: string, summary: string, anchors: string[], modules: TiekatMemoryEntry['modules']): TiekatMemoryEntry {
  return {
    key: `${sessionId}:${anchors.join('|').slice(0, 48)}`,
    summary: summary.slice(0, 220),
    anchors: anchors.slice(0, 12),
    modules,
    updatedAt: new Date().toISOString()
  };
}

export function selectRelevantMemory(entries: TiekatMemoryEntry[], message: string): TiekatMemoryEntry[] {
  const tokens = message.toLowerCase().split(/\W+/).filter(Boolean);
  const scored = entries
    .map((entry) => ({
      entry,
      score: entry.anchors.reduce((acc, anchor) => (tokens.some((token) => anchor.toLowerCase().includes(token)) ? acc + 1 : acc), 0)
    }))
    .sort((a, b) => b.score - a.score || b.entry.updatedAt.localeCompare(a.entry.updatedAt));

  return scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.entry);
}
