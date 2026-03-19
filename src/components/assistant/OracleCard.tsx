import React from 'react';
import { TiekatOraclePresentation } from '@/lib/tiekat/oraclePresentation';
import { SectionLabel } from './SectionLabel';

export function OracleCard({ oracle }: { oracle: TiekatOraclePresentation }) {
  return (
    <section className="rounded border border-zinc-700 p-2 text-sm" data-testid="oracle-card">
      <SectionLabel>Oracle</SectionLabel>
      <p className="font-semibold">{oracle.headline}</p>
      <p>{oracle.narrative}</p>
      <p className="text-xs text-zinc-400">{oracle.trend}</p>
      {oracle.drift ? <p className="text-xs text-zinc-400">{oracle.drift}</p> : null}
      {oracle.masterActionFraming ? <p className="text-xs text-zinc-400">{oracle.masterActionFraming}</p> : null}
      <p className="text-xs text-zinc-500">{oracle.footer}</p>
    </section>
  );
}
