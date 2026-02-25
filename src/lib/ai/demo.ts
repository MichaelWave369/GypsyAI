import { DrawnCard, Aspect, PlanetPosition } from '@/types';

export function demoTarotInterpretation(drawn: DrawnCard[], question?: string) {
  const header = `Opening: ${question ? `Your focus is "${question}".` : 'A general reflection appears.'} This is a demo-mode symbolic reading.`;
  const cards = drawn
    .map((d) => `${d.position} — ${d.card.name} (${d.orientation}): ${d.orientation === 'upright' ? d.card.short_upright_meaning : d.card.short_reversed_meaning}`)
    .join('\n');
  return `${header}
Card-by-card:
${cards}
Hermetic Layer:
Notice repeating elements, sephiroth, and signs in the cards.
Integration:
Hold tension as a workable practice, not fate.
Practical steps:
- Journal one concrete action.
- Choose one boundary and one invitation.
- Revisit this spread in 7 days.
Closing line:
As above, so below—move gently and intentionally.`;
}

export function demoAstroInterpretation(placements: PlanetPosition[], aspects: Aspect[], keys: string[]) {
  const sun = placements.find((p) => p.body === 'Sun');
  const moon = placements.find((p) => p.body === 'Moon');
  const rising = keys.find((k) => k.startsWith('Rising:'));
  return `Big Three:
Sun ${sun?.sign ?? 'N/A'}, Moon ${moon?.sign ?? 'N/A'}, ${rising ?? 'Rising unavailable'}.
Element & modality balance:
Use this demo summary to observe emphasis by sign family.
Strongest aspects highlights:
${aspects.slice(0, 3).map((a) => `${a.bodyA} ${a.type} ${a.bodyB}`).join('; ') || 'No major aspects in orb.'}
Hermetic Keys synthesis (Tarot integration):
${keys.slice(0, 5).join('; ')}
Practical reflection:
- Work one strength consciously.
- Name one repeating pattern.
- Practice a small corrective ritual.`;
}
