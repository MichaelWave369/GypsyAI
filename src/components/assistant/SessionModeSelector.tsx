import React from 'react';
import { getSessionModeOptions, TiekatSessionModeKey } from '@/lib/tiekat/sessionMode';

export function SessionModeSelector(props: {
  value: TiekatSessionModeKey;
  onChange: (value: TiekatSessionModeKey) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-400" data-testid="session-mode-selector">
      Ritual Session Mode
      <select
        className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as TiekatSessionModeKey)}
      >
        {getSessionModeOptions().map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
