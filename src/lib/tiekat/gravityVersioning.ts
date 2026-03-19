import { TiekatGravityHistoryEntry, TiekatModuleKey } from '@/lib/tiekat/schema';

export const TIEKAT_GRAVITY_SCORING_VERSION = 'v1';
export const TIEKAT_GRAVITY_HISTORY_ROW_VERSION = 1 as const;

function toNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toModules(value: unknown): TiekatModuleKey[] {
  if (!Array.isArray(value)) return ['assistant'];
  const allowed: TiekatModuleKey[] = ['assistant', 'tarot', 'astrology', 'genekeys', 'ancestry'];
  return value.filter((v): v is TiekatModuleKey => typeof v === 'string' && allowed.includes(v as TiekatModuleKey));
}

export function normalizeGravityHistoryEntry(row: unknown): TiekatGravityHistoryEntry | null {
  if (!row || typeof row !== 'object') return null;
  const source = row as Record<string, unknown>;
  const sessionId = typeof source.sessionId === 'string' ? source.sessionId : 'unknown-session';
  const timestamp = typeof source.timestamp === 'string' ? source.timestamp : new Date(0).toISOString();

  return {
    id: typeof source.id === 'string' ? source.id : `${sessionId}:${timestamp}`,
    sessionId,
    timestamp,
    status: source.status === 'disabled' || source.status === 'simulated' || source.status === 'theoretical' ? source.status : 'theoretical',
    scoringVersion: typeof source.scoringVersion === 'string' ? source.scoringVersion : TIEKAT_GRAVITY_SCORING_VERSION,
    informationIntegral: toNumber(source.informationIntegral),
    deltaGPredicted: toNumber(source.deltaGPredicted),
    deltaGBand:
      source.deltaGBand && typeof source.deltaGBand === 'object'
        ? {
            min: toNumber((source.deltaGBand as Record<string, unknown>).min),
            max: toNumber((source.deltaGBand as Record<string, unknown>).max)
          }
        : { min: 0, max: 0 },
    contributingModules: toModules(source.contributingModules),
    route: typeof source.route === 'string' ? source.route : 'assistant_synthesis',
    mode: source.mode === 'single_module' || source.mode === 'blended' || source.mode === 'assistant_synthesis' ? source.mode : 'assistant_synthesis',
    sourceMode: 'modeled_internal_signal',
    rowVersion: 1
  };
}

export function normalizeGravityHistory(rows: unknown): TiekatGravityHistoryEntry[] {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeGravityHistoryEntry).filter((row): row is TiekatGravityHistoryEntry => Boolean(row));
}
