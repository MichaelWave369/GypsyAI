'use client';

import React from 'react';
import { TiekatRitualDeck, TiekatRitualCard, TiekatRitualDeckSummary } from '@/lib/tiekat/ritualDeck';
import { RitualCard } from './RitualCard';

export function RitualDeckPanel(props: {
  deck: TiekatRitualDeck | null;
  summary: TiekatRitualDeckSummary | null;
  onBuildRecentDeck: () => void;
  onBuildSelectedDeck: () => void;
  onExportDeckJson: () => void;
  onExportDeckMarkdown: () => void;
  onExportCard: (card: TiekatRitualCard) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="ritual-deck-panel">
      <p className="font-semibold">Ritual Export Deck</p>
      <p className="text-zinc-500">Build compact local ritual cards from sanitized oracle artifacts. No transcript export by default.</p>
      <div className="flex flex-wrap gap-2 py-2">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildRecentDeck} disabled={props.disabled}>Create Recent Ritual Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildSelectedDeck} disabled={props.disabled}>Create Selected Ritual Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckJson} disabled={!props.deck}>Export Deck JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckMarkdown} disabled={!props.deck}>Export Deck MD</button>
      </div>
      {!props.deck ? <p className="text-zinc-500">No ritual deck generated yet.</p> : null}
      {props.summary ? (
        <p className="text-zinc-500">{props.summary.cardCount} cards • modes: {props.summary.modeKeys.join(', ') || 'none'} • versions: {props.summary.scoringVersions.join(', ') || 'none'}</p>
      ) : null}
      <div className="space-y-2 pt-2">
        {props.deck?.cards.map((card) => <RitualCard key={card.id} card={card} onExport={props.onExportCard} />)}
      </div>
      {props.deck ? <p className="pt-1 text-zinc-500">{props.deck.footer}</p> : null}
    </div>
  );
}
