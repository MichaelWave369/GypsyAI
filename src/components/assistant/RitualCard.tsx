'use client';

import React from 'react';
import { TiekatRitualCard } from '@/lib/tiekat/ritualDeck';

export function RitualCard(props: {
  card: TiekatRitualCard;
  onExport: (card: TiekatRitualCard) => void;
}) {
  const { card } = props;
  return (
    <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="ritual-card">
      <p className="font-semibold">{card.oracleHeadline}</p>
      <p className="text-zinc-400">{new Date(card.timestamp).toLocaleString()} • {card.sessionMode.label}</p>
      <p className="text-zinc-400">Glyph: {card.sacredGeometry.glyph} • I={card.gravity.informationIntegral.toFixed(3)} • Δg={card.gravity.deltaGPredicted.toExponential(2)}</p>
      {card.v56 ? <p className="text-zinc-400">Sphere {card.v56.awakeningState} • shield {card.v56.shieldStatus} • glyph {card.v56.glyphFamily}</p> : null}
      {card.v56 ? <p className="text-zinc-500">{card.v56.sphereCaption}</p> : null}
      <p className="text-zinc-400">{card.responseSummary}</p>
      <button className="mt-1 rounded border border-zinc-700 px-2 py-1" onClick={() => props.onExport(card)}>Export Ritual Card JSON</button>
      <p className="pt-1 text-zinc-500">{card.footer}</p>
    </div>
  );
}
