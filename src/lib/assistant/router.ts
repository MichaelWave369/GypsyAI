export type AssistantIntent =
  | 'CHAT'
  | 'TAROT_READING'
  | 'ASTRO_READING'
  | 'GENEKEYS_READING'
  | 'ANCESTRY_READING'
  | 'STUDY_LOOKUP';

const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

export function classifyIntent(input: string): AssistantIntent {
  const t = input.toLowerCase();
  if (has(t, ['study', 'correspondence', 'tree of life', 'decan'])) return 'STUDY_LOOKUP';
  if (has(t, ['ancestry', 'ancestor', 'lineage', 'family tree'])) return 'ANCESTRY_READING';
  if (has(t, ['gene keys', 'genekeys', 'activation sequence'])) return 'GENEKEYS_READING';
  if (has(t, ['natal', 'astrology', 'chart', 'rising', 'ascendant'])) return 'ASTRO_READING';
  if (has(t, ['tarot', 'spread', 'draw a card', 'cards'])) return 'TAROT_READING';
  return 'CHAT';
}
