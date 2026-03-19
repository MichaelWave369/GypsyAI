export type TiekatModuleKey = 'tarot' | 'astrology' | 'genekeys' | 'ancestry' | 'assistant';

export type TiekatReflectionMode = 'single_module' | 'blended' | 'assistant_synthesis';

export type TiekatGravityBootstrapStatus = 'disabled' | 'theoretical' | 'simulated';

export interface TiekatGravityBootstrapConfig {
  enabled: boolean;
  status: TiekatGravityBootstrapStatus;
  lambdaI: number;
  baselineMatterDensity: number;
  sourceMode: 'modeled_internal_signal';
}

export interface TiekatGravityBootstrapState {
  informationIntegral: number;
  anchorStrength: number;
  moduleDiversity: number;
  coherenceFactor: number;
  memoryContinuity: number;
  redactionPenalty: number;
  contradictionPenalty: number;
  markerBoost: number;
}

export interface TiekatGravityDiagnostics {
  enabled: boolean;
  scoringVersion: string;
  features: {
    anchorStrength: number;
    moduleDiversity: number;
    coherenceFactor: number;
    memoryContinuity: number;
    redactionPenalty: number;
    contradictionPenalty: number;
    symbolicMarkerBoost: number;
  };
  weights: {
    anchorStrength: number;
    moduleDiversity: number;
    coherenceFactor: number;
    memoryContinuity: number;
    markerBoost: number;
    redactionPenalty: number;
    contradictionPenalty: number;
  };
  intermediate: {
    informationIntegral: number;
    classicalLimitReached: boolean;
  };
  notes: string[];
}

export interface TiekatGravityBootstrapResult {
  status: TiekatGravityBootstrapStatus;
  enabled: boolean;
  lambdaI: number;
  baselineMatterDensity: number;
  informationIntegral: number;
  deltaGPredicted: number;
  deltaGBand: { min: number; max: number };
  classicalLimitReached: boolean;
  confidenceNote: string;
  sourceMode: 'modeled_internal_signal';
  contributingAnchors: string[];
  contributingModules: TiekatModuleKey[];
  modelVersion: 'gravity-bootstrap-v1';
  scoringVersion: string;
  diagnostics?: TiekatGravityDiagnostics;
}

export interface TiekatGravityHistoryEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  status: TiekatGravityBootstrapStatus;
  scoringVersion: string;
  informationIntegral: number;
  deltaGPredicted: number;
  deltaGBand: { min: number; max: number };
  contributingModules: TiekatModuleKey[];
  route: string;
  mode: TiekatReflectionMode;
  sourceMode: 'modeled_internal_signal';
  rowVersion: 1;
}

export interface TiekatConsentState {
  allowAncestry: boolean;
  includeNames: boolean;
  hideLivingPersons: boolean;
  memoryEnabled: boolean;
}

export interface TiekatSessionState {
  sessionId: string;
  userIntent: string;
  activeModules: TiekatModuleKey[];
  symbolicAnchors: string[];
  consent: TiekatConsentState;
}

export interface TiekatMemoryEntry {
  key: string;
  summary: string;
  anchors: string[];
  modules: TiekatModuleKey[];
  updatedAt: string;
  gravitySummary?: {
    deltaGPredicted: number;
    informationIntegral: number;
    contributingModules: TiekatModuleKey[];
    status: TiekatGravityBootstrapStatus;
    scoringVersion: string;
  };
}

export interface TiekatContextEnvelope {
  message: string;
  consent: TiekatConsentState;
  moduleContext: Partial<Record<TiekatModuleKey, unknown>>;
  memoryContext: TiekatMemoryEntry[];
  symbolicAnchors: string[];
  redactionApplied: string[];
}

export interface TiekatReflectionPlan {
  mode: TiekatReflectionMode;
  modulesToConsult: TiekatModuleKey[];
  contextSummary: string;
  verificationRules: string[];
  memoryKeysUsed: string[];
  gravityBootstrap: {
    enabled: boolean;
    status: TiekatGravityBootstrapStatus;
    sourceMode: 'modeled_internal_signal';
  };
}

export interface TiekatVerificationResult {
  passed: boolean;
  coherenceScore: number;
  issues: string[];
  usedModules: TiekatModuleKey[];
}

export interface TiekatRequestRouting {
  route: 'assistant_synthesis' | 'tarot_focused' | 'astrology_focused' | 'genekeys_focused' | 'ancestry_aware_synthesis';
  modules: TiekatModuleKey[];
  userIntent: string;
}
