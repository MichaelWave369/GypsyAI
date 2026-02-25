'use client';

import { useEffect, useState } from 'react';
import { loadSettings } from '@/lib/local/settings';

export function PwaStatus() {
  const [online, setOnline] = useState(true);
  const [demo, setDemo] = useState(false);
  useEffect(() => {
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
  }, []);
  return <span className="text-xs text-zinc-400">{online ? 'Online' : 'Offline'} · {demo ? 'Demo Mode' : 'AI Mode'}</span>;
}
