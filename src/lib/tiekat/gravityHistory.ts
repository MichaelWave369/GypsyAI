import { dbGet, dbSet } from '@/lib/local/db';
import { TiekatGravityBootstrapResult, TiekatGravityHistoryEntry, TiekatReflectionMode } from '@/lib/tiekat/schema';
import { normalizeGravityHistory, TIEKAT_GRAVITY_SCORING_VERSION, TIEKAT_GRAVITY_HISTORY_ROW_VERSION } from '@/lib/tiekat/gravityVersioning';

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
    rowVersion: TIEKAT_GRAVITY_HISTORY_ROW_VERSION
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
