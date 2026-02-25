'use client';

import { useEffect, useState } from 'react';
import { defaultSettings, loadSettings, saveSettings } from '@/lib/local/settings';

export function OnboardingWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState(loadSettings());

  useEffect(() => {
    setOpen(localStorage.getItem('gypsy-onboarded') !== '1');
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-6" role="dialog" aria-modal="true">
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <h3 className="text-xl text-gold">Welcome to Gypsy AI</h3>
        {step === 1 ? <div className="space-y-2"><p>Choose provider</p><label><input type="radio" checked={settings.demoMode} onChange={() => setSettings({ ...settings, demoMode: true })}/> Demo</label><label className="ml-3"><input type="radio" checked={!settings.demoMode} onChange={() => setSettings({ ...settings, demoMode: false })}/> Ollama</label></div> : null}
        {step === 2 ? <div className="space-y-2"><p>Hermetic profile</p><select value={settings.hermeticMode} onChange={(e)=>setSettings({...settings, hermeticMode:e.target.value as any})} className="rounded border border-zinc-700 bg-zinc-800 p-1"><option value="gd">GD</option><option value="thoth">Thoth</option></select></div> : null}
        {step === 3 ? <div className="space-y-2"><p>Privacy defaults</p><label><input type="checkbox" checked={settings.allowAncestryAi} onChange={(e)=>setSettings({...settings, allowAncestryAi:e.target.checked})}/> Allow ancestry AI (default off recommended)</label></div> : null}
        {step === 4 ? <div className="space-y-2"><p>Orb and zodiac mode</p><input type="number" value={settings.aspectOrb} onChange={(e)=>setSettings({...settings, aspectOrb:Number(e.target.value)})} className="rounded border border-zinc-700 bg-zinc-800 p-1"/><select value={settings.zodiacMode} onChange={(e)=>setSettings({...settings, zodiacMode:e.target.value as any})} className="rounded border border-zinc-700 bg-zinc-800 p-1 ml-2"><option value="tropical">Tropical</option><option value="sidereal">Sidereal</option></select></div> : null}
        <div className="mt-4 flex gap-2">
          {step > 1 ? <button className="rounded border border-zinc-700 px-2" onClick={() => setStep(step - 1)}>Back</button> : null}
          {step < 4 ? <button className="rounded bg-gold px-3 py-1 text-black" onClick={() => setStep(step + 1)}>Next</button> : <button className="rounded bg-gold px-3 py-1 text-black" onClick={() => { saveSettings({ ...defaultSettings, ...settings }); localStorage.setItem('gypsy-onboarded', '1'); setOpen(false); }}>Finish</button>}
        </div>
      </div>
    </div>
  );
}
