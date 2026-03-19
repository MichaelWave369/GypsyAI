import React from 'react';
import { TiekatConstellationState } from '@/lib/tiekat/oracleConstellation';

export function OracleConstellation({ state }: { state: TiekatConstellationState }) {
  const nodeById = Object.fromEntries(state.nodes.map((node) => [node.id, node]));
  return (
    <figure className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="oracle-constellation">
      <svg viewBox="0 0 100 70" className="h-28 w-full" role="img" aria-label={state.caption}>
        {state.edges.map((edge) => {
          const from = nodeById[edge.from];
          const to = nodeById[edge.to];
          if (!from || !to) return null;
          const dash = edge.type === 'continuity' ? '0' : '2 2';
          return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeDasharray={dash} strokeOpacity="0.6" />;
        })}
        {state.nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.intensityBucket === 'high' ? 3.5 : node.intensityBucket === 'medium' ? 2.8 : 2.2}
            fill="currentColor"
            fillOpacity={node.v55 ? 0.9 : 0.65}
          />
        ))}
      </svg>
      <figcaption>{state.caption}</figcaption>
    </figure>
  );
}
