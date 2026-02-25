'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadSettings } from '@/lib/local/settings';

export function ChatOrb() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(loadSettings().enableChatOrb), []);
  if (!enabled) return null;
  return <Link href="/assistant" className="fixed bottom-5 right-5 rounded-full border border-gold bg-zinc-900 px-4 py-3 text-gold shadow-lg">Chat Orb</Link>;
}
