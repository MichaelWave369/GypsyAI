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
  diffPreview?: { lines: string[]; ancestryFallbackLine?: string } | null;
  transitionSummary?: { headline: string; line: string; fallbackLine?: string } | null;
  transitionChips?: Array<{ key: string; label: string; severity: 'high' | 'medium' | 'low' }>;
  note?: string;
  error?: string;
}) {
  const selected = props.profiles.find((profile) => profile.id === props.selectedId) || null;
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
              {props.transitionChips.slice(0, 5).map((chip) => (
                <span key={chip.key} className="rounded border border-zinc-700 px-1 py-0.5 text-[10px]">{chip.label}</span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {props.note ? <p className="text-zinc-500">{props.note}</p> : null}
      {props.error ? <p className="text-xs text-rose-400">{props.error}</p> : null}
      <p className="text-zinc-500">Shortcuts: Alt+Shift+P (pin), Alt+Shift+↑/↓ (reorder), Alt+Shift+A (apply).</p>
      <p className="text-zinc-500">Modeled/theoretical posture is unchanged by profile switching.</p>
    </section>
  );
}
