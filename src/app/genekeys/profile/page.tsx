'use client';

import { useEffect, useState } from 'react';
import { loadGeneKeysSessions, saveGeneKeysSessions, GeneKeysSession } from '@/lib/local/storage';
import { toJsonExport, toPrintableHtml } from '@/lib/export/formatters';

export default function GeneKeysProfilePage() {
  const [sessions, setSessions] = useState<GeneKeysSession[]>([]);
  useEffect(() => setSessions(loadGeneKeysSessions()), []);

  const remove = (id: string) => { const next = sessions.filter((s) => s.id !== id); setSessions(next); saveGeneKeysSessions(next); };
  const exportOne = (s: GeneKeysSession, kind: 'json'|'html'|'md') => {
    if (kind === 'html') { const w = window.open('', '_blank'); w?.document.write(toPrintableHtml('Gene Keys Session', s.reading)); w?.document.close(); return; }
    const text = kind === 'json' ? toJsonExport(s) : `# Gene Keys Session\n\n${s.reading}`;
    const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `genekeys-${s.id}.${kind === 'json' ? 'json' : 'md'}`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-3">
      <h2 className="text-2xl text-gold">Saved Gene Keys Profiles</h2>
      {sessions.map((s) => <div key={s.id} className="panel text-sm"><p>{new Date(s.createdAt).toLocaleString()}</p><pre className="whitespace-pre-wrap">{s.reading.slice(0, 240)}...</pre><div className="flex gap-2"><button className="rounded border border-zinc-700 px-2" onClick={()=>exportOne(s,'md')}>MD</button><button className="rounded border border-zinc-700 px-2" onClick={()=>exportOne(s,'json')}>JSON</button><button className="rounded border border-zinc-700 px-2" onClick={()=>exportOne(s,'html')}>Print</button><button className="rounded border border-zinc-700 px-2" onClick={()=>remove(s.id)}>Delete</button></div></div>)}
    </main>
  );
}
