import { TiekatOracleArtifact, normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { buildSacredGeometryState } from '@/lib/tiekat/sacredGeometry';

export type TiekatRitualDeckExportVersion = 'TIEKAT-ritual-deck-v1';

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
  footer: string;
  exportVersion: TiekatRitualDeckExportVersion;
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

export const RITUAL_EXPORT_FOOTER = 'Modeled local oracle artifact. Theoretical field interpretation only — not a physical measurement.';

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
  artifacts: TiekatOracleArtifact[];
}): TiekatRitualDeck {
  const createdAt = args.createdAt || new Date().toISOString();
  const source = args.source || 'selected';
  const cards = args.artifacts
    .map((artifact) => normalizeOracleArtifact(artifact))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((artifact) => buildRitualCardFromArtifact(artifact));

  return {
    id: args.id || `ritual-deck:${createdAt}`,
    createdAt,
    title: args.title || `Ritual Deck (${cards.length} cards)`,
    source,
    cardCount: cards.length,
    cards,
    footer: RITUAL_EXPORT_FOOTER,
    exportVersion: 'TIEKAT-ritual-deck-v1'
  };
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

export function exportRitualCardJson(card: TiekatRitualCard) {
  return JSON.stringify(card, null, 2);
}

export function exportRitualDeckJson(deck: TiekatRitualDeck) {
  return JSON.stringify(deck, null, 2);
}

export function exportRitualDeckMarkdown(deck: TiekatRitualDeck) {
  const summary = summarizeRitualDeck(deck);
  const lines = [
    `# ${deck.title}`,
    '',
    `- Export version: ${deck.exportVersion}`,
    `- Cards: ${summary.cardCount}`,
    `- Modes: ${summary.modeKeys.join(', ') || 'none'}`,
    `- Scoring versions: ${summary.scoringVersions.join(', ') || 'none'}`,
    `- Time range: ${summary.timeRange ? `${summary.timeRange.start} → ${summary.timeRange.end}` : 'none'}`,
    '',
    '## Cards',
    ...deck.cards.map((card) => `- **${card.oracleHeadline}** (${card.sessionMode.label}) • glyph: ${card.sacredGeometry.glyph} • I=${card.gravity.informationIntegral.toFixed(3)} • Δg=${card.gravity.deltaGPredicted.toExponential(2)}`),
    '',
    `_${deck.footer}_`
  ];
  return lines.join('\n');
}
