import React from 'react';
import { TiekatPromptPresetGroup } from '@/lib/tiekat/promptPresets';

export function PromptPresetChips(props: {
  group: TiekatPromptPresetGroup;
  onChoose: (text: string) => void;
}) {
  return (
    <div className="space-y-1 rounded border border-zinc-700 p-2" data-testid="prompt-presets">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{props.group.title}</p>
      <div className="flex flex-wrap gap-1">
        {props.group.presets.map((preset) => (
          <button
            key={preset.id}
            className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300"
            onClick={() => props.onChoose(preset.text)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
