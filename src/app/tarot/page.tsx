'use client';

import { useState } from 'react';
import { DrawnCard, TarotSpreadType } from '@/types';
import { HermeticDrawer } from '@/components/HermeticDrawer';

const spreadOptions: { label: string; value: TarotSpreadType }[] = [
  { label: 'Single Card', value: 'single' },
  { label: 'Three Card', value: 'three-card' },
  { label: 'Celtic Cross', value: 'celtic-cross' },
  { label: 'Tree of Life', value: 'tree-of-life' },
  { label: '369 Spread', value: '369' }
];

export default function TarotPage() {
  const [question, setQuestion] = useState('');
  const [spread, setSpread] = useState<TarotSpreadType>('single');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const onDraw = async () => {
    const res = await fetch('/api/tarot/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, spread })
    });
    const data = await res.json();
    setDrawn(data.drawn);
    setReading(data.reading);
    setHistory((h) => [new Date().toLocaleString() + ` — ${spread}`, ...h].slice(0, 8));
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Tarot AI Reader</h2>
      <div className="panel space-y-3">
        <textarea className="w-full rounded border border-zinc-700 bg-zinc-800 p-2" placeholder="Question (optional)" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <select className="rounded border border-zinc-700 bg-zinc-800 p-2" value={spread} onChange={(e) => setSpread(e.target.value as TarotSpreadType)}>
          {spreadOptions.map((s) => (
            <option value={s.value} key={s.value}>{s.label}</option>
          ))}
        </select>
        <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={onDraw}>Draw & Interpret</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel">
          <h3 className="mb-2 font-semibold">Drawn Cards</h3>
          <ul className="space-y-2 text-sm">
            {drawn.map((d) => (
              <li key={`${d.position}-${d.card.id}`}>{d.position}: <b>{d.card.name}</b> ({d.orientation})</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h3 className="mb-2 font-semibold">Reading</h3>
          <pre className="whitespace-pre-wrap text-sm">{reading}</pre>
        </section>
      </div>

      <HermeticDrawer
        title="Active profile: Golden Dawn inspired"
        items={drawn.map((d) => `${d.card.name}: ${Object.values(d.card.hermetic).join(' | ')}`)}
      />

      <section className="panel text-sm">
        <h3 className="font-semibold">Draw History</h3>
        <ul className="list-disc pl-5">
          {history.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
