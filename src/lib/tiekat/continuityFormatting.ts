export const CONTINUITY_MAX_CHIPS = 4 as const;
export const DEFAULT_CONTINUITY_CHIP_ORDER = ['awakening', 'glyph', 'continuity', 'modeled', 'local'] as const;

type ChipKey = typeof DEFAULT_CONTINUITY_CHIP_ORDER[number];

export interface ContinuityFormattingInput {
  awakening: string;
  glyph: string;
  continuityType: 'dominant' | 'mixed';
  includeModeled?: boolean;
  includeLocal?: boolean;
}

export function normalizeContinuityChipOrder(keys: ChipKey[] = [...DEFAULT_CONTINUITY_CHIP_ORDER]): ChipKey[] {
  const seen = new Set<ChipKey>();
  for (const key of keys) {
    if (DEFAULT_CONTINUITY_CHIP_ORDER.includes(key)) seen.add(key);
  }
  for (const key of DEFAULT_CONTINUITY_CHIP_ORDER) seen.add(key);
  return [...seen];
}

export function formatContinuityTuple(input: ContinuityFormattingInput): string {
  return `${input.awakening} / ${input.glyph}`;
}

export function buildContinuityChips(input: ContinuityFormattingInput, keys?: ChipKey[]): string[] {
  const values: Record<ChipKey, string | null> = {
    awakening: input.awakening,
    glyph: input.glyph,
    continuity: input.continuityType,
    modeled: input.includeModeled === false ? null : 'modeled',
    local: input.includeLocal ? 'local' : null
  };
  return normalizeContinuityChipOrder(keys)
    .map((key) => values[key])
    .filter((value): value is string => Boolean(value))
    .slice(0, CONTINUITY_MAX_CHIPS);
}

export function formatContinuityNote(input: ContinuityFormattingInput, label = 'Modeled continuity'): string {
  return `${label}: ${formatContinuityTuple(input)} (${input.continuityType}). Configuration-derived continuity.`;
}
