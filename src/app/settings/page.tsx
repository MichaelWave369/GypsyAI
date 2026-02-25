'use client';

import { useEffect, useRef, useState } from 'react';
import { AppSettings, defaultSettings, loadSettings, saveSettings } from '@/lib/local/settings';
import { dbHealthCheck, exportBackup, restoreBackup } from '@/lib/local/db';

const BoolRow = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex items-center gap-2"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>
);

interface ProviderStatus {
  openai: boolean;
  anthropic: boolean;
  xai: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [diag, setDiag] = useState<any>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({ openai: false, anthropic: false, xai: false });
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const pendingRestore = useRef<string>('');

  useEffect(() => {
    setSettings(loadSettings());
    dbHealthCheck().then(setDiag).catch(() => setDiag({ ok: false }));
    fetch('/api/providers/status').then((r) => r.json()).then(setProviderStatus).catch(() => setProviderStatus({ openai: false, anthropic: false, xai: false }));
  }, []);

  const doBackup = async () => {
    const text = await exportBackup(encrypt, password || undefined);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gypsy-ai-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onRestoreFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    pendingRestore.current = text;
    const parsed = JSON.parse(text);
    const candidate = parsed.encrypted ? { encrypted: true } : parsed;
    setRestorePreview({
      schemaVersion: candidate.schemaVersion ?? 'unknown',
      hasData: Boolean(candidate.data)
    });
  };

  const confirmRestore = async () => {
    if (!pendingRestore.current) return;
    await restoreBackup(pendingRestore.current, password || undefined);
    alert('Restore complete. Reload app to ensure all modules reflect latest local data.');
  };

  const keyLabel = (ok: boolean) => (ok ? 'API key detected' : 'missing');

  return (
    <main className="space-y-4">
      <h2 className="text-2xl text-gold">Settings</h2>
      <div className="panel grid gap-3 md:max-w-3xl text-sm">
        <p className="text-xs text-zinc-400">App version: 0.1.4</p>
        <p className="text-xs text-zinc-400">DB health: {diag?.ok ? 'OK' : 'Unknown'} ({diag?.name || 'n/a'} v{diag?.version || 'n/a'})</p>

        <label>
          Provider
          <select value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value as AppSettings['provider'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1">
            <option value="ollama">Ollama</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Claude (Anthropic)</option>
            <option value="xai">Grok (xAI)</option>
          </select>
        </label>

        <label>Model <input value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1" /></label>

        <div className="rounded border border-zinc-700 p-2 text-xs">
          <p className="font-semibold text-gold">Provider status</p>
          <p>OpenAI: {keyLabel(providerStatus.openai)}</p>
          <p>Claude: {keyLabel(providerStatus.anthropic)}</p>
          <p>Grok: {keyLabel(providerStatus.xai)}</p>
        </div>

        <label>Zodiac mode <select value={settings.zodiacMode} onChange={(e) => setSettings({ ...settings, zodiacMode: e.target.value as AppSettings['zodiacMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="tropical">Tropical</option><option value="sidereal">Sidereal</option></select></label>
        <label>Gene Keys guide <select value={settings.geneKeysGuideMode} onChange={(e) => setSettings({ ...settings, geneKeysGuideMode: e.target.value as AppSettings['geneKeysGuideMode'] })} className="ml-2 rounded border border-zinc-700 bg-zinc-800 p-1"><option value="contemplation">Contemplation Guide</option><option value="direct">Direct Summary</option></select></label>
        <BoolRow label="Accuracy Mode" value={settings.accuracyMode} onChange={(v) => setSettings({ ...settings, accuracyMode: v })} />
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

        <h3 className="mt-3 font-semibold text-gold">Backup & Restore</h3>
        <BoolRow label="Encrypt backup with password (WebCrypto AES-GCM)" value={encrypt} onChange={setEncrypt} />
        {encrypt ? <input aria-label="backup-password" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded border border-zinc-700 bg-zinc-800 p-1" /> : null}
        <div className="flex gap-2">
          <button className="rounded border border-zinc-700 px-2" onClick={doBackup}>Export full backup</button>
          <input type="file" accept="application/json" onChange={(e) => onRestoreFile(e.target.files?.[0])} />
          <button className="rounded border border-zinc-700 px-2" onClick={confirmRestore}>Confirm restore (overwrite)</button>
        </div>
        {restorePreview ? <p className="text-xs text-zinc-400">Restore preview: schema {String(restorePreview.schemaVersion)}, data present: {String(restorePreview.hasData)}</p> : null}

        <h3 className="mt-3 font-semibold text-gold">Connectors</h3>
        <BoolRow label="FamilySearch connector (coming soon; feature-flag only)" value={settings.familySearchConnectorEnabled} onChange={(v) => setSettings({ ...settings, familySearchConnectorEnabled: v })} />
        <p className="text-xs text-zinc-400">Live FamilySearch integration is disabled in v1.4.</p>

        <div className="flex gap-2">
          <button className="rounded bg-gold px-3 py-2 font-semibold text-black" onClick={() => saveSettings({ ...settings, noNewCorrespondences: true })}>Save locally</button>
          <button className="rounded border border-zinc-700 px-3 py-2" onClick={() => { localStorage.removeItem('gypsy-onboarded'); location.reload(); }}>Reset onboarding</button>
        </div>
      </div>
    </main>
  );
}
