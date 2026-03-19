import { dbGet, dbSet } from '@/lib/local/db';
import { TiekatGravityBootstrapResult, TiekatGravityHistoryEntry, TiekatReflectionMode } from '@/lib/tiekat/schema';
import { normalizeGravityHistory, TIEKAT_GRAVITY_SCORING_VERSION, TIEKAT_GRAVITY_HISTORY_ROW_VERSION } from '@/lib/tiekat/gravityVersioning';
import { TIEKAT_V54_SPEC_VERSION } from '@/lib/tiekat/v54';

const MAX_HISTORY_ROWS = 250;

export async function loadGravityHistory(): Promise<TiekatGravityHistoryEntry[]> {
  const rows = await dbGet('gravityHistory');
  return normalizeGravityHistory(rows);
}

export async function saveGravityHistory(rows: TiekatGravityHistoryEntry[]) {
  await dbSet('gravityHistory', rows.slice(0, MAX_HISTORY_ROWS));
}

export async function appendGravityHistoryEntry(args: {
  enabled: boolean;
  sessionId: string;
  route: string;
  mode: TiekatReflectionMode;
  gravity: TiekatGravityBootstrapResult;
}) {
  if (!args.enabled) return;

  const entry: TiekatGravityHistoryEntry = {
    id: `${args.sessionId}:${new Date().toISOString()}`,
    sessionId: args.sessionId,
    timestamp: new Date().toISOString(),
    status: args.gravity.status,
    scoringVersion: args.gravity.scoringVersion || TIEKAT_GRAVITY_SCORING_VERSION,
    informationIntegral: args.gravity.informationIntegral,
    deltaGPredicted: args.gravity.deltaGPredicted,
    deltaGBand: args.gravity.deltaGBand,
    contributingModules: args.gravity.contributingModules,
    route: args.route,
    mode: args.mode,
    sourceMode: 'modeled_internal_signal',
    rowVersion: TIEKAT_GRAVITY_HISTORY_ROW_VERSION,
    canonicalSpecVersion: args.gravity.canonicalSpecVersion || TIEKAT_V54_SPEC_VERSION
  };

  const previous = await loadGravityHistory();
  await saveGravityHistory([entry, ...previous]);
}

export async function getRecentGravityHistory(limit = 5): Promise<TiekatGravityHistoryEntry[]> {
  const rows = await loadGravityHistory();
  return rows
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, Math.max(1, limit));
}

export function groupGravityHistoryByScoringVersion(history: TiekatGravityHistoryEntry[]) {
  return history.reduce<Record<string, TiekatGravityHistoryEntry[]>>((acc, row) => {
    if (!acc[row.scoringVersion]) acc[row.scoringVersion] = [];
    acc[row.scoringVersion].push(row);
    return acc;
  }, {});
}

export function summarizeGravityTrend(history: TiekatGravityHistoryEntry[]) {
  if (history.length < 2) return { trend: 'stable' as const, delta: 0 };
  const sorted = [...history].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const first = sorted[0].deltaGPredicted;
  const last = sorted[sorted.length - 1].deltaGPredicted;
  const delta = Number((last - first).toExponential(4));
  if (delta > 0) return { trend: 'rising' as const, delta };
  if (delta < 0) return { trend: 'falling' as const, delta };
  return { trend: 'stable' as const, delta: 0 };
}

export function compareGravitySnapshots(a: TiekatGravityHistoryEntry, b: TiekatGravityHistoryEntry) {
  return {
    sameScoringVersion: a.scoringVersion === b.scoringVersion,
    deltaInformationIntegral: Number((b.informationIntegral - a.informationIntegral).toExponential(4)),
    deltaDeltaGPredicted: Number((b.deltaGPredicted - a.deltaGPredicted).toExponential(4))
  };
}

export function compareGravityVersions(history: TiekatGravityHistoryEntry[]) {
  const grouped = groupGravityHistoryByScoringVersion(history);
  return Object.entries(grouped).map(([version, rows]) => ({
    version,
    count: rows.length,
    avgInformationIntegral: Number((rows.reduce((sum, row) => sum + row.informationIntegral, 0) / rows.length).toFixed(6)),
    avgDeltaGPredicted: Number((rows.reduce((sum, row) => sum + row.deltaGPredicted, 0) / rows.length).toExponential(6))
  }));
}

type GravityVersionDriftSummary =
  | { comparable: false; message: string }
  | {
    comparable: true;
    from: string;
    to: string;
    informationIntegralDrift: number;
    deltaGDrift: number;
  };

export function summarizeGravityVersionDrift(history: TiekatGravityHistoryEntry[]): GravityVersionDriftSummary {
  const byVersion = compareGravityVersions(history);
  if (byVersion.length < 2) return { comparable: false, message: 'Only one scoring version present.' };
  const sorted = [...byVersion].sort((a, b) => a.version.localeCompare(b.version));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return {
    comparable: true,
    from: first.version,
    to: last.version,
    informationIntegralDrift: Number((last.avgInformationIntegral - first.avgInformationIntegral).toFixed(6)),
    deltaGDrift: Number((last.avgDeltaGPredicted - first.avgDeltaGPredicted).toExponential(6))
  };
}


export type GravityComparisonState = 'single_version' | 'mixed_versions' | 'drift_detected' | 'insufficient_data';

export interface GravityVersionComparisonSummary {
  state: GravityComparisonState;
  currentScoringVersion: string;
  versionCount: number;
  drift: {
    from: string;
    to: string;
    informationIntegralDrift: number;
    deltaGDrift: number;
  } | null;
}

export function buildVersionComparisonSummary(history: TiekatGravityHistoryEntry[], currentScoringVersion: string): GravityVersionComparisonSummary {
  const versionCount = Object.keys(groupGravityHistoryByScoringVersion(history)).length;
  if (history.length < 2) {
    return {
      state: 'insufficient_data' as GravityComparisonState,
      currentScoringVersion,
      versionCount,
      drift: null
    };
  }

  if (versionCount <= 1) {
    return {
      state: 'single_version' as GravityComparisonState,
      currentScoringVersion,
      versionCount,
      drift: null
    };
  }

  const rawDrift = summarizeGravityVersionDrift(history);
  if (!rawDrift.comparable) {
    return {
      state: 'mixed_versions' as GravityComparisonState,
      currentScoringVersion,
      versionCount,
      drift: null
    };
  }

  const normalizedDrift = rawDrift.comparable
    ? {
      from: rawDrift.from,
      to: rawDrift.to,
      informationIntegralDrift: rawDrift.informationIntegralDrift,
      deltaGDrift: rawDrift.deltaGDrift
    }
    : null;
  const driftDetected = normalizedDrift ? (Math.abs(normalizedDrift.informationIntegralDrift) > 0 || Math.abs(normalizedDrift.deltaGDrift) > 0) : false;
  return {
    state: (driftDetected ? 'drift_detected' : 'mixed_versions') as GravityComparisonState,
    currentScoringVersion,
    versionCount,
    drift: normalizedDrift
  };
}
