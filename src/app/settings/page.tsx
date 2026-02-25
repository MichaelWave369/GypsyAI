'use client';

import { useEffect, useState } from 'react';

const defaultSettings = {
  provider: 'ollama',
  model: 'llama3.1',
  ollamaBaseUrl: 'http://localhost:11434',
  aspectOrb: 6,
  hermeticMode: 'gd'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const raw = localStorage.getItem('gypsy-ai-settings');
    if (raw) setSettings(JSON.parse(raw));
  }, []);

  const save = () => localStorage.setItem('gypsy-ai-settings', JSON.stringify(settings));

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">AI + Hermetic Settings</h2>
      <div className="panel grid gap-3 md:max-w-xl">
        <label>Provider
          <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="ollama">Ollama (default)</option>
            <option value="openai">OpenAI (if key present)</option>
          </select>
        </label>
        <label>Model <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Ollama URL <input value={settings.ollamaBaseUrl} onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Aspect orb <input type="number" value={settings.aspectOrb} onChange={(e) => setSettings({ ...settings, aspectOrb: Number(e.target.value) })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Hermetic profile
          <select value={settings.hermeticMode} onChange={(e) => setSettings({ ...settings, hermeticMode: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="gd">Golden Dawn inspired</option>
            <option value="thoth">Thoth inspired</option>
          </select>
        </label>
        <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={save}>Save locally</button>
      </div>
    </main>
  );
}
