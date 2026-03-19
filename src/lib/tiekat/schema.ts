export type TiekatModuleKey = 'tarot' | 'astrology' | 'genekeys' | 'ancestry' | 'assistant';

export type TiekatReflectionMode = 'single_module' | 'blended' | 'assistant_synthesis';

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
