export const TIEKAT_V54_SPEC_VERSION = 'TIEKAT-v54';
export const TIEKAT_V54_SCORING_VERSION = 'v54-gb-v1';
export const TIEKAT_V54_SOURCE_MODE = 'modeled_internal_signal' as const;
export const TIEKAT_V54_STATUS = 'theoretical' as const;
export const TIEKAT_V54_CONFIDENCE_NOTE =
  'Canonical TIEKAT v54 modeled gravity signal. Theoretical only; not hardware-measured and not a physical gravimetry claim.';

export interface TiekatV54Metadata {
  specVersion: string;
  scoringVersion: string;
  sourceMode: typeof TIEKAT_V54_SOURCE_MODE;
  status: typeof TIEKAT_V54_STATUS;
  confidenceNote: string;
  provenanceRules: string[];
}

export function getTiekatV54Metadata(): TiekatV54Metadata {
  return {
    specVersion: TIEKAT_V54_SPEC_VERSION,
    scoringVersion: TIEKAT_V54_SCORING_VERSION,
    sourceMode: TIEKAT_V54_SOURCE_MODE,
    status: TIEKAT_V54_STATUS,
    confidenceNote: TIEKAT_V54_CONFIDENCE_NOTE,
    provenanceRules: [
      'theoretical_only',
      'modeled_internal_signal_only',
      'no_hardware_measurement_claims',
      'privacy_safe_compact_history_only'
    ]
  };
}

export function exportTiekatV54Spec() {
  return {
    metadata: getTiekatV54Metadata(),
    historyEntryShape: {
      required: ['sessionId', 'timestamp', 'status', 'scoringVersion', 'informationIntegral', 'deltaGPredicted', 'deltaGBand', 'contributingModules', 'route', 'mode', 'sourceMode', 'rowVersion']
    },
    trendSemantics: ['rising', 'stable', 'falling']
  };
}
