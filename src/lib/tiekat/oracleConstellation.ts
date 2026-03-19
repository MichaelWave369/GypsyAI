import { TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';

export interface TiekatConstellationNode {
  id: string;
  x: number;
  y: number;
  mode: string;
  intensityBucket: 'low' | 'medium' | 'high';
  scoringVersion: string;
  v55: boolean;
  v56AwakeningState?: string;
  v56GlyphFamily?: string;
}

export interface TiekatConstellationEdge {
  from: string;
  to: string;
  type: 'continuity' | 'mode_shift' | 'version_shift' | 'gravity_delta' | 'sphere_shift';
}

export interface TiekatConstellationState {
  nodes: TiekatConstellationNode[];
  edges: TiekatConstellationEdge[];
  caption: string;
}

export interface TiekatConstellationFilterState {
  mode: string | 'all';
  scoringVersion: string | 'all';
  shiftType: TiekatConstellationEdge['type'] | 'all';
}

export interface TiekatConstellationFilterOptions {
  modes: string[];
  scoringVersions: string[];
  shiftTypes: TiekatConstellationEdge['type'][];
}

export interface SphereContinuitySummary {
  state: 'insufficient_sphere_history' | 'stable_sphere_continuity' | 'awakening_shift_detected' | 'shield_shift_detected' | 'synchrony_shift_detected';
  line: string;
}

export interface TiekatConstellationInput {
  artifacts: TiekatOracleArtifact[];
  limit?: number;
}

const CONSTELLATION_FILTER_KEY = 'gypsy-ai-tiekat-constellation-filter';

function bucketIntensity(value: number): TiekatConstellationNode['intensityBucket'] {
  if (value >= 0.66) return 'high';
  if (value >= 0.33) return 'medium';
  return 'low';
}

export function buildConstellationNodes(artifacts: TiekatOracleArtifact[]): TiekatConstellationNode[] {
  return artifacts.map((artifact, i) => ({
    id: artifact.id,
    x: 10 + i * 14,
    y: 55 - artifact.gravity.informationIntegral * 35,
    mode: artifact.sessionMode.key,
    intensityBucket: bucketIntensity(artifact.gravity.informationIntegral),
    scoringVersion: artifact.gravity.scoringVersion,
    v55: Boolean(artifact.v55?.enabled),
    v56AwakeningState: artifact.v56?.awakeningState,
    v56GlyphFamily: artifact.v56?.glyphFamily
  }));
}

export function buildConstellationEdges(artifacts: TiekatOracleArtifact[]): TiekatConstellationEdge[] {
  const edges: TiekatConstellationEdge[] = [];
  for (let i = 1; i < artifacts.length; i += 1) {
    const prev = artifacts[i - 1];
    const curr = artifacts[i];
    let type: TiekatConstellationEdge['type'] = 'continuity';
    if (prev.sessionMode.key !== curr.sessionMode.key) type = 'mode_shift';
    else if (prev.gravity.scoringVersion !== curr.gravity.scoringVersion) type = 'version_shift';
    else if ((prev.v56?.awakeningState || 'none') !== (curr.v56?.awakeningState || 'none')) type = 'sphere_shift';
    else if (Math.abs(curr.gravity.informationIntegral - prev.gravity.informationIntegral) > 0.08) type = 'gravity_delta';
    edges.push({ from: prev.id, to: curr.id, type });
  }
  return edges;
}

export function formatConstellationCaption(state: Pick<TiekatConstellationState, 'nodes' | 'edges'>) {
  const modeShift = state.edges.some((edge) => edge.type === 'mode_shift');
  const versionShift = state.edges.some((edge) => edge.type === 'version_shift');
  const sphereShift = state.edges.some((edge) => edge.type === 'sphere_shift');
  if (modeShift) return `Recent modeled oracle constellation shows a session-mode shift across ${state.nodes.length} local artifacts.`;
  if (versionShift) return `Recent modeled oracle constellation shows mixed scoring-version continuity across ${state.nodes.length} local artifacts.`;
  if (sphereShift) return `Recent modeled oracle constellation shows a v56 sphere-state shift across ${state.nodes.length} local artifacts.`;
  return `Recent modeled oracle continuity appears stable across ${state.nodes.length} local artifacts.`;
}

export function buildSphereContinuitySummary(artifacts: TiekatOracleArtifact[]): SphereContinuitySummary {
  const rows = [...artifacts]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((artifact) => artifact.v56)
    .filter((v56): v56 is NonNullable<TiekatOracleArtifact['v56']> => Boolean(v56))
    .slice(-6);
  if (rows.length < 2) {
    return {
      state: 'insufficient_sphere_history',
      line: 'Insufficient modeled sphere history for continuity summary.'
    };
  }
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (first.awakeningState !== last.awakeningState) {
    return {
      state: 'awakening_shift_detected',
      line: `Modeled sovereign sphere continuity indicates awakening shift ${first.awakeningState} → ${last.awakeningState}.`
    };
  }
  if (first.shieldStatus !== last.shieldStatus) {
    return {
      state: 'shield_shift_detected',
      line: `Modeled sovereign sphere continuity indicates shield shift ${first.shieldStatus} → ${last.shieldStatus}.`
    };
  }
  if (first.synchronyState !== last.synchronyState) {
    return {
      state: 'synchrony_shift_detected',
      line: `Modeled sovereign sphere continuity indicates synchrony shift ${first.synchronyState} → ${last.synchronyState}.`
    };
  }
  return {
    state: 'stable_sphere_continuity',
    line: 'Modeled sovereign sphere continuity appears stable across recent local artifacts.'
  };
}

export function buildOracleConstellationState(input: TiekatConstellationInput): TiekatConstellationState {
  const rows = [...input.artifacts]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-Math.max(2, Math.min(input.limit ?? 6, 8)));
  const nodes = buildConstellationNodes(rows);
  const edges = buildConstellationEdges(rows);
  return {
    nodes,
    edges,
    caption: `${formatConstellationCaption({ nodes, edges })} Constellation reflects local artifact memory only.`
  };
}

