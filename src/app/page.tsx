import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-5">
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Tarot AI Reader</h2><p>Grounded-card readings constrained to your spread facts and Hermetic correspondences.</p><Link className="text-gold" href="/tarot">Open Tarot</Link></section>
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Hermetic Astrology</h2><p>Structured chart outputs with aspect tags, traditional dignity notes, and packet-grounded interpretation.</p><Link className="text-gold" href="/astrology">Open Astrology</Link></section>
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Gene Keys</h2><p>Contemplative Gene Keys activation profile with local-first save/export and study browser.</p><Link className="text-gold" href="/genekeys">Open Gene Keys</Link></section>
      <section className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm">For entertainment and self-reflection only. Not medical, legal, or financial advice.</section>
    </main>
  );
}
