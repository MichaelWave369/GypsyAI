import { TiekatHabitatProfile, normalizeHabitatProfile } from '@/lib/tiekat/habitatProfile';

export const TIEKAT_HABITAT_SPHERE_SPEC_VERSION = 'TIEKAT-habitat-sphere-v1' as const;

export interface TiekatHabitatSphereSignature {
  awakeningState: 'quiet' | 'coherent' | 'awakened';
  shieldStatus: 'open' | 'steady' | 'fortified';
  synchronyState: 'solo' | 'guided' | 'council_aligned';
  glyphFamily: 'quiet_lotus' | 'resonant_orbit' | 'council_star';
  caption: string;
  confidenceNote: string;
  specVersion: typeof TIEKAT_HABITAT_SPHERE_SPEC_VERSION;
}

export function buildHabitatSphereSignature(profile: TiekatHabitatProfile): TiekatHabitatSphereSignature {
  const normalized = normalizeHabitatProfile(profile);
  const diagnosticsHeavy = normalized.preferences.showDiagnostics || normalized.preferences.enableV55Framing;
  const geometryHeavy = normalized.preferences.showGeometry;
  const councilHeavy = normalized.preferences.councilMode !== 'disabled';
  const frequent = normalized.applyCount >= 5;

  const awakeningState = diagnosticsHeavy && geometryHeavy ? 'awakened' : geometryHeavy || diagnosticsHeavy ? 'coherent' : 'quiet';
  const synchronyState = councilHeavy
    ? normalized.preferences.preferProviderBackedCouncil ? 'council_aligned' : 'guided'
    : 'solo';
  const shieldStatus = normalized.pinned || frequent
    ? 'fortified'
    : councilHeavy || normalized.applyCount > 0
      ? 'steady'
      : 'open';
  const glyphFamily = synchronyState === 'council_aligned'
    ? 'council_star'
    : awakeningState === 'quiet'
      ? 'quiet_lotus'
      : 'resonant_orbit';
  const caption = `Configuration-derived sphere profile: ${awakeningState} • ${shieldStatus} • ${synchronyState}.`;
  return {
    awakeningState,
    shieldStatus,
    synchronyState,
    glyphFamily,
    caption,
    confidenceNote: 'Modeled habitat sphere signature (theoretical, local configuration identity only).',
    specVersion: TIEKAT_HABITAT_SPHERE_SPEC_VERSION
  };
}