export function getConstellationFilterOptions(state: TiekatConstellationState): TiekatConstellationFilterOptions {
  return {
    modes: Array.from(new Set(state.nodes.map((node) => node.mode))).sort(),
    scoringVersions: Array.from(new Set(state.nodes.map((node) => node.scoringVersion))).sort(),
    shiftTypes: Array.from(new Set(state.edges.map((edge) => edge.type)))
  };
}

export function applyConstellationFilters(state: TiekatConstellationState, filters: TiekatConstellationFilterState): TiekatConstellationState {
  const modeFilteredNodes = filters.mode === 'all' ? state.nodes : state.nodes.filter((node) => node.mode === filters.mode);
  const versionFilteredNodes = filters.scoringVersion === 'all' ? modeFilteredNodes : modeFilteredNodes.filter((node) => node.scoringVersion === filters.scoringVersion);
  const keptIds = new Set(versionFilteredNodes.map((node) => node.id));
  const edges = state.edges.filter((edge) => keptIds.has(edge.from) && keptIds.has(edge.to));
  const filteredEdges = filters.shiftType === 'all' ? edges : edges.filter((edge) => edge.type === filters.shiftType);
  const edgeIds = new Set(filteredEdges.flatMap((edge) => [edge.from, edge.to]));
  const filteredNodes = filters.shiftType === 'all'
    ? versionFilteredNodes
    : versionFilteredNodes.filter((node) => edgeIds.has(node.id));

  const captionBase = filteredNodes.length
    ? `Showing ${filters.mode === 'all' ? 'recent' : filters.mode} local artifacts${filters.scoringVersion === 'all' ? '' : ` at ${filters.scoringVersion}`}${filters.shiftType === 'all' ? '' : ` with ${filters.shiftType} edges`}.`
    : 'No recent artifacts match the current filter.';

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    caption: `${captionBase} Constellation reflects modeled local oracle memory only.`
  };
}

export function filterOracleConstellationState(state: TiekatConstellationState, filters: TiekatConstellationFilterState) {
  return applyConstellationFilters(state, filters);
}

export function loadConstellationFilters(): TiekatConstellationFilterState {
  if (typeof window === 'undefined') return { mode: 'all', scoringVersion: 'all', shiftType: 'all' };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSTELLATION_FILTER_KEY) ?? '{}') as Partial<TiekatConstellationFilterState>;
    return {
      mode: parsed.mode || 'all',
      scoringVersion: parsed.scoringVersion || 'all',
      shiftType: parsed.shiftType || 'all'
    };
  } catch {
    return { mode: 'all', scoringVersion: 'all', shiftType: 'all' };
  }
}

export function saveConstellationFilters(filters: TiekatConstellationFilterState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSTELLATION_FILTER_KEY, JSON.stringify(filters));
}
