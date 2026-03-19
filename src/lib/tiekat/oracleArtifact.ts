import { dbGet, dbSet } from '@/lib/local/db';
import { TiekatGravityBootstrapResult, TiekatModuleKey, TiekatReflectionMode } from '@/lib/tiekat/schema';
import { OracleVersionSummary, TiekatOraclePresentation } from '@/lib/tiekat/oraclePresentation';
import { getDefaultSessionMode, getSessionModeConfig, TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';
import { getTiekatV54Metadata } from '@/lib/tiekat/v54';
import { getTiekatV55Metadata } from '@/lib/tiekat/v55';

export const TIEKAT_ORACLE_ARTIFACT_ROW_VERSION = 1 as const;
const MAX_ORACLE_ARTIFACTS = 150;

export interface TiekatOracleArtifactVersion {
  rowVersion: typeof TIEKAT_ORACLE_ARTIFACT_ROW_VERSION;
  artifactSpecVersion: 'TIEKAT-oracle-artifact-v2';
}

export interface TiekatOracleArtifactSummary {
  promptSummary: string;
  responseSummary: string;
  oracleHeadline?: string;
}

export interface TiekatOracleArtifact {
  id: string;
  sessionId: string;
  timestamp: string;
  route: string;
  mode: TiekatReflectionMode;
  sessionMode: {
    key: TiekatSessionModeKey;
    label: string;
    ritualFrame: string;
    allowV55Framing: boolean;
  };
  activeModules: TiekatModuleKey[];
  summary: TiekatOracleArtifactSummary;
  gravity: {
    status: TiekatGravityBootstrapResult['status'];
    informationIntegral: number;
    deltaGPredicted: number;
    scoringVersion: string;
    canonicalSpecVersion: string;
  };
  v54: {
    specVersion: string;
    scoringVersion: string;
    sourceMode: string;
  };
  v55?: {
    specVersion: string;
    enabled: boolean;
  };
  trend?: 'rising' | 'stable' | 'falling';
  versionSummaryState?: OracleVersionSummary['state'];
  consent: {
    memoryEnabled: boolean;
    includeNames: boolean;
    allowAncestry: boolean;
    hideLivingPersons: boolean;
  };
  version: TiekatOracleArtifactVersion;
}

export function summarizeArtifactText(text: string, includeNames: boolean, max = 180) {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  const withoutNames = includeNames ? collapsed : collapsed.replace(/\b[A-Z][a-z]{2,}\b/g, '[name]');
  const scrubbed = withoutNames
    .replace(/ancestor name/gi, '[redacted-ancestry]')
    .replace(/family tree/gi, '[redacted-ancestry]')
    .replace(/private lineage/gi, '[redacted-ancestry]');
  return scrubbed.slice(0, max);
}

export function buildOracleArtifactSummary(args: {
  prompt: string;
  response: string;
  oracleHeadline?: string;
  includeNames: boolean;
}): TiekatOracleArtifactSummary {
  return {
    promptSummary: summarizeArtifactText(args.prompt, args.includeNames, 180),
    responseSummary: summarizeArtifactText(args.response, args.includeNames, 240),
    oracleHeadline: args.oracleHeadline?.slice(0, 120)
  };
}

export function buildOracleArtifact(args: {
  sessionId: string;
  route: string;
  mode: TiekatReflectionMode;
  activeModules: TiekatModuleKey[];
  prompt: string;
  response: string;
  gravity: TiekatGravityBootstrapResult;
  oracle?: TiekatOraclePresentation | null;
  trend?: 'rising' | 'stable' | 'falling';
  versionSummary?: OracleVersionSummary | null;
  consent: {
    memoryEnabled: boolean;
    includeNames: boolean;
    allowAncestry: boolean;
    hideLivingPersons: boolean;
  };
  enableV55Framing: boolean;
  sessionMode?: TiekatSessionModeKey;
}): TiekatOracleArtifact {
  const now = new Date().toISOString();
  const v54 = getTiekatV54Metadata();
  const v55 = getTiekatV55Metadata();
  const sessionModeKey = args.sessionMode ?? getDefaultSessionMode();
  const sessionModeConfig = getSessionModeConfig(sessionModeKey);
  return {
    id: `${args.sessionId}:${now}`,
    sessionId: args.sessionId,
    timestamp: now,
    route: args.route,
    mode: args.mode,
    sessionMode: {
      key: sessionModeKey,
      label: sessionModeConfig.presentation.label,
      ritualFrame: sessionModeConfig.presentation.ritualFrame,
      allowV55Framing: sessionModeConfig.allowV55Framing
    },
    activeModules: args.activeModules.slice(0, 6),
    summary: buildOracleArtifactSummary({
      prompt: args.prompt,
      response: args.response,
      oracleHeadline: args.oracle?.headline,
      includeNames: args.consent.includeNames
    }),
    gravity: {
      status: args.gravity.status,
      informationIntegral: args.gravity.informationIntegral,
      deltaGPredicted: args.gravity.deltaGPredicted,
      scoringVersion: args.gravity.scoringVersion,
      canonicalSpecVersion: args.gravity.canonicalSpecVersion
    },
    v54: {
      specVersion: v54.specVersion,
      scoringVersion: v54.scoringVersion,
      sourceMode: v54.sourceMode
    },
    v55: args.enableV55Framing ? { specVersion: v55.specVersion, enabled: true } : undefined,
    trend: args.trend,
    versionSummaryState: args.versionSummary?.state,
    consent: {
      memoryEnabled: args.consent.memoryEnabled,
      includeNames: args.consent.includeNames,
      allowAncestry: args.consent.allowAncestry,
      hideLivingPersons: args.consent.hideLivingPersons
    },
    version: {
      rowVersion: TIEKAT_ORACLE_ARTIFACT_ROW_VERSION,
      artifactSpecVersion: 'TIEKAT-oracle-artifact-v2'
    }
  };
}

export function normalizeOracleArtifact(value: Partial<TiekatOracleArtifact>): TiekatOracleArtifact {
  const now = new Date().toISOString();
  return {
    id: value.id || `artifact:${now}`,
    sessionId: value.sessionId || 'unknown-session',
    timestamp: value.timestamp || now,
    route: value.route || 'assistant_synthesis',
    mode: value.mode || 'assistant_synthesis',
    sessionMode: {
      key: value.sessionMode?.key || getDefaultSessionMode(),
      label: value.sessionMode?.label || getSessionModeConfig(getDefaultSessionMode()).presentation.label,
      ritualFrame: value.sessionMode?.ritualFrame || getSessionModeConfig(getDefaultSessionMode()).presentation.ritualFrame,
      allowV55Framing: value.sessionMode?.allowV55Framing ?? true
    },
    activeModules: Array.isArray(value.activeModules) && value.activeModules.length ? value.activeModules : ['assistant'],
    summary: {
      promptSummary: value.summary?.promptSummary?.slice(0, 180) || '',
      responseSummary: value.summary?.responseSummary?.slice(0, 240) || '',
      oracleHeadline: value.summary?.oracleHeadline?.slice(0, 120)
    },
    gravity: {
      status: value.gravity?.status || 'theoretical',
      informationIntegral: Number(value.gravity?.informationIntegral ?? 0),
      deltaGPredicted: Number(value.gravity?.deltaGPredicted ?? 0),
      scoringVersion: value.gravity?.scoringVersion || getTiekatV54Metadata().scoringVersion,
      canonicalSpecVersion: value.gravity?.canonicalSpecVersion || getTiekatV54Metadata().specVersion
    },
    v54: {
      specVersion: value.v54?.specVersion || getTiekatV54Metadata().specVersion,
      scoringVersion: value.v54?.scoringVersion || getTiekatV54Metadata().scoringVersion,
      sourceMode: value.v54?.sourceMode || getTiekatV54Metadata().sourceMode
    },
    v55: value.v55?.enabled ? { specVersion: value.v55.specVersion || getTiekatV55Metadata().specVersion, enabled: true } : undefined,
    trend: value.trend || 'stable',
    versionSummaryState: value.versionSummaryState || 'insufficient_data',
    consent: {
      memoryEnabled: Boolean(value.consent?.memoryEnabled),
      includeNames: Boolean(value.consent?.includeNames),
      allowAncestry: Boolean(value.consent?.allowAncestry),
      hideLivingPersons: value.consent?.hideLivingPersons ?? true
    },
    version: {
      rowVersion: TIEKAT_ORACLE_ARTIFACT_ROW_VERSION,
      artifactSpecVersion: 'TIEKAT-oracle-artifact-v2'
    }
  };
}

export async function loadOracleArtifacts(): Promise<TiekatOracleArtifact[]> {
  const rows = await dbGet('oracleArtifacts');
  const parsed = Array.isArray(rows) ? rows : [];
  return parsed.map((row) => normalizeOracleArtifact(row));
}

export async function saveOracleArtifacts(rows: TiekatOracleArtifact[]) {
  await dbSet('oracleArtifacts', rows.slice(0, MAX_ORACLE_ARTIFACTS));
}

export async function appendOracleArtifact(args: {
  enabled: boolean;
  artifact: TiekatOracleArtifact;
}) {
  if (!args.enabled) return;
  const rows = await loadOracleArtifacts();
  await saveOracleArtifacts([normalizeOracleArtifact(args.artifact), ...rows]);
}

export async function getRecentOracleArtifacts(limit = 8): Promise<TiekatOracleArtifact[]> {
  const rows = await loadOracleArtifacts();
  return [...rows]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, Math.max(1, limit));
}

