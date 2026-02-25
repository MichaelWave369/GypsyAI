'use client';

import { useMemo, useState } from 'react';
import { AstroWheel } from '@/components/AstroWheel';
import { HermeticDrawer } from '@/components/HermeticDrawer';
import { Aspect, PlanetPosition } from '@/types';

interface ChartResponse {
  placements: PlanetPosition[];
  aspects: Aspect[];
  houses: Array<{ house: number; sign: string }>;
  hermeticKeys: string[];
  ascendantEstimated: boolean;
}

export default function AstrologyPage() {
  const [form, setForm] = useState({ name: '', date: '', time: '', place: '', lat: '', lon: '', timezone: '' });
  const [chart, setChart] = useState<ChartResponse | null>(null);

  const submit = async () => {
    const res = await fetch('/api/astro/chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setChart(await res.json());
  };

  const keyItems = useMemo(() => chart?.hermeticKeys ?? [], [chart]);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Hermetic Astrology</h2>
      <div className="panel grid gap-2 md:grid-cols-3">
        {Object.entries(form).map(([k, v]) => (
          <input
            key={k}
            placeholder={k}
            value={v}
            onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
            className="rounded border border-zinc-700 bg-zinc-800 p-2"
          />
        ))}
        <button className="rounded bg-gold p-2 font-semibold text-black" onClick={submit}>
          Generate Chart
        </button>
      </div>

      {chart ? (
        <>
          <AstroWheel placements={chart.placements} />
          <div className="grid gap-4 md:grid-cols-3">
            <section className="panel text-sm"><h3 className="mb-2 font-semibold">Planets</h3>{chart.placements.map((p) => <p key={p.body}>{p.body}: {p.sign} {p.degreeInSign.toFixed(1)}°</p>)}</section>
            <section className="panel text-sm"><h3 className="mb-2 font-semibold">Aspects</h3>{chart.aspects.slice(0, 12).map((a) => <p key={`${a.bodyA}-${a.bodyB}`}>{a.bodyA} {a.type} {a.bodyB} ({a.orb.toFixed(1)}°)</p>)}</section>
            <section className="panel text-sm"><h3 className="mb-2 font-semibold">Houses</h3>{chart.houses.map((h) => <p key={h.house}>House {h.house}: {h.sign}</p>)}</section>
          </div>
          <HermeticDrawer title="Chart → Tarot Keys" items={keyItems} />
        </>
      ) : null}
    </main>
  );
}
