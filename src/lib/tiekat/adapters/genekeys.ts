export interface GeneKeysAdapterInput {
  activationSequence?: Array<{ sphere?: string; key?: number | string }>;
  themes?: string[];
}

export function adaptGeneKeysContext(input?: GeneKeysAdapterInput | null) {
  if (!input) return undefined;
  return {
    activation: (input.activationSequence ?? []).slice(0, 6).map((item) => `${item.sphere ?? 'Sphere'}: ${item.key ?? 'unknown'}`),
    themes: (input.themes ?? []).slice(0, 8)
  };
}
