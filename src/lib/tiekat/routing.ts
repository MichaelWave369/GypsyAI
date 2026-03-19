import { TiekatConsentState, TiekatRequestRouting, TiekatModuleKey } from '@/lib/tiekat/schema';

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

const TAROT_WORDS = ['tarot', 'spread', 'card', 'arcana'];
const ASTRO_WORDS = ['astrology', 'natal', 'chart', 'transit', 'planet', 'rising', 'ascendant', 'sign'];
const GENEKEYS_WORDS = ['gene key', 'genekeys', 'shadow', 'gift', 'siddhi', 'activation sequence'];
const ANCESTRY_WORDS = ['ancestry', 'ancestor', 'lineage', 'family', 'bloodline', 'genealogy'];

function uniqueModules(modules: TiekatModuleKey[]): TiekatModuleKey[] {
  return Array.from(new Set(modules));
}

export function classifyTiekatRequest(input: string, consent: TiekatConsentState): TiekatRequestRouting {
  const t = input.toLowerCase();
  const modules: TiekatModuleKey[] = ['assistant'];

  if (has(t, TAROT_WORDS)) modules.push('tarot');
  if (has(t, ASTRO_WORDS)) modules.push('astrology');
  if (has(t, GENEKEYS_WORDS)) modules.push('genekeys');
  const ancestryRequested = has(t, ANCESTRY_WORDS);
  if (ancestryRequested && consent.allowAncestry) modules.push('ancestry');

  const resolved = uniqueModules(modules);
  if (resolved.length > 2) {
    return {
      route: ancestryRequested && consent.allowAncestry ? 'ancestry_aware_synthesis' : 'assistant_synthesis',
      modules: resolved,
      userIntent: input
    };
  }

  if (resolved.includes('tarot')) return { route: 'tarot_focused', modules: resolved, userIntent: input };
  if (resolved.includes('astrology')) return { route: 'astrology_focused', modules: resolved, userIntent: input };
  if (resolved.includes('genekeys')) return { route: 'genekeys_focused', modules: resolved, userIntent: input };

  return {
    route: ancestryRequested && consent.allowAncestry ? 'ancestry_aware_synthesis' : 'assistant_synthesis',
    modules: ancestryRequested && consent.allowAncestry ? ['assistant', 'ancestry'] : ['assistant'],
    userIntent: input
  };
}
