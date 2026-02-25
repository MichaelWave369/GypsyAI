'use client';

import { useEffect, useState } from 'react';
import { AppSettings, defaultSettings, loadSettings, saveSettings } from '@/lib/local/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  useEffect(() => setSettings(loadSettings()), []);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">AI + Accuracy + Hermetic Settings</h2>
      <div className="panel grid gap-3 md:max-w-2xl text-sm">
        <label>Provider <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value as AppSettings['provider'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="ollama">Ollama</option><option value="openai">OpenAI</option></select></label>
        <label>Model <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1" /></label>
        <label>Zodiac mode <select value={settings.zodiacMode} onChange={(e) => setSettings({ ...settings, zodiacMode: e.target.value as AppSettings['zodiacMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="tropical">Tropical</option><option value="sidereal">Sidereal</option></select></label>
        <label>Reading style <select value={settings.readingStyle} onChange={(e) => setSettings({ ...settings, readingStyle: e.target.value as AppSettings['readingStyle'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option>Direct</option><option>Gentle</option><option>Ritual</option></select></label>
        <label>Gene Keys guide <select value={settings.geneKeysGuideMode} onChange={(e) => setSettings({ ...settings, geneKeysGuideMode: e.target.value as AppSettings['geneKeysGuideMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="contemplation">Contemplation Guide</option><option value="direct">Direct Summary</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.accuracyMode} onChange={(e) => setSettings({ ...settings, accuracyMode: e.target.checked })} /> Accuracy Mode</label>
        <label>Accuracy passes <select value={settings.accuracyPasses} onChange={(e) => setSettings({ ...settings, accuracyPasses: Number(e.target.value) as 1|2|3 })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value={1}>1 fast</option><option value={2}>2 default</option><option value={3}>3 strict</option></select></label>
        <label>Temperature preset <select value={settings.temperaturePreset} onChange={(e) => setSettings({ ...settings, temperaturePreset: e.target.value as 'low'|'med' })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="low">Low</option><option value="med">Med</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.demoMode} onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })} /> Demo Mode (No AI)</label>
        <p>No new correspondences hard rule: ON</p>
        <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={() => saveSettings({ ...settings, noNewCorrespondences: true })}>Save locally</button>
      </div>
    </main>
  );
}
