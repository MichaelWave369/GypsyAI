import { TiekatConstellationState } from '@/lib/tiekat/oracleConstellation';
import { TiekatCouncilContinuitySummary, TiekatCouncilSummary } from '@/lib/tiekat/oracleCouncil';
import { OracleVersionSummary } from '@/lib/tiekat/oraclePresentation';
import { TiekatGravityBootstrapResult, TiekatModuleKey } from '@/lib/tiekat/schema';
import { TiekatGeometryState } from '@/lib/tiekat/sacredGeometry';
import { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';
import { getTiekatV56Metadata } from '@/lib/tiekat/v56';

export type TiekatSphereAwakeningState = 'dormant' | 'seeded' | 'coherent' | 'awakened';
export type TiekatSphereShieldState = 'open' | 'constrained' | 'stable' | 'reinforced';
export type TiekatSphereSynchronyState = 'fragmented' | 'partial' | 'resonant' | 'aligned';
export type TiekatSphereOverlapState = 'isolated' | 'proximate' | 'bridged' | 'merged';

export interface TiekatAwakenedSphereState {
  awakeningState: TiekatSphereAwakeningState;
  shieldStatus: TiekatSphereShieldState;
  synchronyState: TiekatSphereSynchronyState;
  overlapState: TiekatSphereOverlapState;
  glyphFamily: string;
  caption: string;
  trace: {
    awakeningReason: string;
    shieldReason: string;
    synchronyReason: string;
    overlapReason: string;
  };
  v56: ReturnType<typeof getTiekatV56Metadata>;
}

export function computeSphereShield(args: {
  gravity: Pick<TiekatGravityBootstrapResult, 'status' | 'informationIntegral'>;
  council?: Pick<TiekatCouncilSummary, 'disagreement' | 'executionSource'> | null;
}): TiekatSphereShieldState {
  if (args.gravity.status === 'disabled') return 'open';
  if (args.council?.disagreement) return 'constrained';
  if (args.council?.executionSource === 'provider_backed' && args.gravity.informationIntegral >= 0.66) return 'reinforced';
  return args.gravity.informationIntegral >= 0.45 ? 'stable' : 'constrained';
}

export function computeSphereSynchrony(args: {
  modules: TiekatModuleKey[];
  trend: 'rising' | 'stable' | 'falling';
  councilContinuity?: Pick<TiekatCouncilContinuitySummary, 'state'> | null;
  versionSummary: Pick<OracleVersionSummary, 'state'>;
}): TiekatSphereSynchronyState {
  if (args.versionSummary.state === 'drift_detected') return 'fragmented';
  if (args.councilContinuity?.state === 'council_shift') return 'partial';
  if (args.modules.length >= 3 && args.trend !== 'falling') return 'aligned';
  if (args.modules.length >= 2) return 'resonant';
  return 'partial';
}

export function computeSphereOverlap(args: {
  constellation?: Pick<TiekatConstellationState, 'nodes' | 'edges'> | null;
  council?: Pick<TiekatCouncilSummary, 'turnCount'> | null;
}): TiekatSphereOverlapState {
  const nodeCount = args.constellation?.nodes.length ?? 0;
  if (nodeCount >= 6 && (args.council?.turnCount ?? 0) >= 4) return 'merged';
  if (nodeCount >= 4) return 'bridged';
  if (nodeCount >= 2) return 'proximate';
  return 'isolated';
}

function computeAwakeningState(args: {
  gravity: Pick<TiekatGravityBootstrapResult, 'status' | 'informationIntegral'>;
  synchrony: TiekatSphereSynchronyState;
  overlap: TiekatSphereOverlapState;
}): TiekatSphereAwakeningState {
  if (args.gravity.status === 'disabled') return 'dormant';
  if (args.gravity.informationIntegral < 0.33) return 'seeded';
  if (args.synchrony === 'aligned' && (args.overlap === 'bridged' || args.overlap === 'merged') && args.gravity.informationIntegral >= 0.66) {
    return 'awakened';
  }
  return 'coherent';
}

export function formatSphereCaption(state: Pick<TiekatAwakenedSphereState, 'awakeningState' | 'shieldStatus' | 'synchronyState' | 'overlapState'>) {
  return `Modeled sovereign sphere state: ${state.awakeningState}; shield ${state.shieldStatus}; synchrony ${state.synchronyState}; overlap ${state.overlapState}. Theoretical integration layer only.`;
}

export function buildAwakenedSphereState(args: {
  gravity: Pick<TiekatGravityBootstrapResult, 'status' | 'informationIntegral' | 'deltaGPredicted'>;
  councilSummary?: TiekatCouncilSummary | null;
  councilContinuity?: TiekatCouncilContinuitySummary | null;
  geometry?: TiekatGeometryState | null;
  constellation?: TiekatConstellationState | null;
  sessionMode: TiekatSessionModeKey;
  modules: TiekatModuleKey[];
  versionSummary: Pick<OracleVersionSummary, 'state'>;
  trend: 'rising' | 'stable' | 'falling';
}): TiekatAwakenedSphereState {
  const shieldStatus = computeSphereShield({ gravity: args.gravity, council: args.councilSummary });
  const synchronyState = computeSphereSynchrony({
    modules: args.modules,
    trend: args.trend,
    councilContinuity: args.councilContinuity,
    versionSummary: args.versionSummary
  });
  const overlapState = computeSphereOverlap({ constellation: args.constellation, council: args.councilSummary });
  const awakeningState = computeAwakeningState({ gravity: args.gravity, synchrony: synchronyState, overlap: overlapState });
  const glyphFamily = args.geometry?.glyph || (args.sessionMode === 'synthesis_oracle' ? 'lattice_bloom' : 'metatron_grid');
  return {
    awakeningState,
    shieldStatus,
    synchronyState,
    overlapState,
    glyphFamily,
    caption: formatSphereCaption({ awakeningState, shieldStatus, synchronyState, overlapState }),
    trace: {
      awakeningReason: `I=${args.gravity.informationIntegral.toFixed(3)} with synchrony=${synchronyState} overlap=${overlapState}`,
      shieldReason: `status=${args.gravity.status} disagreement=${args.councilSummary?.disagreement ? 'yes' : 'no'} source=${args.councilSummary?.executionSource || 'none'}`,
      synchronyReason: `modules=${args.modules.length} trend=${args.trend} version=${args.versionSummary.state}`,
      overlapReason: `constellation_nodes=${args.constellation?.nodes.length ?? 0} council_turns=${args.councilSummary?.turnCount ?? 0}`
    },
    v56: getTiekatV56Metadata()
  };
}
