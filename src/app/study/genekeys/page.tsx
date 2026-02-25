import keys from '@/lib/genekeys/keys.json';

export default function StudyGeneKeysPage() {
  return (
    <main className="space-y-3">
      <h2 className="text-2xl text-gold">Gene Keys Library (64)</h2>
      <div className="grid gap-2 md:grid-cols-2">
        {(keys as any[]).map((k) => <div key={k.number} className="panel text-sm"><b>Key {k.number}</b><p>{k.shadow_title} → {k.gift_title} → {k.siddhi_title}</p><p>{k.short_gift}</p></div>)}
      </div>
    </main>
  );
}
