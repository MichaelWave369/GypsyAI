import React from 'react';
import { TiekatGeometryState } from '@/lib/tiekat/sacredGeometry';

export function SacredGeometryGlyph({ state }: { state: TiekatGeometryState }) {
  return (
    <figure className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="sacred-geometry">
      <svg viewBox="0 0 100 100" className="h-28 w-full" role="img" aria-label={state.caption}>
        {state.layers.map((layer) => (
          <circle
            key={layer.radius}
            cx="50"
            cy="50"
            r={layer.radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={layer.opacity}
            strokeWidth={layer.weight}
          />
        ))}
        {state.glyph === 'triad' ? <polygon points="50,18 20,76 80,76" fill="none" stroke="currentColor" strokeWidth="1.4" /> : null}
        {state.glyph === 'hex_field' ? <polygon points="50,15 75,30 75,60 50,75 25,60 25,30" fill="none" stroke="currentColor" strokeWidth="1.4" /> : null}
        {state.glyph === 'spiral' ? <path d="M50 50 m0 -30 a30 30 0 1 1 -0.1 0 m0 -10 a40 40 0 1 0 0.1 0" fill="none" stroke="currentColor" strokeWidth="1" /> : null}
      </svg>
      <figcaption>{state.caption}</figcaption>
    </figure>
  );
}
