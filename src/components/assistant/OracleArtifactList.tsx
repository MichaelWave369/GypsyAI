import React from 'react';
import { TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';

export function OracleArtifactList(props: {
  artifacts: TiekatOracleArtifact[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2 rounded border border-zinc-700 p-2" data-testid="oracle-artifact-panel">
      <p className="text-xs uppercase tracking-wide text-zinc-400">Recent Oracle Sessions</p>
      {!props.artifacts.length ? <p className="text-xs text-zinc-500">No local oracle artifacts yet.</p> : null}
      {props.artifacts.map((artifact) => (
        <button
          key={artifact.id}
          className={`block w-full rounded border p-2 text-left ${artifact.id === props.selectedId ? 'border-gold text-gold' : 'border-zinc-700'}`}
          onClick={() => props.onSelect(artifact.id)}
        >
          <p className="text-xs">{new Date(artifact.timestamp).toLocaleString()}</p>
          <p className="text-xs text-zinc-400">{artifact.route} • {artifact.activeModules.join(', ')}</p>
          <p className="text-xs text-zinc-400">{artifact.sessionMode.label}</p>
          <p className="text-xs text-zinc-400">I={artifact.gravity.informationIntegral.toFixed(3)}, Δg={artifact.gravity.deltaGPredicted.toExponential(2)}</p>
        </button>
      ))}
    </div>
  );
}
