export interface TarotAdapterInput {
  spread?: string;
  drawn?: Array<{ card?: { name?: string | null }; orientation?: 'upright' | 'reversed'; position?: string }>;
}

export function adaptTarotContext(input?: TarotAdapterInput | null) {
  if (!input) return undefined;
  const cards = (input.drawn ?? []).slice(0, 10).map((draw) => ({
    name: draw.card?.name ?? 'Unknown Card',
    orientation: draw.orientation ?? 'upright',
    position: draw.position ?? 'Unknown Position'
  }));

  return {
    spread: input.spread ?? 'unknown-spread',
    cards,
    anchors: cards.map((card) => card.name)
  };
}
