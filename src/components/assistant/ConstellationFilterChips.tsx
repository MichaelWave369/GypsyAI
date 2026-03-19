import React from 'react';
import { TiekatConstellationFilterOptions, TiekatConstellationFilterState } from '@/lib/tiekat/oracleConstellation';

export function ConstellationFilterChips(props: {
  options: TiekatConstellationFilterOptions;
  value: TiekatConstellationFilterState;
  onChange: (next: TiekatConstellationFilterState) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400" data-testid="constellation-filters">
      <label>
        Mode
        <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.value.mode} onChange={(e) => props.onChange({ ...props.value, mode: e.target.value })}>
          <option value="all">all</option>
          {props.options.modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </label>
      <label>
        Version
        <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.value.scoringVersion} onChange={(e) => props.onChange({ ...props.value, scoringVersion: e.target.value })}>
          <option value="all">all</option>
          {props.options.scoringVersions.map((version) => <option key={version} value={version}>{version}</option>)}
        </select>
      </label>
      <label>
        Shift
        <select className="ml-1 rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5" value={props.value.shiftType} onChange={(e) => props.onChange({ ...props.value, shiftType: e.target.value as TiekatConstellationFilterState['shiftType'] })}>
          <option value="all">all</option>
          {props.options.shiftTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <button className="rounded border border-zinc-700 px-2 py-0.5" onClick={props.onReset}>Reset</button>
    </div>
  );
}
