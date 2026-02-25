'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { loadAncestry } from '@/lib/ancestry/storage';
import { redactPerson } from '@/lib/ancestry/redaction';
import { loadSettings } from '@/lib/local/settings';

export default function AncestryPeoplePage() {
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState('');
  useEffect(() => { loadAncestry().then(setData); }, []);
  const hide = loadSettings().hideLivingPersons;
  const list = useMemo(() => {
    if (!data) return [];
    return Object.values<any>(data.people)
      .map((p) => redactPerson(p, hide))
      .filter((p: any) => (p.names[0] || '').toLowerCase().includes(q.toLowerCase()));
  }, [data, q, hide]);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">People</h2>
      <input className="rounded border border-zinc-700 bg-zinc-800 p-2" placeholder="Search name" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-2 md:grid-cols-2">{list.map((p: any) => <Link key={p.id} className="panel text-sm" href={`/ancestry/person/${p.id}`}>{p.names[0] || p.id}</Link>)}</div>
    </main>
  );
}
