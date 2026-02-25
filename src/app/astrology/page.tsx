'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AstroWheel } from '@/components/AstroWheel';
import { HermeticDrawer } from '@/components/HermeticDrawer';
import { Aspect, PlanetPosition } from '@/types';
import { chartToMarkdown, toJsonExport, toPrintableHtml } from '@/lib/export/formatters';
import { loadSettings } from '@/lib/local/settings';
import { saveProfiles, loadProfiles } from '@/lib/local/storage';
import { EvidenceChips } from '@/components/EvidenceChips';

interface ChartResponse { placements: PlanetPosition[]; aspects: Aspect[]; houses: Array<{ house: number; sign: string; cusp: number }>; hermeticKeys: string[]; ascendantAvailable: boolean; ascendant: number; mc: number; interpretation: string; packet?: any; warning?: string; }

export default function AstrologyPage() {
  const [form, setForm] = useState({ name: '', date: '', time: '', place: '', lat: '', lon: '', timezone: '' });
  const [chart, setChart] = useState<ChartResponse | null>(null);

  const submit = async () => {
    const s = loadSettings();
    const res = await fetch('/api/astro/chart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, orb: s.aspectOrb, zodiacMode: s.zodiacMode, minorAspects: s.minorAspects, demoMode: s.demoMode, includeExtraBodies: true }) });
    setChart(await res.json());
  };

  const saveAsProfile = () => {
    const cur = loadProfiles();
    saveProfiles([{ id: crypto.randomUUID(), ...form, isDefault: cur.length === 0 }, ...cur]);
  };

  const keyItems = useMemo(() => chart?.hermeticKeys ?? [], [chart]);
  const exportChart = (kind: 'md' | 'json' | 'html') => {
    if (!chart) return;
    const payload = { name: form.name, createdAt: new Date().toISOString(), placements: chart.placements.map((p) => `${p.body}: ${p.sign} ${p.degreeInSign.toFixed(1)}° ${p.retrograde ? 'R' : ''}`), aspects: chart.aspects.map((a) => `${a.bodyA} ${a.type} ${a.bodyB} (${a.orb.toFixed(2)}°, ${a.tag})`), houses: chart.houses.map((h) => `House ${h.house}: ${h.sign} (${h.cusp.toFixed(2)}°)`) };
    if (kind === 'html') { const w = window.open('', '_blank'); w?.document.write(toPrintableHtml('Gypsy AI Chart', chartToMarkdown(payload))); w?.document.close(); return; }
    const text = kind === 'md' ? chartToMarkdown(payload) : toJsonExport({ ...chart, profile: form });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart-export.${kind === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Hermetic Astrology</h2>
      <div className="panel grid gap-2 md:grid-cols-3">{Object.entries(form).map(([k, v]) => <input aria-label={`astro-${k}`} key={k} placeholder={k} value={v} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="rounded border border-zinc-700 bg-zinc-800 p-2" />)}<button data-testid="astro-generate" className="rounded bg-gold p-2 font-semibold text-black" onClick={submit}>Generate Chart</button><button data-testid="astro-save-profile" className="rounded border border-zinc-700 p-2" onClick={saveAsProfile}>Save Profile</button></div>
      {chart ? <div data-testid="astro-results">{chart.warning ? <p className="mb-2 rounded border border-amber-700 bg-amber-950/30 p-2 text-sm text-amber-200">Using fallback chart due to calculation issue.</p> : null}<><AstroWheel placements={chart.placements} /><section className="panel text-sm"><p>Ascendant: {chart.ascendantAvailable ? `${chart.ascendant.toFixed(2)}°` : 'unavailable'} · MC: {chart.ascendantAvailable ? `${chart.mc.toFixed(2)}°` : 'unavailable'}</p><p className="mt-2">{chart.interpretation}</p><EvidenceChips chips={[...chart.placements.slice(0, 5).map((p) => `${p.body} ${p.sign}`), ...chart.aspects.slice(0, 3).map((a) => `${a.bodyA} ${a.type} ${a.bodyB}`)]} /><details className="mt-2"><summary>What this reading used</summary><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(chart.packet?.facts ?? {}, null, 2)}</pre></details></section><div className="grid gap-4 md:grid-cols-3"><section className="panel text-sm"><h2 className="mb-2 font-semibold">Planets</h2>{chart.placements.map((p) => <p key={p.body}>{p.body}: {p.sign} {p.degreeInSign.toFixed(1)}° {p.retrograde ? '(R)' : ''} <Link className="text-gold" href="/study/tarot">Open in Study Mode</Link></p>)}</section><section className="panel text-sm"><h3 className="mb-2 font-semibold">Aspects (top 5)</h3>{chart.aspects.slice(0, 5).map((a) => <p key={`${a.bodyA}-${a.bodyB}`}>{a.bodyA} {a.type} {a.bodyB} ({a.orb.toFixed(1)}°, s={a.strength.toFixed(2)}) · {a.tag}</p>)}</section><section className="panel text-sm"><h3 className="mb-2 font-semibold">Houses</h3>{chart.houses.map((h) => <p key={h.house}>House {h.house}: {h.sign}</p>)}</section></div><div className="flex gap-2"><button className="rounded border border-zinc-700 px-2" onClick={() => exportChart('md')}>Export MD</button><button data-testid="astro-export-json" className="rounded border border-zinc-700 px-2" onClick={() => exportChart('json')}>Export JSON</button><button className="rounded border border-zinc-700 px-2" onClick={() => exportChart('html')}>Print HTML</button></div><HermeticDrawer title="Chart → Tarot Keys" items={keyItems} /></></div> : null}
    </main>
  );
}
