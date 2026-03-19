import {
  TiekatContextEnvelope,
  TiekatGravityBootstrapConfig,
  TiekatGravityBootstrapResult,
  TiekatGravityBootstrapState,
  TiekatSessionState,
  TiekatVerificationResult
} from '@/lib/tiekat/schema';
import { TIEKAT_GRAVITY_SCORING_VERSION } from '@/lib/tiekat/gravityVersioning';
import { TIEKAT_V54_CONFIDENCE_NOTE, TIEKAT_V54_SPEC_VERSION } from '@/lib/tiekat/v54';

const FOUR_PI_G = 4 * Math.PI * 6.6743e-11;

// Transparent deterministic weights for information integral I(x).
const WEIGHTS = {
  anchorStrength: 0.22,
  moduleDiversity: 0.18,
  coherenceFactor: 0.26,
  memoryContinuity: 0.12,
  markerBoost: 0.1,
  redactionPenalty: 0.07,
  contradictionPenalty: 0.05
} as const;

export const defaultGravityBootstrapConfig: TiekatGravityBootstrapConfig = {
  enabled: true,
  status: 'theoretical',
  lambdaI: 0.75,
  baselineMatterDensity: 1,
  sourceMode: 'modeled_internal_signal'
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function markerBoost(message: string, anchors: string[]) {
  const text = `${message} ${anchors.join(' ')}`.toLowerCase();
  if (text.includes('gravitational coherence') || text.includes('gravity') || text.includes('coherence field')) return 1;
  return 0;
}

export function buildGravityBootstrapState(
  session: TiekatSessionState,
  envelope: TiekatContextEnvelope,
  verification: TiekatVerificationResult
): TiekatGravityBootstrapState {
  const moduleCountWithoutAssistant = session.activeModules.filter((module) => module !== 'assistant').length;
  const anchorStrength = clamp01(envelope.symbolicAnchors.length / 12);
  const moduleDiversity = clamp01(moduleCountWithoutAssistant / 4);
  const coherenceFactor = clamp01(verification.coherenceScore);
  const memoryContinuity = clamp01(envelope.memoryContext.length / 3);
  const redactionPenalty = clamp01(envelope.redactionApplied.length / 5);
  const contradictionPenalty = clamp01(verification.issues.length / 4);
  const symbolicMarkerBoost = markerBoost(envelope.message, envelope.symbolicAnchors);

  return {
    informationIntegral: 0,
    anchorStrength,
    moduleDiversity,
    coherenceFactor,
    memoryContinuity,
    redactionPenalty,
    contradictionPenalty,
    markerBoost: symbolicMarkerBoost
  };
}

function computeInformationIntegral(state: TiekatGravityBootstrapState): number {
  const raw =
    state.anchorStrength * WEIGHTS.anchorStrength +
    state.moduleDiversity * WEIGHTS.moduleDiversity +
    state.coherenceFactor * WEIGHTS.coherenceFactor +
    state.memoryContinuity * WEIGHTS.memoryContinuity +
    state.markerBoost * WEIGHTS.markerBoost -
    state.redactionPenalty * WEIGHTS.redactionPenalty -
    state.contradictionPenalty * WEIGHTS.contradictionPenalty;

  return clamp01(Number(raw.toFixed(6)));
}

export function computeGravityBootstrap(args: {
  session: TiekatSessionState;
  envelope: TiekatContextEnvelope;
  verification: TiekatVerificationResult;
  config?: Partial<TiekatGravityBootstrapConfig>;
  includeDiagnostics?: boolean;
}): TiekatGravityBootstrapResult {
  const config = { ...defaultGravityBootstrapConfig, ...args.config };

  if (!config.enabled) {
    return {
      status: 'disabled',
      enabled: false,
      lambdaI: config.lambdaI,
      baselineMatterDensity: config.baselineMatterDensity,
      informationIntegral: 0,
      deltaGPredicted: 0,
      deltaGBand: { min: 0, max: 0 },
      classicalLimitReached: true,
      confidenceNote: `${TIEKAT_V54_CONFIDENCE_NOTE} Gravity bootstrap disabled; anomaly term not produced.`,
      sourceMode: 'modeled_internal_signal',
      contributingAnchors: [],
      contributingModules: args.session.activeModules,
      modelVersion: 'gravity-bootstrap-v1',
      scoringVersion: TIEKAT_GRAVITY_SCORING_VERSION,
      canonicalSpecVersion: TIEKAT_V54_SPEC_VERSION
    };
  }

  const state = buildGravityBootstrapState(args.session, args.envelope, args.verification);
  const informationIntegral = computeInformationIntegral(state);

  // Conceptual anomaly term: Δg = 4πG λI I(x). This is modeled, not measured.
  const deltaG = Number((FOUR_PI_G * config.lambdaI * informationIntegral).toExponential(6));
  const bandWidth = Math.max(Math.abs(deltaG) * 0.15, 1e-14);
  const classicalLimitReached = informationIntegral === 0;

  const diagnostics = args.includeDiagnostics
    ? {
        enabled: true,
        scoringVersion: TIEKAT_GRAVITY_SCORING_VERSION,
        features: {
          anchorStrength: state.anchorStrength,
          moduleDiversity: state.moduleDiversity,
          coherenceFactor: state.coherenceFactor,
          memoryContinuity: state.memoryContinuity,
          redactionPenalty: state.redactionPenalty,
          contradictionPenalty: state.contradictionPenalty,
          symbolicMarkerBoost: state.markerBoost
        },
        weights: WEIGHTS,
        intermediate: {
          informationIntegral,
          classicalLimitReached
        },
        notes: [
          'Deterministic internal scoring; no hardware sensor input.',
          'Redaction and contradiction signals reduce modeled information integral.',
          'Anti-overclaim rule: no physical gravimetry or hardware-sensor claims.'
        ]
      }
    : undefined;

  return {
    status: config.status,
    enabled: true,
    lambdaI: config.lambdaI,
    baselineMatterDensity: config.baselineMatterDensity,
    informationIntegral,
    deltaGPredicted: deltaG,
    deltaGBand: {
      min: Number((deltaG - bandWidth).toExponential(6)),
      max: Number((deltaG + bandWidth).toExponential(6))
    },
    classicalLimitReached,
    confidenceNote: TIEKAT_V54_CONFIDENCE_NOTE,
    sourceMode: 'modeled_internal_signal',
    contributingAnchors: args.envelope.symbolicAnchors.slice(0, 10),
    contributingModules: args.session.activeModules,
    modelVersion: 'gravity-bootstrap-v1',
    scoringVersion: TIEKAT_GRAVITY_SCORING_VERSION,
    diagnostics,
    canonicalSpecVersion: TIEKAT_V54_SPEC_VERSION
  };
}
