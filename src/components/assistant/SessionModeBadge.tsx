import React from 'react';

export function SessionModeBadge({ label }: { label: string }) {
  return <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">{label}</span>;
}
