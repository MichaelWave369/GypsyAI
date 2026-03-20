'use client';

import React from 'react';
import { TiekatHabitatProfile } from '@/lib/tiekat/habitatProfile';

export function HabitatProfileSelector(props: {
  profiles: TiekatHabitatProfile[];
  selectedId: string;
  profileNameDraft: string;
  profileDescriptionDraft: string;
  onSelect: (id: string) => void;
  onProfileNameDraftChange: (value: string) => void;
  onProfileDescriptionDraftChange: (value: string) => void;
  onApply: () => void;
  onSave: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onImport: (file?: File) => void;
  onTogglePin: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onBuildPinnedDeck: () => void;
  onBuildRecentDeck: () => void;
  onBuildAllDeck: () => void;
  onExportDeckJson: () => void;
  onExportDeckMarkdown: () => void;
  onImportDeck: (file?: File) => void;
  recentDecks?: Array<{
    id: string;
    name: string;
    createdAt: string;
    cardCount: number;
    kind: string;
    savedLabel: string;
    sphereLabel?: string;
    sphereContinuityLabel?: string;
  }>;
  onSelectRecentDeck?: (id: string) => void;
  pendingDeleteDeckId?: string | null;
  onRequestDeleteRecentDeck?: (id: string) => void;
  onCancelDeleteRecentDeck?: () => void;
  onConfirmDeleteRecentDeck?: (id: string) => void;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceLicenseId?: string;
  diffPreview?: { lines: string[]; ancestryFallbackLine?: string } | null;
  transitionSummary?: { headline: string; line: string; fallbackLine?: string } | null;
  transitionChips?: Array<{ key: string; label: string; severity: 'high' | 'medium' | 'low' }>;
  profileUsageSummary?: string;
  profileLastAppliedLabel?: string;
  usageBadge?: string;
  constellationContinuityNote?: string | null;
  constellationTransitionNote?: string | null;
  constellationNodeLabels?: string[];
  sphereLabel?: string | null;
  sphereCaption?: string | null;
  sphereConfidenceNote?: string | null;
  deckSummaryLine?: string | null;
  deckSphereSummaryLine?: string | null;
  deckContinuityNote?: string | null;
  deckContinuityChips?: string[];
  deckPreviewLabels?: string[];
  deckNote?: string;
  deckError?: string;
  note?: string;
  error?: string;
}) {
  const selected = props.profiles.find((profile) => profile.id === props.selectedId) || null;
  const [expandedChipDetails, setExpandedChipDetails] = React.useState(false);
  return (
    <section className="space-y-2 rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="habitat-profile-selector">
      <p className="font-semibold">Sovereign Habitat Profile</p>
      <p className="text-zinc-500">Local ritual environment presets only (preferences/configuration, no transcript content).</p>
      <label className="text-zinc-400">
        Profile
        <select className="ml-2 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.selectedId} onChange={(e) => props.onSelect(e.target.value)}>
          {props.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.pinned ? '📌 ' : ''}{profile.name}</option>)}
        </select>
      </label>
      {selected ? (
        <div className="rounded border border-zinc-700 p-2 text-zinc-400" data-testid="habitat-memory-cues">
          <p className="font-semibold text-zinc-300">Habitat memory</p>
          {props.profileLastAppliedLabel ? <p>{props.profileLastAppliedLabel}</p> : <p>Never applied</p>}
          {props.profileUsageSummary ? <p>{props.profileUsageSummary}</p> : null}
          {props.usageBadge ? <p className="text-[10px] uppercase tracking-wide text-zinc-500">{props.usageBadge}</p> : null}
        </div>
      ) : null}
      <label className="block text-zinc-400">
        Name
        <input
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          value={props.profileNameDraft}
          maxLength={48}
          onChange={(e) => props.onProfileNameDraftChange(e.target.value)}
        />
      </label>
      <label className="block text-zinc-400">
        Description
        <input
          className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1"
          value={props.profileDescriptionDraft}
          maxLength={180}
          onChange={(e) => props.onProfileDescriptionDraftChange(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onApply}>Apply</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onSave}>Save New</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onUpdate}>Update</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onDelete}>Delete</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExport}>Export JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onTogglePin}>{selected?.pinned ? 'Unpin' : 'Pin'}</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onMoveUp}>Move Up</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onMoveDown}>Move Down</button>
        <label className="cursor-pointer rounded border border-zinc-700 px-2 py-1">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={(e) => props.onImport(e.target.files?.[0])} />
        </label>
      </div>
      {props.recentDecks?.length ? (
        <div className="rounded border border-zinc-700 p-2 text-zinc-400" data-testid="habitat-recent-decks">
          <p className="font-semibold text-zinc-300">Recent habitat decks</p>
          <ul className="space-y-1">
            {props.recentDecks.slice(0, 5).map((deck) => (
              <li key={deck.id} className="flex items-center gap-1">
                <button className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]" onClick={() => props.onSelectRecentDeck?.(deck.id)}>
                  Open
                </button>
                {props.pendingDeleteDeckId === deck.id ? (
                  <>
                    <button className="rounded border border-rose-500 px-1 py-0.5 text-[10px]" onClick={() => props.onConfirmDeleteRecentDeck?.(deck.id)}>
                      Confirm
                    </button>
                    <button className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]" onClick={() => props.onCancelDeleteRecentDeck?.()}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]" onClick={() => props.onRequestDeleteRecentDeck?.(deck.id)}>
                    Delete
                  </button>
                )}
                <span className="text-[10px]">{deck.name} ({deck.kind}, {deck.cardCount}) • {deck.savedLabel}</span>
                {deck.sphereLabel ? <span className="text-[10px] text-zinc-600">{deck.sphereLabel}</span> : null}
                {deck.sphereContinuityLabel ? <span className="text-[10px] text-zinc-600">{deck.sphereContinuityLabel}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildPinnedDeck}>Pinned Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildRecentDeck}>Recent Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onBuildAllDeck}>All Deck</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckJson}>Export Deck JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExportDeckMarkdown}>Export Deck Markdown</button>
        <label className="cursor-pointer rounded border border-zinc-700 px-2 py-1">
          Import Deck JSON
          <input type="file" accept="application/json" className="hidden" onChange={(e) => props.onImportDeck(e.target.files?.[0])} />
        </label>
      </div>
      {props.diffPreview?.lines.length || props.diffPreview?.ancestryFallbackLine ? (
        <div className="rounded border border-zinc-700 p-2 text-zinc-400" data-testid="habitat-diff-preview">
          <p className="font-semibold">This profile will change:</p>
          <ul className="list-disc pl-4">
            {props.diffPreview?.lines.slice(0, 10).map((line) => <li key={line}>{line}</li>)}
          </ul>
          {props.diffPreview?.ancestryFallbackLine ? <p className="pt-1 text-zinc-500">{props.diffPreview.ancestryFallbackLine}</p> : null}
        </div>
      ) : null}
      {props.transitionSummary ? (
        <div className="rounded border border-zinc-700 p-2 text-zinc-400" data-testid="habitat-transition-summary">
          <p className="font-semibold">{props.transitionSummary.headline}</p>
          <p>{props.transitionSummary.line}</p>
          {props.transitionSummary.fallbackLine ? <p className="text-zinc-500">{props.transitionSummary.fallbackLine}</p> : null}
          {props.transitionChips?.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {(expandedChipDetails ? props.transitionChips : props.transitionChips.slice(0, 5)).map((chip) => (
                <span key={chip.key} className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]">{chip.label}</span>
              ))}
            </div>
          ) : null}
          {props.transitionChips?.length ? (
            <button className="mt-1 rounded border border-zinc-700 px-1 py-0.5 text-[10px]" onClick={() => setExpandedChipDetails((value) => !value)}>
              {expandedChipDetails ? 'Compact chip view' : 'Expand chip details'}
            </button>
          ) : null}
        </div>
      ) : null}
      {props.constellationContinuityNote ? <p className="text-zinc-500">{props.constellationContinuityNote}</p> : null}
      {props.constellationTransitionNote ? <p className="text-zinc-500">{props.constellationTransitionNote}</p> : null}
      {props.constellationNodeLabels?.length ? (
        <p className="text-[10px] text-zinc-600">Constellation: {props.constellationNodeLabels.slice(0, 4).join(' • ')}</p>
      ) : null}
      {props.sphereLabel ? <p className="text-[10px] text-zinc-500">Modeled habitat sphere signature: {props.sphereLabel}</p> : null}
      {props.sphereCaption ? <p className="text-zinc-500">{props.sphereCaption}</p> : null}
      {props.sphereConfidenceNote ? <p className="text-[10px] text-zinc-600">{props.sphereConfidenceNote}</p> : null}
      {props.deckSummaryLine ? <p className="text-zinc-500">{props.deckSummaryLine}</p> : null}
      {props.deckSphereSummaryLine ? <p className="text-[10px] text-zinc-600">{props.deckSphereSummaryLine}</p> : null}
      {props.deckContinuityNote ? <p className="text-[10px] text-zinc-600">{props.deckContinuityNote}</p> : null}
      {props.deckContinuityChips?.length ? (
        <div className="flex flex-wrap gap-1" data-testid="habitat-deck-continuity-chips">
          {props.deckContinuityChips.slice(0, 4).map((chip) => (
            <span key={chip} className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]">{chip}</span>
          ))}
        </div>
      ) : null}
      {props.deckPreviewLabels?.length ? <p className="text-[10px] text-zinc-600">Deck cards: {props.deckPreviewLabels.slice(0, 4).join(' • ')}</p> : null}
      {props.deckNote ? <p className="text-zinc-500">{props.deckNote}</p> : null}
      {props.deckError ? <p className="text-xs text-rose-400">{props.deckError}</p> : null}
      {props.note ? <p className="text-zinc-500">{props.note}</p> : null}
      {props.error ? <p className="text-xs text-rose-400">{props.error}</p> : null}
      <p className="text-zinc-500">Shortcuts: Alt+Shift+P (pin), Alt+Shift+↑/↓ (reorder), Alt+Shift+A (apply).</p>
      <p className="text-zinc-500">Modeled/theoretical posture is unchanged by profile switching.</p>
      {props.sourceLabel && props.sourceUrl ? (
        <p className="text-[10px] text-zinc-600">
          <a href={props.sourceUrl} target="_blank" rel="noreferrer" className="underline">{props.sourceLabel}</a>
          {props.sourceLicenseId ? ` • ${props.sourceLicenseId}` : ''}
        </p>
      ) : null}
    </section>
  );
}
