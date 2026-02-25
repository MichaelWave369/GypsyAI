import Link from 'next/link';
import deck from '@/lib/tarot/deck.json';

export default function StudyTarotPage({ searchParams }: { searchParams: { arcana?: string; suit?: string; sephirah?: string; decan?: string; planet?: string } }) {
  const cards = (deck as any[]).filter((c) => {
    if (searchParams.arcana && c.arcana !== searchParams.arcana) return false;
    if (searchParams.suit && c.suit !== searchParams.suit) return false;
    if (searchParams.sephirah && c.hermetic?.sephirah !== searchParams.sephirah) return false;
    if (searchParams.decan && !String(c.hermetic?.decan || '').includes(searchParams.decan)) return false;
    if (searchParams.planet && !String(c.hermetic?.planet_ruler || c.hermetic?.attribution || '').includes(searchParams.planet)) return false;
    return true;
  });
  return (
    <main className="space-y-3">
      <h2 className="text-2xl text-gold">Tarot Browser</h2>
      <p className="text-sm">Use URL params: ?arcana=major|minor&suit=Wands&sephirah=Tiphareth&decan=Aries&planet=Mars</p>
      <div className="grid gap-2 md:grid-cols-2">{cards.map((c) => <Link key={c.id} className="panel text-sm" href={`/study/tarot/${c.id}`}><b>{c.name}</b><p>{c.arcana} {c.suit || ''}</p></Link>)}</div>
    </main>
  );
}
