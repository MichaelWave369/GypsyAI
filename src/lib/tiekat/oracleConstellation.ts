import { TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';

export interface TiekatConstellationNode {
  id: string;
  x: number;
  y: number;
  mode: string;
  intensityBucket: 'low' | 'medium' | 'high';
  scoringVersion: string;
  v55: boolean;
}

export interface TiekatConstellationEdge {
  from: string;
  to: string;
  type: 'continuity' | 'mode_shift' | 'version_shift' | 'gravity_delta';
}

export interface TiekatConstellationState {
  nodes: TiekatConstellationNode[];
  edges: TiekatConstellationEdge[];
  caption: string;
}

export interface TiekatConstellationInput {
  artifacts: TiekatOracleArtifact[];
  limit?: number;
}

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
    v55: Boolean(artifact.v55?.enabled)
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
    else if (Math.abs(curr.gravity.informationIntegral - prev.gravity.informationIntegral) > 0.08) type = 'gravity_delta';
    edges.push({ from: prev.id, to: curr.id, type });
  }
  return edges;
}

export function formatConstellationCaption(state: Pick<TiekatConstellationState, 'nodes' | 'edges'>) {
  const modeShift = state.edges.some((edge) => edge.type === 'mode_shift');
  const versionShift = state.edges.some((edge) => edge.type === 'version_shift');
  if (modeShift) return `Recent modeled oracle constellation shows a session-mode shift across ${state.nodes.length} local artifacts.`;
  if (versionShift) return `Recent modeled oracle constellation shows mixed scoring-version continuity across ${state.nodes.length} local artifacts.`;
  return `Recent modeled oracle continuity appears stable across ${state.nodes.length} local artifacts.`;
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
