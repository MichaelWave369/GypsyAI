'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadSettings } from '@/lib/local/settings';
import { GeneKeysSession, loadGeneKeysSessions, saveGeneKeysSessions } from '@/lib/local/storage';
import { toPrintableHtml } from '@/lib/export/formatters';
import { EvidenceChips } from '@/components/EvidenceChips';

export default function GeneKeysPage() {
  const [form, setForm] = useState({ name: '', date: '', time: '' });
  const [result, setResult] = useState<any>(null);
  const [saved, setSaved] = useState<GeneKeysSession[]>([]);
  useEffect(() => setSaved(loadGeneKeysSessions()), []);

  const run = async () => {
    const s = loadSettings();
    const res = await fetch('/api/genekeys/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: form.date, time: form.time, guideMode: s.geneKeysGuideMode, demoMode: s.demoMode, accuracyMode: s.accuracyMode, provider: s.provider, model: s.model }) });
    setResult(await res.json());
  };
  const save = () => {
    if (!result) return;
    const next = [{ id: crypto.randomUUID(), name: form.name, date: form.date, time: form.time, guideMode: loadSettings().geneKeysGuideMode, profile: result.profile, reading: result.reading, createdAt: new Date().toISOString() }, ...saved];
    setSaved(next);
    saveGeneKeysSessions(next);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Gene Keys Reading</h2>
      <div className="panel flex flex-wrap gap-2"><input aria-label="gk-name" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded border border-zinc-700 bg-zinc-800 p-2" /><input aria-label="gk-date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded border border-zinc-700 bg-zinc-800 p-2" /><input aria-label="gk-time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded border border-zinc-700 bg-zinc-800 p-2" /><button data-testid="gk-generate" className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={run}>Generate Reading</button><button data-testid="gk-save" className="rounded border border-zinc-700 px-3 py-2" onClick={save}>Save Local</button><button data-testid="gk-print" className="rounded border border-zinc-700 px-3 py-2" onClick={() => { if (!result) return; const w = window.open('', '_blank'); w?.document.write(toPrintableHtml('Gene Keys Reading', result.reading)); w?.document.close(); }}>Print View</button><Link href="/genekeys/profile" className="rounded border border-zinc-700 px-3 py-2">Saved Profiles</Link></div>
      {result ? <section className="panel text-sm space-y-2"><h3 className="font-semibold">Reading</h3><pre data-testid="gk-reading" className="whitespace-pre-wrap">{result.reading}</pre><EvidenceChips chips={['Life’s Work', 'Evolution', 'Radiance', 'Purpose']} /><details><summary>What this reading used</summary><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(result.packet?.facts, null, 2)}</pre></details></section> : null}
    </main>
  );
}
