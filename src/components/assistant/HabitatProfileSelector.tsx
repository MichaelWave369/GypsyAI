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
  note?: string;
  error?: string;
}) {
  return (
    <section className="space-y-2 rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="habitat-profile-selector">
      <p className="font-semibold">Sovereign Habitat Profile</p>
      <p className="text-zinc-500">Local ritual environment presets only (preferences/configuration, no transcript content).</p>
      <label className="text-zinc-400">
        Profile
        <select className="ml-2 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.selectedId} onChange={(e) => props.onSelect(e.target.value)}>
          {props.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
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
        <label className="cursor-pointer rounded border border-zinc-700 px-2 py-1">
          Import JSON
          <input type="file" accept="application/json" className="hidden" onChange={(e) => props.onImport(e.target.files?.[0])} />
        </label>
      </div>
      {props.note ? <p className="text-zinc-500">{props.note}</p> : null}
      {props.error ? <p className="text-xs text-rose-400">{props.error}</p> : null}
      <p className="text-zinc-500">Modeled/theoretical posture is unchanged by profile switching.</p>
    </section>
  );
}
