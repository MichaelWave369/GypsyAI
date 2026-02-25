'use client';

import { useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted'|'dismissed' }> }

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const isWebDriver = useMemo(() => typeof navigator !== 'undefined' && navigator.webdriver === true, []);

  useEffect(() => {
    if (isWebDriver) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isWebDriver]);

  if (isWebDriver || !evt) return null;
  return <button className="rounded border border-zinc-700 px-2 py-1 text-xs" onClick={async ()=>{await evt.prompt(); setEvt(null);}}>Install App</button>;
}
