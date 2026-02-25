import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { ChatOrb } from '@/components/ChatOrb';

export const metadata: Metadata = {
  title: 'Gypsy AI',
  description: 'Hermetic Tarot + Astrology + Gene Keys + Ancestral Memory with local-first AI'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="mx-auto max-w-6xl p-6">
        <header className="mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold text-gold">Gypsy AI</h1>
          <p className="text-sm text-zinc-300">Hermetic oracle with ancestry memory and conversational assistant</p>
          <Nav />
        </header>
        {children}
        <ChatOrb />
      </body>
    </html>
  );
}