export async function deleteOracleArtifact(id: string) {
  const rows = await loadOracleArtifacts();
  await saveOracleArtifacts(rows.filter((row) => row.id !== id));
}

export function exportOracleArtifactJson(artifact: TiekatOracleArtifact) {
  return JSON.stringify(normalizeOracleArtifact(artifact), null, 2);
}

export function importOracleArtifactJson(text: string) {
  const parsed = JSON.parse(text) as Partial<TiekatOracleArtifact>;
  if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid artifact payload');
  if (parsed.summary && typeof parsed.summary !== 'object') throw new Error('Invalid artifact summary');
  if (parsed.gravity && typeof parsed.gravity !== 'object') throw new Error('Invalid artifact gravity');
  return normalizeOracleArtifact(parsed);
}

export function compareOracleArtifacts(a: TiekatOracleArtifact, b: TiekatOracleArtifact) {
  return {
    routeChanged: a.route !== b.route,
    moduleDelta: {
      added: b.activeModules.filter((moduleKey) => !a.activeModules.includes(moduleKey)),
      removed: a.activeModules.filter((moduleKey) => !b.activeModules.includes(moduleKey))
    },
    informationIntegralDelta: Number((b.gravity.informationIntegral - a.gravity.informationIntegral).toFixed(6)),
    deltaGPredictedDelta: Number((b.gravity.deltaGPredicted - a.gravity.deltaGPredicted).toExponential(6)),
    scoringVersionChanged: a.gravity.scoringVersion !== b.gravity.scoringVersion,
    sessionModeChanged: a.sessionMode.key !== b.sessionMode.key,
    trendChanged: (a.trend || 'stable') !== (b.trend || 'stable'),
    v55FramingChanged: Boolean(a.v55?.enabled) !== Boolean(b.v55?.enabled)
  };
}

export function buildOracleArtifactDiffView(a: TiekatOracleArtifact, b: TiekatOracleArtifact) {
  const comparison = compareOracleArtifacts(a, b);
  const lines = [
    `Session mode: ${a.sessionMode.label} → ${b.sessionMode.label}`,
    `Route: ${a.route} → ${b.route}`,
    `Modules +${comparison.moduleDelta.added.join(', ') || 'none'} / -${comparison.moduleDelta.removed.join(', ') || 'none'}`,
    `ΔI ${comparison.informationIntegralDelta.toFixed(6)}`,
    `ΔΔg ${comparison.deltaGPredictedDelta.toExponential(2)}`,
    `Scoring version changed: ${comparison.scoringVersionChanged ? 'yes' : 'no'}`,
    `Trend changed: ${comparison.trendChanged ? 'yes' : 'no'}`,
    `v55 framing changed: ${comparison.v55FramingChanged ? 'yes' : 'no'}`
  ];
  return {
    title: 'What changed',
    lines
  };
}
