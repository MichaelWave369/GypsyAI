import React from 'react';
export function SectionLabel({ children }: { children: string }) {
  return <p className="text-xs uppercase tracking-wide text-zinc-400">{children}</p>;
}
