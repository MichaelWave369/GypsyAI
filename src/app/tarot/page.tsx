'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { DrawnCard, TarotSpreadType } from '@/types';
import { HermeticDrawer } from '@/components/HermeticDrawer';
import { loadSettings } from '@/lib/local/settings';
import { TarotSession, loadTarotSessions, saveTarotSessions } from '@/lib/local/storage';
import { tarotToMarkdown, toJsonExport, toPrintableHtml } from '@/lib/export/formatters';

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
  const [sessions, setSessions] = useState<TarotSession[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOut, setChatOut] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => setSessions(loadTarotSessions()), []);

  const onDraw = async () => {
    const settings = loadSettings();
    const res = await fetch('/api/tarot/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, spread, demoMode: settings.demoMode, style: settings.readingStyle })
    });
    const data = await res.json();
    setDrawn(data.drawn);
    setReading(data.reading);
  };

  const saveSession = () => {
    const settings = loadSettings();
    const next = [{ id: crypto.randomUUID(), spread, question, drawn, interpretation: reading, hermeticProfile: settings.hermeticMode, createdAt: new Date().toISOString() }, ...sessions];
    setSessions(next);
    saveTarotSessions(next);
  };

  const removeSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    saveTarotSessions(next);
  };

  const exportSession = (s: TarotSession, kind: 'md' | 'json' | 'html') => {
    const payload = {
      spread: s.spread,
      question: s.question,
      createdAt: s.createdAt,
      interpretation: s.interpretation,
      cards: s.drawn.map((d) => `${d.position}: ${d.card.name} (${d.orientation})`)
    };
    if (kind === 'html') {
      const w = window.open('', '_blank');
      w?.document.write(toPrintableHtml('Gypsy AI Tarot Session', tarotToMarkdown(payload)));
      w?.document.close();
      return;
    }
    const text = kind === 'md' ? tarotToMarkdown(payload) : toJsonExport(s);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarot-session-${s.id}.${kind === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const runChat = async () => {
    const settings = loadSettings();
    setChatOut('');
    controllerRef.current = new AbortController();
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: chatInput, demoMode: settings.demoMode }), signal: controllerRef.current.signal });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      setChatOut(data.content);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setChatOut((x) => x + decoder.decode(value));
    }
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Tarot AI Reader</h2>
      <div className="panel space-y-3">
        <textarea className="w-full rounded border border-zinc-700 bg-zinc-800 p-2" placeholder="Question (optional)" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <select className="rounded border border-zinc-700 bg-zinc-800 p-2" value={spread} onChange={(e) => setSpread(e.target.value as TarotSpreadType)}>{spreadOptions.map((s) => <option value={s.value} key={s.value}>{s.label}</option>)}</select>
        <div className="flex gap-2"><button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={onDraw}>Draw & Interpret</button><button className="rounded border border-zinc-700 px-3 py-2" onClick={saveSession}>Save Session</button></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel"><h3 className="mb-2 font-semibold">Drawn Cards</h3><ul className="space-y-2 text-sm">{drawn.map((d) => <li key={`${d.position}-${d.card.id}`}>{d.position}: <b>{d.card.name}</b> ({d.orientation}) <Link className="text-gold" href={`/study/tarot/${d.card.id}`}>Open in Study Mode</Link></li>)}</ul></section>
        <section className="panel"><h3 className="mb-2 font-semibold">Reading</h3><pre className="whitespace-pre-wrap text-sm">{reading}</pre></section>
      </div>

      <HermeticDrawer title="Active profile: Golden Dawn inspired" items={drawn.map((d) => `${d.card.name}: ${Object.values(d.card.hermetic).join(' | ')}`)} />

      <section className="panel space-y-2">
        <h3 className="font-semibold">Streaming Chat</h3>
        <textarea className="w-full rounded border border-zinc-700 bg-zinc-800 p-2" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask follow-up guidance..." />
        <div className="flex gap-2"><button className="rounded border border-zinc-700 px-3 py-1" onClick={runChat}>Send</button><button className="rounded border border-zinc-700 px-3 py-1" onClick={() => controllerRef.current?.abort()}>Stop</button></div>
        <pre className="whitespace-pre-wrap text-sm">{chatOut}</pre>
      </section>

      <section className="panel text-sm">
        <h3 className="font-semibold">Saved Sessions</h3>
        {sessions.map((s) => (
          <div key={s.id} className="mt-2 rounded border border-zinc-700 p-2">
            <p>{s.spread} · {new Date(s.createdAt).toLocaleString()}</p>
            <p className="truncate">{s.question || 'No question'}</p>
            <div className="mt-1 flex gap-2">
              <button onClick={() => exportSession(s, 'md')} className="rounded border border-zinc-700 px-2">MD</button>
              <button onClick={() => exportSession(s, 'json')} className="rounded border border-zinc-700 px-2">JSON</button>
              <button onClick={() => exportSession(s, 'html')} className="rounded border border-zinc-700 px-2">Print HTML</button>
              <button onClick={() => removeSession(s.id)} className="rounded border border-zinc-700 px-2">Delete</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
