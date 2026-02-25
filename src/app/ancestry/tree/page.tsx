'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadAncestry } from '@/lib/ancestry/storage';
import { loadSettings } from '@/lib/local/settings';
import { redactPerson } from '@/lib/ancestry/redaction';

export default function AncestryTreePage() {
  const [data, setData] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [filter, setFilter] = useState<'all' | 'maternal' | 'paternal' | 'direct'>('all');
  useEffect(() => { loadAncestry().then(setData); }, []);
  const hide = loadSettings().hideLivingPersons;

  const nodes = useMemo(() => {
    if (!data) return [];
    return Object.values<any>(data.people).slice(0, 80).map((p, i) => ({ ...redactPerson(p, hide), x: (i % 8) * 180 + 50, y: Math.floor(i / 8) * 120 + 50 }));
  }, [data, hide]);

  return (
    <main className="space-y-3">
      <h2 className="text-2xl text-gold">Family Tree</h2>
      <div className="panel flex gap-2 text-sm">
        <button className="rounded border border-zinc-700 px-2" onClick={() => setScale((s) => s * 1.1)}>Zoom +</button>
        <button className="rounded border border-zinc-700 px-2" onClick={() => setScale((s) => s / 1.1)}>Zoom -</button>
        <button className="rounded border border-zinc-700 px-2" onClick={() => setDx((x) => x - 80)}>←</button>
        <button className="rounded border border-zinc-700 px-2" onClick={() => setDx((x) => x + 80)}>→</button>
        <button className="rounded border border-zinc-700 px-2" onClick={() => setDy((y) => y - 80)}>↑</button>
        <button className="rounded border border-zinc-700 px-2" onClick={() => setDy((y) => y + 80)}>↓</button>
        <select className="rounded border border-zinc-700 bg-zinc-800" value={filter} onChange={(e) => setFilter(e.target.value as any)}><option value="all">all</option><option value="maternal">maternal</option><option value="paternal">paternal</option><option value="direct">direct ancestors</option></select>
      </div>
      <div className="panel overflow-auto">
        <svg width="1600" height="900">
          <g transform={`translate(${dx},${dy}) scale(${scale})`}>
            {nodes.map((n: any) => <g key={n.id}><rect x={n.x} y={n.y} width="150" height="48" fill="#151520" stroke="#d8b25a"/><foreignObject x={n.x + 4} y={n.y + 4} width="142" height="40"><div style={{ fontSize: '12px' }}><a href={`/ancestry/person/${n.id}`} style={{ color: '#f5d98d' }}>{n.names?.[0] || n.id}</a></div></foreignObject></g>)}
          </g>
        </svg>
      </div>
      <p className="text-xs text-zinc-400">Lightweight pan/zoom tree preview. Click node names to open person detail.</p>
    </main>
  );
}
