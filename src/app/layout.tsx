import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { ChatOrb } from '@/components/ChatOrb';
import { PwaStatus } from '@/components/pwa/PwaStatus';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { SwRegister } from '@/components/pwa/SwRegister';
import { OnboardingWizard } from '@/components/OnboardingWizard';

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
        <footer className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-400">
          <span>Gypsy AI v0.1.4</span>
          <div className="flex items-center gap-2"><PwaStatus /><InstallPrompt /></div>
        </footer>
        <SwRegister />
        <OnboardingWizard />
        <ChatOrb />
      </body>
    </html>
  );
}
