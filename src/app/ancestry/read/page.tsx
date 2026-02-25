'use client';

import { useCallback, useEffect, useState } from 'react';
import { extractAncestryPatterns } from '@/lib/ancestry/patterns';
import { loadAncestry } from '@/lib/ancestry/storage';
import { loadSettings } from '@/lib/local/settings';
import { drawCards } from '@/lib/tarot/engine';
import { buildGroundingPacketGeneKeys, buildGroundingPacketTarot } from '@/lib/reading/grounding';

export default function AncestryReadPage() {
  const [scope, setScope] = useState<'direct' | 'maternal' | 'paternal' | '7gen'>('direct');
  const [format, setFormat] = useState<'pattern' | 'tarot' | 'genekeys'>('pattern');
  const [out, setOut] = useState('');
  const [packet, setPacket] = useState<any>(null);

  const run = useCallback(async () => {
    const data = await loadAncestry();
    if (!data) return;
    const patterns = extractAncestryPatterns(data);
    const s = loadSettings();
    if (format === 'pattern') {
      const local = `Opening\nAncestral Pattern Reading (${scope})\nTop birth places: ${patterns.topBirthPlaces.map((x) => x.join(':')).join(', ')}\nMigration arcs: ${patterns.migrationArcs.map((x) => x.join(':')).join(', ')}\nLongevity avg: ${patterns.longevity.avg ?? 'n/a'}\nReflective prompt: Which pattern asks for gentler reinterpretation?`;
      setOut(local);
      setPacket({ facts: s.allowAncestryAi ? patterns : 'ancestry ai context disabled by settings' });
      return;
    }
    if (format === 'tarot') {
      const drawn = drawCards('ancestral-ladder', 'ancestry-seed');
      const gp = buildGroundingPacketTarot('ancestral-ladder', drawn);
      setPacket(gp);
      setOut(`Opening\nSpread overview\nCard-by-card\nHermetic Layer\nIntegration\nPractical steps\nClosing line`);
      return;
    }
    const gp = buildGroundingPacketGeneKeys({ activationSequence: 'use saved profile when available', planetary: [], guideMode: loadSettings().geneKeysGuideMode, triads: ['ancestral contemplation'] });
    setPacket(gp);
    setOut('Short opening\nActivation Sequence overview\nEach sphere\nIntegration theme\nJournal prompts');
  }, [format, scope]);

  useEffect(() => { run(); }, [run]);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Ancestry Reading</h2>
      <div className="panel flex flex-wrap gap-2 text-sm">
        <label>Scope <select className="rounded border border-zinc-700 bg-zinc-800" value={scope} onChange={(e) => setScope(e.target.value as any)}><option value="direct">Direct ancestors only</option><option value="maternal">Maternal line</option><option value="paternal">Paternal line</option><option value="7gen">7-generation focus</option></select></label>
        <label>Format <select className="rounded border border-zinc-700 bg-zinc-800" value={format} onChange={(e) => setFormat(e.target.value as any)}><option value="pattern">Ancestral Pattern Reading</option><option value="tarot">Ancestral Tarot Spread</option><option value="genekeys">Gene Keys Ancestral Contemplation</option></select></label>
        <button className="rounded border border-zinc-700 px-2" onClick={run}>Generate</button>
      </div>
      <section className="panel text-sm"><pre className="whitespace-pre-wrap">{out}</pre><details className="mt-2"><summary>What this reading used</summary><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(packet?.facts ?? {}, null, 2)}</pre></details></section>
    </main>
  );
}
