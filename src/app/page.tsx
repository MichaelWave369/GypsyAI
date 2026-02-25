import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="space-y-5">
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Tarot + Astrology + Gene Keys</h2><p>Grounded reflective readings with strict fact packets and local-first storage.</p><div className="flex gap-3"><Link className="text-gold" href="/tarot">Tarot</Link><Link className="text-gold" href="/astrology">Astrology</Link><Link className="text-gold" href="/genekeys">Gene Keys</Link></div></section>
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Ancestral Memory</h2><p>Import GEDCOM, browse people/tree, and generate ancestry-based contemplative readings with consent gates.</p><Link className="text-gold" href="/ancestry">Open Ancestry</Link></section>
      <section className="panel space-y-3"><h2 className="text-2xl text-gold">Conversational Oracle</h2><p>Assistant can chat naturally and switch into grounded reading mode for Tarot/Astro/Gene Keys/Ancestry.</p><Link className="text-gold" href="/assistant">Open Assistant</Link></section>
      <section className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm">For entertainment and self-reflection only. No medical, legal, or financial advice.</section>
    </main>
  );
}
