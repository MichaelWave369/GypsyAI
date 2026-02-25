import { Aspect, DrawnCard, PlanetPosition } from '@/types';
import { ReadingStyle } from '@/lib/local/settings';

const styleLine = (style: ReadingStyle) => `Reading style: ${style}. Keep facts fixed; adjust only tone.`;

export const buildTarotPrompt = ({
  question,
  spread,
  drawn,
  style
}: {
  question?: string;
  spread: string;
  drawn: DrawnCard[];
  style: ReadingStyle;
}) => `Hermetic tarot reading request.
${styleLine(style)}
Question: ${question ?? 'No explicit question supplied'}
Spread: ${spread}
Cards:\n${drawn.map((d) => `- ${d.position}: ${d.card.name} (${d.orientation}) | Hermetic ${JSON.stringify(d.card.hermetic)}`).join('\n')}

Return sections exactly:
1) Opening (1–2 sentences)
2) Card-by-card (positioned)
3) Hermetic Layer (Tree of Life + elements/planet/sign)
4) Integration (themes + tensions)
5) Practical steps (3 bullets)
6) Closing line`;

export const buildAstroPrompt = ({
  placements,
  aspects,
  houses,
  hermeticKeys,
  style
}: {
  placements: PlanetPosition[];
  aspects: Aspect[];
  houses: { house: number; sign: string }[];
  hermeticKeys: string[];
  style: ReadingStyle;
}) => `Hermetic astrology synthesis request.
${styleLine(style)}
Placements:\n${placements.map((p) => `- ${p.body}: ${p.sign} ${p.degreeInSign.toFixed(1)}°`).join('\n')}
Aspects:\n${aspects.map((a) => `- ${a.bodyA} ${a.type} ${a.bodyB} (orb ${a.orb.toFixed(2)}, strength ${a.strength.toFixed(2)})`).join('\n')}
Houses:\n${houses.map((h) => `- House ${h.house}: ${h.sign}`).join('\n')}
Hermetic Keys:\n${hermeticKeys.map((k) => `- ${k}`).join('\n')}

Return sections exactly:
1) Big Three (Sun/Moon/Rising if available)
2) Element & modality balance
3) Strongest aspects highlights
4) Hermetic Keys synthesis (Tarot integration)
5) Practical reflection (3 bullets)`;
