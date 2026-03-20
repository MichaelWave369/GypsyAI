'use client';

import React from 'react';
import {
  TiekatRitualDeck,
  TiekatRitualCard,
  TiekatRitualDeckSummary,
  TiekatRitualDeckFilterOptions,
  TiekatRitualDeckFilterState
} from '@/lib/tiekat/ritualDeck';
import { RitualCard } from './RitualCard';

export function RitualDeckPanel(props: {
  deck: TiekatRitualDeck | null;
  summary: TiekatRitualDeckSummary | null;
  onBuildRecentDeck: () => void;
  onBuildSelectedDeck: () => void;
  onBuildFilteredDeck: () => void;
  onExportDeckJson: () => void;
  onExportDeckMarkdown: () => void;
  onExportCard: (card: TiekatRitualCard) => void;
  onImportDeck: (file?: File) => void;
  onSelectDeck: (deckId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  filterOptions: TiekatRitualDeckFilterOptions;
  filters: TiekatRitualDeckFilterState;
  onFiltersChange: (next: TiekatRitualDeckFilterState) => void;
  recentDecks: TiekatRitualDeck[];
  disabled?: boolean;
}) {
  return (
    <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="ritual-deck-panel">
      <p className="font-semibold">Ritual Export Deck</p>
      <p className="text-zinc-500">Build compact local ritual cards from sanitized oracle artifacts. No transcript export by default.</p>
      <div className="flex flex-wrap gap-2 py-2">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildRecentDeck} disabled={props.disabled}>Create Recent Ritual Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildSelectedDeck} disabled={props.disabled}>Create Selected Ritual Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildFilteredDeck} disabled={props.disabled}>Create Filtered Ritual Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckJson} disabled={!props.deck}>Export Deck JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckMarkdown} disabled={!props.deck}>Export Deck MD</button>
      </div>
      <div className="flex flex-wrap gap-2 text-zinc-400">
        <label>
          Mode
          <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.filters.mode} onChange={(e) => props.onFiltersChange({ ...props.filters, mode: e.target.value })}>
            <option value="all">all</option>
            {props.filterOptions.modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>
        </label>
        <label>
          Version
          <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.filters.scoringVersion} onChange={(e) => props.onFiltersChange({ ...props.filters, scoringVersion: e.target.value })}>
            <option value="all">all</option>
            {props.filterOptions.scoringVersions.map((version) => <option key={version} value={version}>{version}</option>)}
          </select>
        </label>
        <label>
          Window
          <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.filters.timeWindow} onChange={(e) => props.onFiltersChange({ ...props.filters, timeWindow: e.target.value as TiekatRitualDeckFilterState['timeWindow'] })}>
            {props.filterOptions.timeWindows.map((windowValue) => <option key={windowValue} value={windowValue}>{windowValue}</option>)}
          </select>
        </label>
      </div>
      <input className="pt-1" type="file" accept="application/json" onChange={(e) => props.onImportDeck(e.target.files?.[0])} />
      {!props.deck ? <p className="text-zinc-500">No ritual deck generated yet.</p> : null}
      {props.summary ? (
        <>
          <p className="text-zinc-500">{props.summary.cardCount} cards • modes: {props.summary.modeKeys.join(', ') || 'none'} • versions: {props.summary.scoringVersions.join(', ') || 'none'}</p>
          {props.summary.continuityNote ? <p className="text-[10px] text-zinc-600">{props.summary.continuityNote}</p> : null}
          {props.summary.continuityChips?.length ? (
            <div className="flex flex-wrap gap-1" data-testid="ritual-deck-continuity-chips">
              {props.summary.continuityChips.map((chip) => (
                <span key={chip} className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]">{chip}</span>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
      {props.recentDecks.length ? (
        <div className="space-y-1 rounded border border-zinc-700 p-2" data-testid="ritual-deck-list">
          <p className="text-zinc-500">Recent Ritual Decks</p>
          {props.recentDecks.map((deck) => (
            <div className="flex items-center gap-1" key={deck.id}>
              <button className="rounded border border-zinc-700 px-2 py-0.5" onClick={() => props.onSelectDeck(deck.id)}>{deck.title}</button>
              <button className="rounded border border-zinc-700 px-2 py-0.5" onClick={() => props.onDeleteDeck(deck.id)}>Delete</button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="space-y-2 pt-2">
        {props.deck?.cards.map((card) => <RitualCard key={card.id} card={card} onExport={props.onExportCard} />)}
      </div>
      {props.deck ? <p className="pt-1 text-zinc-500">{props.deck.footer}</p> : null}
    </div>
  );
}
