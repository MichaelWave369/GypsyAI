import { dbGet, dbSet } from '@/lib/local/db';
import { TiekatOracleArtifact, normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { buildSacredGeometryState } from '@/lib/tiekat/sacredGeometry';

export type TiekatRitualDeckExportVersion = 'TIEKAT-ritual-deck-v1';
export const TIEKAT_RITUAL_DECK_ROW_VERSION = 1 as const;
const MAX_RITUAL_DECKS = 60;

export interface TiekatRitualDeckFilterState {
  mode: string | 'all';
  scoringVersion: string | 'all';
  timeWindow: 'all' | 'recent_7' | 'recent_30';
}

export interface TiekatRitualCard {
  id: string;
  artifactId: string;
  timestamp: string;
  sessionMode: {
    key: TiekatOracleArtifact['sessionMode']['key'];
    label: string;
  };
  oracleHeadline: string;
  responseSummary: string;
  gravity: {
    status: TiekatOracleArtifact['gravity']['status'];
    informationIntegral: number;
    deltaGPredicted: number;
    scoringVersion: string;
  };
  sacredGeometry: {
    glyph: string;
  };
  v54: {
    specVersion: string;
    scoringVersion: string;
    sourceMode: string;
  };
  v55FramingEnabled: boolean;
  footer: string;
  exportVersion: TiekatRitualDeckExportVersion;
}

export interface TiekatRitualDeck {
  id: string;
  createdAt: string;
  title: string;
  source: 'recent' | 'selected' | 'filtered';
  cardCount: number;
  cards: TiekatRitualCard[];
  filterState?: TiekatRitualDeckFilterState;
  footer: string;
  exportVersion: TiekatRitualDeckExportVersion;
}

export interface TiekatRitualDeckStoreEntry {
  rowVersion: typeof TIEKAT_RITUAL_DECK_ROW_VERSION;
  deck: TiekatRitualDeck;
}

export interface TiekatRitualDeckSummary {
  title: string;
  cardCount: number;
  modeKeys: string[];
  scoringVersions: string[];
  timeRange: {
    start: string;
    end: string;
  } | null;
  footer: string;
}

export interface TiekatRitualDeckFilterOptions {
  modes: string[];
  scoringVersions: string[];
  timeWindows: TiekatRitualDeckFilterState['timeWindow'][];
}

export const RITUAL_EXPORT_FOOTER = 'Modeled local oracle artifact. Theoretical field interpretation only — not a physical measurement.';

export function normalizeRitualDeckFilterState(value?: Partial<TiekatRitualDeckFilterState>): TiekatRitualDeckFilterState {
  return {
    mode: value?.mode || 'all',
    scoringVersion: value?.scoringVersion || 'all',
    timeWindow: value?.timeWindow || 'all'
  };
}

function normalizeRitualCard(value: Partial<TiekatRitualCard>): TiekatRitualCard {
  return {
    id: value.id || `ritual-card:${value.artifactId || 'unknown'}`,
    artifactId: value.artifactId || 'unknown-artifact',
    timestamp: value.timestamp || new Date().toISOString(),
    sessionMode: {
      key: (value.sessionMode?.key || 'open_reflection') as TiekatRitualCard['sessionMode']['key'],
      label: value.sessionMode?.label || 'Open Reflection'
    },
    oracleHeadline: value.oracleHeadline || 'Modeled oracle ritual card',
    responseSummary: value.responseSummary || '',
    gravity: {
      status: value.gravity?.status || 'theoretical',
      informationIntegral: Number(value.gravity?.informationIntegral ?? 0),
      deltaGPredicted: Number(value.gravity?.deltaGPredicted ?? 0),
      scoringVersion: value.gravity?.scoringVersion || 'v54-gb-v1'
    },
    sacredGeometry: {
      glyph: value.sacredGeometry?.glyph || 'metatron_grid'
    },
    v54: {
      specVersion: value.v54?.specVersion || 'TIEKAT-v54',
      scoringVersion: value.v54?.scoringVersion || 'v54-gb-v1',
      sourceMode: value.v54?.sourceMode || 'modeled'
    },
    v55FramingEnabled: Boolean(value.v55FramingEnabled),
    footer: value.footer || RITUAL_EXPORT_FOOTER,
    exportVersion: 'TIEKAT-ritual-deck-v1'
  };
}

export function normalizeRitualDeck(value: Partial<TiekatRitualDeck>): TiekatRitualDeck {
  const cards = Array.isArray(value.cards) ? value.cards.map((card) => normalizeRitualCard(card)) : [];
  return {
    id: value.id || `ritual-deck:${value.createdAt || new Date().toISOString()}`,
    createdAt: value.createdAt || new Date().toISOString(),
    title: value.title || `Ritual Deck (${cards.length} cards)`,
    source: value.source || 'selected',
    cardCount: cards.length,
    cards,
    filterState: normalizeRitualDeckFilterState(value.filterState),
    footer: value.footer || RITUAL_EXPORT_FOOTER,
    exportVersion: 'TIEKAT-ritual-deck-v1'
  };
}

export function getRitualDeckFilterOptions(artifacts: TiekatOracleArtifact[]): TiekatRitualDeckFilterOptions {
  return {
    modes: Array.from(new Set(artifacts.map((artifact) => artifact.sessionMode.key))).sort(),
    scoringVersions: Array.from(new Set(artifacts.map((artifact) => artifact.gravity.scoringVersion))).sort(),
    timeWindows: ['all', 'recent_7', 'recent_30']
  };
}

export function filterArtifactsForDeck(artifacts: TiekatOracleArtifact[], filters: TiekatRitualDeckFilterState, now = new Date()): TiekatOracleArtifact[] {
  const normalized = artifacts.map((artifact) => normalizeOracleArtifact(artifact));
  const modeFiltered = filters.mode === 'all' ? normalized : normalized.filter((artifact) => artifact.sessionMode.key === filters.mode);
  const versionFiltered = filters.scoringVersion === 'all' ? modeFiltered : modeFiltered.filter((artifact) => artifact.gravity.scoringVersion === filters.scoringVersion);
  const cutoffDays = filters.timeWindow === 'recent_7' ? 7 : filters.timeWindow === 'recent_30' ? 30 : 0;
  if (!cutoffDays) return versionFiltered;
  const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
  return versionFiltered.filter((artifact) => new Date(artifact.timestamp) >= cutoff);
}

export function buildRitualCardFromArtifact(artifact: TiekatOracleArtifact): TiekatRitualCard {
  const normalized = normalizeOracleArtifact(artifact);
  const geometry = buildSacredGeometryState({
    gravity: {
      status: normalized.gravity.status,
      informationIntegral: normalized.gravity.informationIntegral,
      deltaGPredicted: normalized.gravity.deltaGPredicted
    },
    trend: normalized.trend || 'stable',
    versionSummary: { state: normalized.versionSummaryState || 'insufficient_data' },
    sessionMode: normalized.sessionMode.key,
    activeModules: normalized.activeModules,
    route: normalized.route,
    mode: normalized.mode
  });

  return {
    id: `ritual-card:${normalized.id}`,
    artifactId: normalized.id,
    timestamp: normalized.timestamp,
    sessionMode: {
      key: normalized.sessionMode.key,
      label: normalized.sessionMode.label
    },
    oracleHeadline: normalized.summary.oracleHeadline || 'Modeled oracle ritual card',
    responseSummary: normalized.summary.responseSummary,
    gravity: {
      status: normalized.gravity.status,
      informationIntegral: Number(normalized.gravity.informationIntegral.toFixed(6)),
      deltaGPredicted: Number(normalized.gravity.deltaGPredicted.toExponential(6)),
      scoringVersion: normalized.gravity.scoringVersion
    },
    sacredGeometry: {
      glyph: geometry.glyph
    },
    v54: {
      specVersion: normalized.v54.specVersion,
      scoringVersion: normalized.v54.scoringVersion,
      sourceMode: normalized.v54.sourceMode
    },
    v55FramingEnabled: Boolean(normalized.v55?.enabled),
    footer: RITUAL_EXPORT_FOOTER,
    exportVersion: 'TIEKAT-ritual-deck-v1'
  };
}

export function buildRitualDeck(args: {
  id?: string;
  title?: string;
  createdAt?: string;
  source?: TiekatRitualDeck['source'];
  filterState?: TiekatRitualDeckFilterState;
  artifacts: TiekatOracleArtifact[];
}): TiekatRitualDeck {
  const createdAt = args.createdAt || new Date().toISOString();
  const source = args.source || 'selected';
  const cards = args.artifacts
    .map((artifact) => normalizeOracleArtifact(artifact))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((artifact) => buildRitualCardFromArtifact(artifact));

  return normalizeRitualDeck({
    id: args.id || `ritual-deck:${createdAt}`,
    createdAt,
    title: args.title || `Ritual Deck (${cards.length} cards)`,
    source,
    cardCount: cards.length,
    cards,
    filterState: normalizeRitualDeckFilterState(args.filterState),
    footer: RITUAL_EXPORT_FOOTER,
    exportVersion: 'TIEKAT-ritual-deck-v1'
  });
}

export function buildFilteredRitualDeck(args: {
  artifacts: TiekatOracleArtifact[];
  filters: TiekatRitualDeckFilterState;
  title?: string;
}) {
  const filtered = filterArtifactsForDeck(args.artifacts, args.filters)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return buildRitualDeck({
    title: args.title || `Filtered Ritual Deck (${filtered.length})`,
    source: 'filtered',
    filterState: args.filters,
    artifacts: filtered
  });
}

export function buildRecentRitualDeck(artifacts: TiekatOracleArtifact[], limit = 5) {
  const selected = [...artifacts]
    .map((artifact) => normalizeOracleArtifact(artifact))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, Math.max(1, limit));

  return buildRitualDeck({
    title: `Recent Ritual Deck (${selected.length})`,
    source: 'recent',
    artifacts: selected
  });
}

