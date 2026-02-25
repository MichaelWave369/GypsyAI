'use client';

import { useState } from 'react';
import { getHermeticProfile } from '@/lib/hermetic';

export default function StudyTreePage() {
  const profile = getHermeticProfile('gd');
  const [path, setPath] = useState(profile.paths[0]);
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Tree of Life Explorer</h2>
      <section className="grid gap-2 md:grid-cols-5">
        {profile.sephiroth.map((s) => <div key={s.number} className="panel text-sm"><b>{s.number}. {s.name}</b><p>{s.short_meaning}</p></div>)}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel text-sm space-y-1 max-h-80 overflow-auto">{profile.paths.map((p) => <button key={`${p.hebrew_letter}-${p.tarot_key}`} className="block w-full rounded border border-zinc-700 px-2 py-1 text-left" onClick={() => setPath(p)}>{p.hebrew_letter} · {p.tarot_key}</button>)}</div>
        <div className="panel text-sm"><h3 className="font-semibold">Selected Path</h3><p>Letter: {path.hebrew_letter}</p><p>Key: {path.tarot_key}</p><p>Attribution: {path.attribution}</p><p>Path: {path.from} → {path.to}</p><p className="mt-2">Concise meaning: A bridge between faculties requiring intentional balance.</p></div>
      </section>
    </main>
  );
}
