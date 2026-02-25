import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-5">
      <section className="panel space-y-3">
        <h2 className="text-2xl text-gold">Tarot AI Reader</h2>
        <p>Chat with a reflective Tarot guide, choose spreads, save sessions locally, and export readings (Markdown/JSON/printable HTML).</p>
        <Link className="text-gold" href="/tarot">Open Tarot</Link>
      </section>
      <section className="panel space-y-3">
        <h2 className="text-2xl text-gold">Hermetic Astrology</h2>
        <p>Generate chart placements, improved Asc/MC and equal houses, map into Tarot keys, and export chart outputs locally.</p>
        <Link className="text-gold" href="/astrology">Open Astrology</Link>
      </section>
      <section className="panel space-y-3">
        <h2 className="text-2xl text-gold">Study Mode</h2>
        <p>Explore Tree of Life, tarot correspondences, and the 36 decans with deep links from readings.</p>
        <Link className="text-gold" href="/study">Open Study</Link>
      </section>
      <section className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm">Disclaimer: Gypsy AI is for entertainment and self-reflection only, not medical, legal, or financial advice.</section>
    </main>
  );
}
