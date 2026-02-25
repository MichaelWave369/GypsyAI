export default function HomePage() {
  return (
    <main className="space-y-5">
      <section className="panel space-y-3">
        <h2 className="text-2xl text-gold">Tarot AI Reader</h2>
        <p>
          Chat with a reflective Tarot guide, choose spreads, and inspect Hermetic correspondences
          across the Tree of Life, zodiac, and elements.
        </p>
      </section>
      <section className="panel space-y-3">
        <h2 className="text-2xl text-gold">Hermetic Astrology</h2>
        <p>
          Generate tropical placements, houses, aspects, and convert chart symbols into Hermetic
          Tarot Keys for synthesis and practical reflection.
        </p>
      </section>
      <section className="rounded-xl border border-amber-700 bg-amber-950/30 p-4 text-sm">
        Disclaimer: Gypsy AI is for entertainment and self-reflection only, not medical, legal, or
        financial advice.
      </section>
    </main>
  );
}
