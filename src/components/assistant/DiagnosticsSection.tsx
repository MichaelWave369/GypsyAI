import React from 'react';
import { TiekatGravityHistoryEntry } from '@/lib/tiekat/schema';
import { SectionLabel } from './SectionLabel';

export function DiagnosticsSection(props: {
  gravityTrend: string;
  recentGravity: TiekatGravityHistoryEntry[];
  sparklinePoints: string;
  versionState?: { versionCount: number; state: string; drift?: { from: string; to: string; informationIntegralDrift: number; deltaGDrift: number } | null } | null;
  scoringVersion: string;
  gravityDiagnostics: string;
}) {
  return (
    <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="diagnostics-section">
      <SectionLabel>Diagnostics</SectionLabel>
      <p>Recent modeled gravity trend: {props.gravityTrend}</p>
      {props.recentGravity.length ? (
        <>
          <p>Recent snapshots: {props.recentGravity.map((row) => `${row.deltaGPredicted.toExponential(2)}@${new Date(row.timestamp).toLocaleTimeString()}`).join(' | ')}</p>
          <svg viewBox="0 0 100 40" className="h-10 w-full" role="img" aria-label="Modeled gravity sparkline">
            <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={props.sparklinePoints} />
          </svg>
        </>
      ) : (
        <p>No local gravity history yet.</p>
      )}
      {props.versionState ? <p className="rounded border border-zinc-600 px-2 py-1">Version Comparison • current {props.scoringVersion} • versions {props.versionState.versionCount} • state {props.versionState.state} (modeled/theoretical)</p> : null}
      {props.versionState?.state === 'drift_detected' && props.versionState.drift ? <p>Drift: {props.versionState.drift.from} → {props.versionState.drift.to}, ΔI {props.versionState.drift.informationIntegralDrift.toFixed(4)}, ΔΔg {props.versionState.drift.deltaGDrift.toExponential(2)}</p> : null}
      {props.gravityDiagnostics ? <pre className="whitespace-pre-wrap">{props.gravityDiagnostics}</pre> : <p>Diagnostics hidden in response until next request.</p>}
    </div>
  );
}
