export const TIEKAT_V55_SPEC_VERSION = 'TIEKAT-v55';
export const TIEKAT_V55_LAYER_ROLE = 'theoretical_master_action_frame' as const;
export const TIEKAT_V55_STATUS = 'conceptual' as const;
export const TIEKAT_V55_SOURCE_MODE = 'modeled_meta_field' as const;
export const TIEKAT_V55_CONFIDENCE_NOTE =
  'TIEKAT v55 is a conceptual framing layer only. It does not represent hardware measurement, physical confirmation, or solved master-action dynamics.';

export interface TiekatV55Metadata {
  specVersion: string;
  status: typeof TIEKAT_V55_STATUS;
  layerRole: typeof TIEKAT_V55_LAYER_ROLE;
  sourceMode: typeof TIEKAT_V55_SOURCE_MODE;
  confidenceNote: string;
  framingRules: string[];
}

export function getTiekatV55Metadata(): TiekatV55Metadata {
  return {
    specVersion: TIEKAT_V55_SPEC_VERSION,
    status: TIEKAT_V55_STATUS,
    layerRole: TIEKAT_V55_LAYER_ROLE,
    sourceMode: TIEKAT_V55_SOURCE_MODE,
    confidenceNote: TIEKAT_V55_CONFIDENCE_NOTE,
    framingRules: [
      'v54_runtime_is_operational',
      'v55_is_conceptual_meta_frame',
      'no_physical_confirmation_claims',
      'no_hardware_sensor_claims'
    ]
  };
}

export function exportTiekatV55Spec() {
  return {
    metadata: getTiekatV55Metadata(),
    presentationContract: {
      optionalFraming: true,
      deterministic: true,
      requiresModeledDisclaimer: true
    }
  };
}
