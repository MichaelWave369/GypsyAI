'use client';

import { useEffect, useRef, useState } from 'react';
import { BirthProfile, loadProfiles, markDefaultProfile, saveProfiles } from '@/lib/local/storage';

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<BirthProfile[]>([]);
  const [form, setForm] = useState<BirthProfile>({ id: '', name: '', date: '', time: '', place: '', lat: '', lon: '', timezone: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setProfiles(loadProfiles()), []);

  const persist = (next: BirthProfile[]) => {
    setProfiles(next);
    saveProfiles(next);
  };

  const add = () => {
    if (!form.name || !form.date || !form.time) return;
    persist([{ ...form, id: crypto.randomUUID(), isDefault: profiles.length === 0 }, ...profiles]);
  };

  const setDefault = (id: string) => persist(markDefaultProfile(profiles, id));
  const remove = (id: string) => persist(profiles.filter((p) => p.id !== id));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gypsy-ai-profiles.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as BirthProfile[];
    persist(parsed);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Local Birth Profiles</h2>
      <div className="panel grid gap-2 md:grid-cols-3">
        {['name', 'date', 'time', 'place', 'lat', 'lon', 'timezone'].map((k) => (
          <input key={k} placeholder={k} value={(form as Record<string, string>)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="rounded border border-zinc-700 bg-zinc-800 p-2" />
        ))}
        <button className="rounded bg-gold p-2 font-semibold text-black" onClick={add}>Save profile</button>
      </div>
      <div className="flex gap-2">
        <button className="rounded border border-zinc-700 px-3 py-1" onClick={exportJson}>Export JSON</button>
        <button className="rounded border border-zinc-700 px-3 py-1" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
      </div>
      <section className="panel space-y-2 text-sm">
        {profiles.map((p) => (
          <div key={p.id} className="rounded border border-zinc-700 p-2">
            <p><b>{p.name}</b> {p.isDefault ? '(default)' : ''}</p>
            <p>{p.date} {p.time} — {p.place || 'manual coordinates'}</p>
            <div className="mt-2 flex gap-2">
              <button className="rounded border border-zinc-700 px-2" onClick={() => setDefault(p.id)}>Set default</button>
              <button className="rounded border border-zinc-700 px-2" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