export function summarizeRitualDeck(deck: TiekatRitualDeck): TiekatRitualDeckSummary {
  const sorted = [...deck.cards].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return {
    title: deck.title,
    cardCount: deck.cards.length,
    modeKeys: Array.from(new Set(deck.cards.map((card) => card.sessionMode.key))).sort(),
    scoringVersions: Array.from(new Set(deck.cards.map((card) => card.gravity.scoringVersion))).sort(),
    timeRange: sorted[0]
      ? {
        start: sorted[0].timestamp,
        end: sorted[sorted.length - 1].timestamp
      }
      : null,
    footer: deck.footer
  };
}

export async function loadRitualDecks(): Promise<TiekatRitualDeckStoreEntry[]> {
  const rows = await dbGet('ritualDecks');
  const parsed = Array.isArray(rows) ? rows : [];
  return parsed.map((row) => ({
    rowVersion: TIEKAT_RITUAL_DECK_ROW_VERSION,
    deck: normalizeRitualDeck((row as Partial<TiekatRitualDeckStoreEntry>).deck || {})
  }));
}

export async function saveRitualDecks(entries: TiekatRitualDeckStoreEntry[]) {
  const normalized = entries.slice(0, MAX_RITUAL_DECKS).map((entry) => ({
    rowVersion: TIEKAT_RITUAL_DECK_ROW_VERSION,
    deck: normalizeRitualDeck(entry.deck)
  }));
  await dbSet('ritualDecks', normalized);
}

