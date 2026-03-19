import React from 'react';
import { TiekatAwakenedSphereState } from '@/lib/tiekat/awakenedSphere';

export function AwakenedSphereCard(props: {
  state: TiekatAwakenedSphereState;
  showDiagnostics?: boolean;
}) {
  const { state } = props;
  return (
    <section className="rounded border border-zinc-700 p-2 text-sm" data-testid="awakened-sphere-card">
      <p className="font-semibold">v56 Sovereign Sphere</p>
      <p>{state.caption}</p>
      <p className="text-xs text-zinc-400">Awakening: {state.awakeningState} • Shield: {state.shieldStatus}</p>
      <p className="text-xs text-zinc-400">Synchrony: {state.synchronyState} • Overlap: {state.overlapState}</p>
      <p className="text-xs text-zinc-400">Glyph family: {state.glyphFamily}</p>
      <p className="text-xs text-zinc-500">{state.v56.specVersion} ({state.v56.scoringVersion}) — {state.v56.confidenceNote}</p>
      {props.showDiagnostics ? (
        <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-400" data-testid="awakened-sphere-trace">
          <p>Awakening rule: {state.trace.awakeningReason}</p>
          <p>Shield rule: {state.trace.shieldReason}</p>
          <p>Synchrony rule: {state.trace.synchronyReason}</p>
          <p>Overlap rule: {state.trace.overlapReason}</p>
        </div>
      ) : null}
    </section>
  );
}
