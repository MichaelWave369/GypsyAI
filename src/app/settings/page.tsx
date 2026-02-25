'use client';

import { useEffect, useState } from 'react';
import { AppSettings, defaultSettings, loadSettings, saveSettings } from '@/lib/local/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const save = () => saveSettings(settings);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">AI + Hermetic Settings</h2>
      <div className="panel grid gap-3 md:max-w-2xl">
        <label>Provider
          <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value as AppSettings['provider'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="ollama">Ollama (default)</option>
            <option value="openai">OpenAI (if key present)</option>
          </select>
        </label>
        <label>Model <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Ollama URL <input value={settings.ollamaBaseUrl} onChange={(e) => setSettings({ ...settings, ollamaBaseUrl: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Aspect orb <input type="number" value={settings.aspectOrb} onChange={(e) => setSettings({ ...settings, aspectOrb: Number(e.target.value) })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"/></label>
        <label>Hermetic profile
          <select value={settings.hermeticMode} onChange={(e) => setSettings({ ...settings, hermeticMode: e.target.value as AppSettings['hermeticMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="gd">Golden Dawn inspired</option>
            <option value="thoth">Thoth inspired</option>
          </select>
        </label>
        <label>Zodiac mode
          <select value={settings.zodiacMode} onChange={(e) => setSettings({ ...settings, zodiacMode: e.target.value as AppSettings['zodiacMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="tropical">Tropical (default)</option>
            <option value="sidereal">Sidereal (Lahiri approximation)</option>
          </select>
        </label>
        <label>Reading style
          <select value={settings.readingStyle} onChange={(e) => setSettings({ ...settings, readingStyle: e.target.value as AppSettings['readingStyle'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option>Direct</option><option>Gentle</option><option>Ritual</option>
          </select>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.minorAspects} onChange={(e) => setSettings({ ...settings, minorAspects: e.target.checked })}/> Minor aspects (quincunx, semisextile)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.demoMode} onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })}/> Demo Mode (No AI)</label>
        <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={save}>Save locally</button>
      </div>
    </main>
  );
}