export async function appendRitualDeck(args: { enabled: boolean; deck: TiekatRitualDeck }) {
  if (!args.enabled) return;
  const rows = await loadRitualDecks();
  await saveRitualDecks([{ rowVersion: TIEKAT_RITUAL_DECK_ROW_VERSION, deck: normalizeRitualDeck(args.deck) }, ...rows.filter((row) => row.deck.id !== args.deck.id)]);
}

export async function getRecentRitualDecks(limit = 8): Promise<TiekatRitualDeck[]> {
  const rows = await loadRitualDecks();
  return rows
    .map((row) => row.deck)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.max(1, limit));
}

export async function deleteRitualDeck(id: string) {
  const rows = await loadRitualDecks();
  await saveRitualDecks(rows.filter((row) => row.deck.id !== id));
}

export function exportRitualCardJson(card: TiekatRitualCard) {
  return JSON.stringify(normalizeRitualCard(card), null, 2);
}

export function exportRitualDeckJson(deck: TiekatRitualDeck) {
  return JSON.stringify(normalizeRitualDeck(deck), null, 2);
}

export function exportRitualDeckMarkdown(deck: TiekatRitualDeck) {
  const normalized = normalizeRitualDeck(deck);
  const summary = summarizeRitualDeck(normalized);
  const lines = [
    `# ${normalized.title}`,
    '',
    `- Export version: ${normalized.exportVersion}`,
    `- Cards: ${summary.cardCount}`,
    `- Modes: ${summary.modeKeys.join(', ') || 'none'}`,
    `- Scoring versions: ${summary.scoringVersions.join(', ') || 'none'}`,
    `- Time range: ${summary.timeRange ? `${summary.timeRange.start} → ${summary.timeRange.end}` : 'none'}`,
    '',
    '## Cards',
    ...normalized.cards.map((card) => `- **${card.oracleHeadline}** (${card.sessionMode.label}) • glyph: ${card.sacredGeometry.glyph} • I=${card.gravity.informationIntegral.toFixed(3)} • Δg=${card.gravity.deltaGPredicted.toExponential(2)}`),
    '',
    `_${normalized.footer}_`
  ];
  return lines.join('\n');
}

export function importRitualDeckJson(text: string): TiekatRitualDeck {
  const parsed = JSON.parse(text) as Partial<TiekatRitualDeck>;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid ritual deck payload');
  if (parsed.exportVersion && parsed.exportVersion !== 'TIEKAT-ritual-deck-v1') throw new Error('Unsupported ritual deck export version');
  if (parsed.cards && !Array.isArray(parsed.cards)) throw new Error('Invalid ritual deck cards');
  return normalizeRitualDeck(parsed);
}
