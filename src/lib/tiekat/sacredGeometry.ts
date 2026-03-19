import { OracleVersionSummary } from '@/lib/tiekat/oraclePresentation';
import { TiekatGravityBootstrapResult, TiekatModuleKey, TiekatReflectionMode } from '@/lib/tiekat/schema';
import { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';

export type TiekatGeometryGlyph = 'spiral' | 'metatron_grid' | 'triad' | 'hex_field' | 'ring_orbit' | 'lattice_bloom';

export interface TiekatGeometryLayer {
  radius: number;
  opacity: number;
  weight: number;
}

export interface TiekatGeometryInput {
  gravity: Pick<TiekatGravityBootstrapResult, 'status' | 'informationIntegral' | 'deltaGPredicted'>;
  trend: 'rising' | 'stable' | 'falling';
  versionSummary: Pick<OracleVersionSummary, 'state'>;
  sessionMode: TiekatSessionModeKey;
  activeModules: TiekatModuleKey[];
  route: string;
  mode: TiekatReflectionMode;
}

export interface TiekatGeometryState {
  glyph: TiekatGeometryGlyph;
  density: number;
  layers: TiekatGeometryLayer[];
  caption: string;
}

export function selectGeometryGlyph(input: TiekatGeometryInput): TiekatGeometryGlyph {
  if (input.versionSummary.state === 'drift_detected') return 'ring_orbit';
  if (input.sessionMode === 'synthesis_oracle' || input.activeModules.length >= 3) return 'lattice_bloom';
  if (input.mode === 'single_module' || input.activeModules.length <= 1) return 'triad';
  if (input.trend === 'rising') return 'hex_field';
  if (input.trend === 'falling') return 'spiral';
  return 'metatron_grid';
}

export function buildGeometryLayers(input: TiekatGeometryInput): TiekatGeometryLayer[] {
  const density = Math.max(1, Math.min(6, Math.round(input.gravity.informationIntegral * 6)));
  return Array.from({ length: density }, (_, i) => ({
    radius: 10 + i * 7,
    opacity: Number((0.2 + i * 0.12).toFixed(2)),
    weight: Number((1 + i * 0.25).toFixed(2))
  }));
}

export function formatGeometryCaption(input: TiekatGeometryInput, glyph: TiekatGeometryGlyph) {
  return `Modeled field geometry (${glyph}) derived from symbolic gravity-bootstrap metadata. Theoretical coherence pattern only.`;
}

export function buildSacredGeometryState(input: TiekatGeometryInput): TiekatGeometryState {
  const glyph = selectGeometryGlyph(input);
  const layers = buildGeometryLayers(input);
  return {
    glyph,
    density: layers.length,
    layers,
    caption: formatGeometryCaption(input, glyph)
  };
}
