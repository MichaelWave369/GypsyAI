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
  trace: {
    selectionRule: string;
    selectionReason: string;
    layerReason: string;
  };
}

const GEOMETRY_VISIBILITY_KEY = 'gypsy-ai-tiekat-geometry-visible';

export function selectGeometryGlyph(input: TiekatGeometryInput): TiekatGeometryGlyph {
  if (input.versionSummary.state === 'drift_detected') return 'ring_orbit';
  if (input.sessionMode === 'synthesis_oracle' || input.activeModules.length >= 3) return 'lattice_bloom';
  if (input.mode === 'single_module' || input.activeModules.length <= 1) return 'triad';
  if (input.trend === 'rising') return 'hex_field';
  if (input.trend === 'falling') return 'spiral';
  return 'metatron_grid';
}

export function getGeometrySelectionTrace(input: TiekatGeometryInput) {
  if (input.versionSummary.state === 'drift_detected') {
    return { selectionRule: 'drift_detected', selectionReason: 'drift_detected -> ring_orbit' };
  }
  if (input.sessionMode === 'synthesis_oracle' || input.activeModules.length >= 3) {
    return { selectionRule: 'multi_module_synthesis', selectionReason: 'multi_module_synthesis -> lattice_bloom' };
  }
  if (input.mode === 'single_module' || input.activeModules.length <= 1) {
    return { selectionRule: 'single_module_sparse_state', selectionReason: 'single_module_sparse_state -> triad' };
  }
  if (input.trend === 'rising') {
    return { selectionRule: 'rising_trend', selectionReason: 'rising_trend -> hex_field' };
  }
  if (input.trend === 'falling') {
    return { selectionRule: 'falling_trend', selectionReason: 'falling_trend -> spiral' };
  }
  return { selectionRule: 'stable_default', selectionReason: 'stable_default -> metatron_grid' };
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
  const trace = getGeometrySelectionTrace(input);
  const layers = buildGeometryLayers(input);
  const layerReason = `informationIntegral ${input.gravity.informationIntegral.toFixed(2)} -> ${layers.length} layers`;
  return {
    glyph,
    density: layers.length,
    layers,
    caption: formatGeometryCaption(input, glyph),
    trace: {
      selectionRule: trace.selectionRule,
      selectionReason: trace.selectionReason,
      layerReason
    }
  };
}

export function loadGeometryVisibilityPreference(defaultVisible = false) {
  if (typeof window === 'undefined') return defaultVisible;
  const raw = window.localStorage.getItem(GEOMETRY_VISIBILITY_KEY);
  if (raw === null) return defaultVisible;
  return raw === '1';
}

export function saveGeometryVisibilityPreference(visible: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GEOMETRY_VISIBILITY_KEY, visible ? '1' : '0');
}
