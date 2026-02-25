import Link from 'next/link';
import { getHermeticProfile, minorCardToDeckId } from '@/lib/hermetic';

export default function StudyDecansPage() {
  const decans = getHermeticProfile('gd').decans;
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">36 Decans Map</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {decans.map((d, i) => (
          <Link key={`${d.sign}-${i}`} href={`/study/tarot/${minorCardToDeckId(d.minor_card)}`} className="panel text-sm">
            <b>{d.sign} {d.degree_range}</b>
            <p>Ruler: {d.planet_ruler}</p>
            <p>Card: {d.minor_card}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
