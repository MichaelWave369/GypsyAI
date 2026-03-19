import { classifyTiekatRequest } from '@/lib/tiekat/routing';
import { TiekatConsentState } from '@/lib/tiekat/schema';

export type AssistantIntent =
  | 'CHAT'
  | 'TAROT_READING'
  | 'ASTRO_READING'
  | 'GENEKEYS_READING'
  | 'ANCESTRY_READING'
  | 'STUDY_LOOKUP';

const DEFAULT_CONSENT: TiekatConsentState = {
  allowAncestry: false,
  includeNames: false,
  hideLivingPersons: true,
  memoryEnabled: false
};

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export function classifyIntent(input: string, consent: TiekatConsentState = DEFAULT_CONSENT): AssistantIntent {
  const t = input.toLowerCase();
  if (has(t, ['study', 'correspondence', 'tree of life', 'decan'])) return 'STUDY_LOOKUP';

  const route = classifyTiekatRequest(input, consent);
  if (route.route === 'tarot_focused') return 'TAROT_READING';
  if (route.route === 'astrology_focused') return 'ASTRO_READING';
  if (route.route === 'genekeys_focused') return 'GENEKEYS_READING';
  if (route.route === 'ancestry_aware_synthesis') return 'ANCESTRY_READING';

  return 'CHAT';
}
