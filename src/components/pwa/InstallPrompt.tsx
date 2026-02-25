'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted'|'dismissed' }> }

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!evt) return null;
  return <button className="rounded border border-zinc-700 px-2 py-1 text-xs" onClick={async ()=>{await evt.prompt(); setEvt(null);}}>Install App</button>;
}
