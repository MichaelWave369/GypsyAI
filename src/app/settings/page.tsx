'use client';

import { useEffect, useState } from 'react';
import { AppSettings, defaultSettings, loadSettings, saveSettings } from '@/lib/local/settings';

const BoolRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-2"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
);

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  useEffect(() => setSettings(loadSettings()), []);

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Settings</h2>
      <div className="panel grid gap-3 md:max-w-3xl text-sm">
        <label>Provider <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value as AppSettings['provider'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="ollama">Ollama</option><option value="openai">OpenAI</option></select></label>
        <label>Model <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1" /></label>
        <label>Zodiac mode <select value={settings.zodiacMode} onChange={(e) => setSettings({ ...settings, zodiacMode: e.target.value as AppSettings['zodiacMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="tropical">Tropical</option><option value="sidereal">Sidereal</option></select></label>
        <label>Gene Keys guide <select value={settings.geneKeysGuideMode} onChange={(e) => setSettings({ ...settings, geneKeysGuideMode: e.target.value as AppSettings['geneKeysGuideMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="contemplation">Contemplation Guide</option><option value="direct">Direct Summary</option></select></label>
        <BoolRow label="Accuracy Mode" value={settings.accuracyMode} onChange={(v) => setSettings({ ...settings, accuracyMode: v })} />
        <label>Accuracy passes <select value={settings.accuracyPasses} onChange={(e) => setSettings({ ...settings, accuracyPasses: Number(e.target.value) as 1|2|3 })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label>
        <label>Temperature <select value={settings.temperaturePreset} onChange={(e) => setSettings({ ...settings, temperaturePreset: e.target.value as 'low'|'med' })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="low">Low</option><option value="med">Med</option></select></label>
        <BoolRow label="Demo Mode (No AI)" value={settings.demoMode} onChange={(v) => setSettings({ ...settings, demoMode: v })} />

        <h3 className="mt-3 font-semibold text-gold">Ancestry privacy</h3>
        <BoolRow label="Hide living persons" value={settings.hideLivingPersons} onChange={(v) => setSettings({ ...settings, hideLivingPersons: v })} />
        <BoolRow label="Allow AI to use ancestry data in readings" value={settings.allowAncestryAi} onChange={(v) => setSettings({ ...settings, allowAncestryAi: v })} />
        <BoolRow label="Include names in AI context" value={settings.includeNamesInAiContext} onChange={(v) => setSettings({ ...settings, includeNamesInAiContext: v })} />

        <h3 className="mt-3 font-semibold text-gold">Assistant</h3>
        <BoolRow label="Strict reading mode" value={settings.strictReadingMode} onChange={(v) => setSettings({ ...settings, strictReadingMode: v })} />
        <BoolRow label="Casual chat mode" value={settings.casualChatMode} onChange={(v) => setSettings({ ...settings, casualChatMode: v })} />
        <BoolRow label="Auto-switch to reading mode when asked" value={settings.autoSwitchReadingMode} onChange={(v) => setSettings({ ...settings, autoSwitchReadingMode: v })} />
        <BoolRow label="Enable floating Chat Orb" value={settings.enableChatOrb} onChange={(v) => setSettings({ ...settings, enableChatOrb: v })} />
        <BoolRow label="Use birth profile in assistant context" value={settings.useBirthProfileInAssistant} onChange={(v) => setSettings({ ...settings, useBirthProfileInAssistant: v })} />
        <BoolRow label="Use past sessions in assistant context" value={settings.useSessionsInAssistant} onChange={(v) => setSettings({ ...settings, useSessionsInAssistant: v })} />

        <h3 className="mt-3 font-semibold text-gold">Connectors</h3>
        <BoolRow label="FamilySearch connector (coming soon; feature-flag only)" value={settings.familySearchConnectorEnabled} onChange={(v) => setSettings({ ...settings, familySearchConnectorEnabled: v })} />
        <p className="text-xs text-zinc-400">Live FamilySearch integration is disabled in v1.3.</p>

        <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={() => saveSettings({ ...settings, noNewCorrespondences: true })}>Save locally</button>
      </div>
    </main>
  );
}
