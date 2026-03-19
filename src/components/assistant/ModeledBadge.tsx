import React from 'react';
export function ModeledBadge({ text }: { text: string }) {
  return <p className="text-xs text-zinc-400">{text} (modeled/theoretical)</p>;
}
