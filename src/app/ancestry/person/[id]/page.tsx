'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadAncestry, saveAncestry } from '@/lib/ancestry/storage';
import { redactPerson } from '@/lib/ancestry/redaction';
import { loadSettings } from '@/lib/local/settings';

export default function AncestryPersonPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [person, setPerson] = useState<any>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadAncestry().then((d) => {
      setData(d);
      if (!d) return;
      const p = d.people[id];
      setPerson(redactPerson(p, loadSettings().hideLivingPersons));
    });
  }, [id]);

  const addNote = async () => {
    if (!data || !newNote) return;
    data.people[id].notes.push(newNote);
    await saveAncestry(data);
    setPerson({ ...person, notes: [...(person.notes || []), newNote] });
    setNewNote('');
  };

  if (!person) return <main className="panel">No person found.</main>;
  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">{person.names?.[0] || person.id}</h2>
      <section className="panel text-sm">
        <p>Sex: {person.sex || 'unknown'}</p>
        <p>Birth: {person.birth?.date || 'n/a'} {person.birth?.place || ''}</p>
        <p>Death: {person.death?.date || 'n/a'} {person.death?.place || ''}</p>
        <p>Families as child: {person.famc?.join(', ') || '-'}</p>
        <p>Families as spouse: {person.fams?.join(', ') || '-'}</p>
        <h3 className="mt-2 font-semibold">Events</h3>
        <ul>{(person.events || []).map((e: any, i: number) => <li key={i}>{e.type}: {e.date || ''} {e.place || ''}</li>)}</ul>
        <h3 className="mt-2 font-semibold">Notes</h3>
        <ul>{(person.notes || []).map((n: string, i: number) => <li key={i}>{n}</li>)}</ul>
        <div className="mt-2 flex gap-2"><input className="rounded border border-zinc-700 bg-zinc-800 p-1" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add note" /><button className="rounded border border-zinc-700 px-2" onClick={addNote}>Add</button></div>
      </section>
    </main>
  );
}
