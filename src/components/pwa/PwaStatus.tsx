'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadSettings } from '@/lib/local/settings';

export function PwaStatus() {
  const [online, setOnline] = useState(true);
  const [demo, setDemo] = useState(false);
  const isWebDriver = useMemo(() => typeof navigator !== 'undefined' && navigator.webdriver === true, []);

  useEffect(() => {
    if (isWebDriver) return;
    setOnline(navigator.onLine);
    setDemo(loadSettings().demoMode);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [isWebDriver]);

  if (isWebDriver) return null;
  return <span className="text-xs text-zinc-400">{online ? 'Online' : 'Offline'} · {demo ? 'Demo Mode' : 'AI Mode'}</span>;
}
