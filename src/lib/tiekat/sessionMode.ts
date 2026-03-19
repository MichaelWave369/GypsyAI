import { TiekatConsentState, TiekatModuleKey } from '@/lib/tiekat/schema';

export type TiekatSessionModeKey =
  | 'open_reflection'
  | 'tarot_inquiry'
  | 'astrology_reflection'
  | 'genekeys_contemplation'
  | 'ancestral_listening'
  | 'synthesis_oracle';

export interface TiekatSessionModePresentation {
  label: string;
  tone: 'grounded' | 'symbolic' | 'contemplative' | 'integrative';
  ritualFrame: string;
}

export interface TiekatSessionModeConfig {
  key: TiekatSessionModeKey;
  defaultRouteBias: 'assistant_synthesis' | 'tarot_focused' | 'astrology_focused' | 'genekeys_focused' | 'ancestry_aware_synthesis';
  preferredModules: TiekatModuleKey[];
  allowAncestryContribution: boolean;
  allowV55Framing: boolean;
  preferV55Framing: boolean;
  presentation: TiekatSessionModePresentation;
}

const MODE_CONFIG: Record<TiekatSessionModeKey, TiekatSessionModeConfig> = {
  open_reflection: {
    key: 'open_reflection',
    defaultRouteBias: 'assistant_synthesis',
    preferredModules: ['assistant'],
    allowAncestryContribution: false,
    allowV55Framing: true,
    preferV55Framing: false,
    presentation: {
      label: 'Open Reflection',
      tone: 'grounded',
      ritualFrame: 'Begin with a calm open reflection, grounded in modeled/theoretical framing.'
    }
  },
  tarot_inquiry: {
    key: 'tarot_inquiry',
    defaultRouteBias: 'tarot_focused',
    preferredModules: ['tarot', 'assistant'],
    allowAncestryContribution: false,
    allowV55Framing: true,
    preferV55Framing: false,
    presentation: {
      label: 'Tarot Inquiry',
      tone: 'symbolic',
      ritualFrame: 'Focus on symbolic tarot inquiry with concise modeled interpretation.'
    }
  },
  astrology_reflection: {
    key: 'astrology_reflection',
    defaultRouteBias: 'astrology_focused',
    preferredModules: ['astrology', 'assistant'],
    allowAncestryContribution: false,
    allowV55Framing: true,
    preferV55Framing: false,
    presentation: {
      label: 'Astrology Reflection',
      tone: 'integrative',
      ritualFrame: 'Use astrology reflection language with practical modeled synthesis.'
    }
  },
  genekeys_contemplation: {
    key: 'genekeys_contemplation',
    defaultRouteBias: 'genekeys_focused',
    preferredModules: ['genekeys', 'assistant'],
    allowAncestryContribution: false,
    allowV55Framing: true,
    preferV55Framing: false,
    presentation: {
      label: 'Gene Keys Contemplation',
      tone: 'contemplative',
      ritualFrame: 'Hold a contemplative Gene Keys tone with compact modeled guidance.'
    }
  },
  ancestral_listening: {
    key: 'ancestral_listening',
    defaultRouteBias: 'ancestry_aware_synthesis',
    preferredModules: ['ancestry', 'assistant', 'tarot'],
    allowAncestryContribution: true,
    allowV55Framing: false,
    preferV55Framing: false,
    presentation: {
      label: 'Ancestral Listening',
      tone: 'contemplative',
      ritualFrame: 'Listen for ancestry-safe patterns only when consent permits ancestry context.'
    }
  },
  synthesis_oracle: {
    key: 'synthesis_oracle',
    defaultRouteBias: 'assistant_synthesis',
    preferredModules: ['assistant', 'tarot', 'astrology', 'genekeys'],
    allowAncestryContribution: false,
    allowV55Framing: true,
    preferV55Framing: true,
    presentation: {
      label: 'Synthesis Oracle',
      tone: 'integrative',
      ritualFrame: 'Blend modules into a concise oracle synthesis with explicit modeled/theoretical limits.'
    }
  }
};

export function getDefaultSessionMode(): TiekatSessionModeKey {
  return 'open_reflection';
}

export function getSessionModeConfig(mode: TiekatSessionModeKey): TiekatSessionModeConfig {
  return MODE_CONFIG[mode];
}

export function resolveSessionMode(mode?: string | null, consent?: Pick<TiekatConsentState, 'allowAncestry'>): TiekatSessionModeKey {
  if (!mode || !(mode in MODE_CONFIG)) return getDefaultSessionMode();
  if (mode === 'ancestral_listening' && !consent?.allowAncestry) return 'open_reflection';
  return mode as TiekatSessionModeKey;
}

export function getModePreferredModules(mode: TiekatSessionModeKey, consent: Pick<TiekatConsentState, 'allowAncestry'>): TiekatModuleKey[] {
  const config = getSessionModeConfig(resolveSessionMode(mode, consent));
  if (!consent.allowAncestry) return config.preferredModules.filter((moduleKey) => moduleKey !== 'ancestry');
  return config.preferredModules;
}

export function buildSessionModePromptFrame(mode: TiekatSessionModeKey, consent: Pick<TiekatConsentState, 'allowAncestry'>) {
  const resolved = resolveSessionMode(mode, consent);
  const config = getSessionModeConfig(resolved);
  const ancestryLine = consent.allowAncestry && config.allowAncestryContribution
    ? 'Ancestry context is eligible if already consent-approved.'
    : 'Ancestry context is not included in this mode.';
  return `[Session Mode: ${config.presentation.label}] ${config.presentation.ritualFrame} ${ancestryLine}`;
}

export function getSessionModeOptions(): Array<{ key: TiekatSessionModeKey; label: string }> {
  return (Object.keys(MODE_CONFIG) as TiekatSessionModeKey[]).map((key) => ({ key, label: MODE_CONFIG[key].presentation.label }));
}
