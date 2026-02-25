import deck from '@/lib/tarot/deck.json';

export default function StudyTarotCardPage({ params }: { params: { id: string } }) {
  const card = (deck as any[]).find((c) => c.id === params.id);
  if (!card) return <main>Card not found.</main>;
  return (
    <main className="space-y-3">
      <h2 className="text-2xl text-gold">{card.name}</h2>
      <section className="panel text-sm">
        <p>Arcana: {card.arcana}</p>
        <p>Suit: {card.suit ?? 'Major'}</p>
        <p>Hermetic: {Object.entries(card.hermetic).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>
        <p className="mt-2">Related chart placements: signs, planetary rulers, and decans matching this card’s attribution.</p>
      </section>
    </main>
  );
}
