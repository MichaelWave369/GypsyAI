'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { classifyIntent } from '@/lib/assistant/router';
import { loadSettings } from '@/lib/local/settings';
import { AssistantSession, loadAssistantSessions, saveAssistantSessions, sessionsToMarkdown } from '@/lib/assistant/storage';

export default function AssistantPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; sources?: string[] }[]>([]);
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => { loadAssistantSessions().then((s) => { setSessions(s); if (s[0]) { setActiveId(s[0].id); setMessages(s[0].messages.map((m) => ({ role: m.role, content: m.content }))); } }); }, []);
  const active = useMemo(() => sessions.find((s) => s.id === activeId), [sessions, activeId]);

  const persist = async (nextMessages: { role: 'user' | 'assistant'; content: string; sources?: string[] }[]) => {
    const base = sessions.filter((s) => s.id !== activeId);
    const id = activeId || crypto.randomUUID();
    const session: AssistantSession = {
      id,
      title: nextMessages[0]?.content?.slice(0, 32) || 'Assistant session',
      messages: nextMessages.map((m) => ({ role: m.role, content: m.content, tags: [classifyIntent(m.content).toLowerCase()], timestamp: new Date().toISOString() })),
      updatedAt: new Date().toISOString(),
      summary: active?.summary
    };
    const next = [session, ...base];
    setSessions(next);
    setActiveId(id);
    await saveAssistantSessions(next);
  };

  const send = async () => {
    const s = loadSettings();
    const next = [...messages, { role: 'user' as const, content: input }];
    setMessages(next);
    setInput('');
    controllerRef.current = new AbortController();
    const res = await fetch('/api/assistant/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input, demoMode: s.demoMode, strictReadingMode: s.strictReadingMode, autoSwitchReadingMode: s.autoSwitchReadingMode }), signal: controllerRef.current.signal });
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await res.json();
      const withAssistant = [...next, { role: 'assistant' as const, content: data.content, sources: data.sources }];
      setMessages(withAssistant);
      await persist(withAssistant);
      return;
    }
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let out = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      out += decoder.decode(value);
      setMessages([...next, { role: 'assistant', content: out }]);
    }
    await persist([...next, { role: 'assistant', content: out }]);
  };

  const summarize = async () => {
    if (!messages.length) return;
    const summary = `Session summary: ${messages.length} messages. Main intents: ${Array.from(new Set(messages.map((m) => classifyIntent(m.content)))).join(', ')}.`;
    const next = sessions.map((s) => (s.id === activeId ? { ...s, summary } : s));
    setSessions(next);
    await saveAssistantSessions(next);
  };

  const exportSession = (kind: 'json' | 'md') => {
    if (!active) return;
    const text = kind === 'json' ? JSON.stringify(active, null, 2) : sessionsToMarkdown(active);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assistant-${active.id}.${kind === 'json' ? 'json' : 'md'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSession = async (file?: File) => {
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as AssistantSession;
    const next = [parsed, ...sessions.filter((s) => s.id !== parsed.id)];
    setSessions(next);
    setActiveId(parsed.id);
    setMessages(parsed.messages.map((m) => ({ role: m.role, content: m.content })));
    await saveAssistantSessions(next);
  };

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Conversational Oracle</h2>
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="panel space-y-2 text-sm">
          <div className="flex gap-2"><button className="rounded border border-zinc-700 px-2" onClick={summarize}>Summarize session</button><button className="rounded border border-zinc-700 px-2" onClick={() => exportSession('md')}>Export MD</button><button className="rounded border border-zinc-700 px-2" onClick={() => exportSession('json')}>Export JSON</button></div>
          <input type="file" accept="application/json" onChange={(e) => importSession(e.target.files?.[0])} />
          {sessions.map((s) => <button key={s.id} className="block w-full rounded border border-zinc-700 p-2 text-left" onClick={() => { setActiveId(s.id); setMessages(s.messages.map((m) => ({ role: m.role, content: m.content }))); }}>{s.title}<div className="text-xs text-zinc-400">{new Date(s.updatedAt).toLocaleString()}</div></button>)}
        </aside>
        <section className="panel space-y-2">
          <div className="max-h-[500px] overflow-auto space-y-2">
            {messages.map((m, i) => <div key={i} className="rounded border border-zinc-700 p-2 text-sm"><b>{m.role}</b><pre className="whitespace-pre-wrap">{m.content}</pre>{m.sources?.length ? <p className="text-xs text-zinc-400">Sources: {m.sources.join(', ')}</p> : null}</div>)}
          </div>
          <textarea className="w-full rounded border border-zinc-700 bg-zinc-800 p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Chat freely or ask for a reading..." />
          <div className="flex gap-2"><button className="rounded bg-gold px-3 py-1 text-black" onClick={send}>Send</button><button className="rounded border border-zinc-700 px-3 py-1" onClick={() => controllerRef.current?.abort()}>Stop</button><button className="rounded border border-zinc-700 px-3 py-1" onClick={() => setInput(messages.filter((m) => m.role === 'user').at(-1)?.content || '')}>Regenerate</button></div>
        </section>
      </div>
    </main>
  );
}
