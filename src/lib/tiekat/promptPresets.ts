import { TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';

export interface TiekatPromptPreset {
  id: string;
  label: string;
  text: string;
  ancestrySensitive?: boolean;
}

export interface TiekatPromptPresetGroup {
  mode: TiekatSessionModeKey;
  title: string;
  presets: TiekatPromptPreset[];
}

export type TiekatSessionModePresetMap = Record<TiekatSessionModeKey, TiekatPromptPresetGroup>;
const RECENT_PRESET_KEY = 'gypsy-ai-tiekat-recent-presets';

const PRESET_MAP: TiekatSessionModePresetMap = {
  open_reflection: {
    mode: 'open_reflection',
    title: 'Open Reflection Prompts',
    presets: [
      { id: 'open-1', label: 'Current energy', text: 'Offer a grounded reflection on my current emotional and symbolic energy.' },
      { id: 'open-2', label: 'Week focus', text: 'What should I focus on this week for clarity and steady progress?' },
      { id: 'open-3', label: 'Inner pattern', text: 'Help me notice one repeating inner pattern and a practical next step.' }
    ]
  },
  tarot_inquiry: {
    mode: 'tarot_inquiry',
    title: 'Tarot Inquiry Prompts',
    presets: [
      { id: 'tarot-1', label: '3-card insight', text: 'Give me a concise three-card style insight for this decision.' },
      { id: 'tarot-2', label: 'Obstacle + ally', text: 'What symbolic obstacle and ally should I hold right now?' },
      { id: 'tarot-3', label: 'Action card', text: 'What practical action does the symbolic reading point to today?' }
    ]
  },
  astrology_reflection: {
    mode: 'astrology_reflection',
    title: 'Astrology Reflection Prompts',
    presets: [
      { id: 'astro-1', label: 'Transit focus', text: 'Reflect on current transit themes and where to apply patience.' },
      { id: 'astro-2', label: 'House emphasis', text: 'Which life area feels most activated and how can I respond cleanly?' },
      { id: 'astro-3', label: 'Timing rhythm', text: 'Offer a short timing rhythm for planning my next two weeks.' }
    ]
  },
  genekeys_contemplation: {
    mode: 'genekeys_contemplation',
    title: 'Gene Keys Contemplation Prompts',
    presets: [
      { id: 'gk-1', label: 'Shadow to gift', text: 'Help me contemplate a shadow-to-gift movement in this situation.' },
      { id: 'gk-2', label: 'Contemplative question', text: 'Give me one deep contemplative question for this week.' },
      { id: 'gk-3', label: 'Embodied practice', text: 'Suggest a simple embodied practice aligned with my current contemplation.' }
    ]
  },
  ancestral_listening: {
    mode: 'ancestral_listening',
    title: 'Ancestral Listening Prompts',
    presets: [
      { id: 'anc-1', label: 'Lineage theme', text: 'Reflect on a broad lineage pattern that may be influencing me now.', ancestrySensitive: true },
      { id: 'anc-2', label: 'Healing intention', text: 'Offer a compassionate lineage-healing intention with no private details.', ancestrySensitive: true },
      { id: 'anc-3', label: 'Boundary ritual', text: 'Provide a grounded boundary ritual for carrying family stories safely.', ancestrySensitive: true }
    ]
  },
  synthesis_oracle: {
    mode: 'synthesis_oracle',
    title: 'Synthesis Oracle Prompts',
    presets: [
      { id: 'syn-1', label: 'Blended guidance', text: 'Blend symbolic systems into one concise guidance for my next step.' },
      { id: 'syn-2', label: 'Pattern + action', text: 'Name the key pattern and the one action that best integrates it.' },
      { id: 'syn-3', label: 'Ritual close', text: 'Offer a short opening, integration, and closing ritual line for today.' }
    ]
  }
};

export function getPromptPresetGroup(mode: TiekatSessionModeKey, allowAncestry: boolean): TiekatPromptPresetGroup {
  const group = PRESET_MAP[mode];
  if (allowAncestry) return group;
  return {
    ...group,
    presets: group.presets.filter((preset) => !preset.ancestrySensitive)
  };
}

export function getPromptPresetMap(): TiekatSessionModePresetMap {
  return PRESET_MAP;
}

export function loadRecentPresetUsage(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_PRESET_KEY) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

export function markPresetUsed(mode: TiekatSessionModeKey, presetId: string, enabled: boolean) {
  if (!enabled || typeof window === 'undefined') return;
  const usage = loadRecentPresetUsage();
  usage[`${mode}:${presetId}`] = Date.now();
  window.localStorage.setItem(RECENT_PRESET_KEY, JSON.stringify(usage));
}

export function orderPresetsByRecent(mode: TiekatSessionModeKey, group: TiekatPromptPresetGroup): TiekatPromptPresetGroup {
  const usage = loadRecentPresetUsage();
  return {
    ...group,
    presets: [...group.presets].sort((a, b) => (usage[`${mode}:${b.id}`] ?? 0) - (usage[`${mode}:${a.id}`] ?? 0))
  };
}
