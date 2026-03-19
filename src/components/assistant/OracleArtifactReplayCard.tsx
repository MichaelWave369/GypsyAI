import React from 'react';
import { TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { SessionModeBadge } from './SessionModeBadge';

export function OracleArtifactReplayCard(props: {
  artifact: TiekatOracleArtifact;
  comparisonText?: string;
  onExport: () => void;
  onDelete: () => void;
}) {
  const { artifact } = props;
  return (
    <div className="rounded border border-zinc-700 p-2 text-xs text-zinc-300" data-testid="oracle-artifact-replay">
      <p className="font-semibold">Artifact Replay</p>
      <div className="flex items-center gap-2">
        <SessionModeBadge label={artifact.sessionMode.label} />
        <p className="text-zinc-500">mode key: {artifact.sessionMode.key}</p>
      </div>
      <p>{artifact.summary.oracleHeadline || 'Oracle summary artifact'}</p>
      <p className="text-zinc-400">{artifact.sessionMode.ritualFrame}</p>
      <p className="text-zinc-400">Prompt: {artifact.summary.promptSummary}</p>
      <p className="text-zinc-400">Response: {artifact.summary.responseSummary}</p>
      <p className="text-zinc-400">Trend {artifact.trend || 'stable'} • Version state {artifact.versionSummaryState || 'insufficient_data'} • v55 framing {artifact.v55?.enabled ? 'on' : 'off'}</p>
      {props.comparisonText ? <p className="text-zinc-400">{props.comparisonText}</p> : null}
      <div className="flex gap-2 pt-1">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExport}>Export Artifact JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onDelete}>Delete Artifact</button>
      </div>
      <p className="text-zinc-500">Modeled/theoretical artifact only — local storage, no cloud sync.</p>
    </div>
  );
}
