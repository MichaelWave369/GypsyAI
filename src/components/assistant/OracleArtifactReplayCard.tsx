'use client';

import React from 'react';
import { useState } from 'react';
import { formatOracleArtifactDiffText, TiekatOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { SessionModeBadge } from './SessionModeBadge';

export function OracleArtifactReplayCard(props: {
  artifact: TiekatOracleArtifact;
  diffView?: { title: string; lines: string[] };
  onExport: () => void;
  onDelete: () => void;
}) {
  const { artifact } = props;
  const [copyStatus, setCopyStatus] = useState('');
  const copyDiff = async () => {
    if (!props.diffView) return;
    const text = formatOracleArtifactDiffText(props.diffView);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyStatus('Diff copied');
      } else {
        setCopyStatus('Clipboard unavailable');
      }
    } catch {
      setCopyStatus('Copy failed');
    }
  };
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
      {artifact.council ? (
        <p className="text-zinc-400">
          Council {artifact.council.mode} • roles {artifact.council.roles.join(', ') || 'none'} • turns {artifact.council.turnCount} • disagreement {artifact.council.disagreement ? 'yes' : 'no'}
        </p>
      ) : null}
      {props.diffView ? (
        <div className="rounded border border-zinc-700 p-2 text-zinc-400" data-testid="artifact-diff-view">
          <p className="font-semibold">{props.diffView.title}</p>
          <ul className="list-disc pl-4">
            {props.diffView.lines.slice(0, 8).map((line) => <li key={line}>{line}</li>)}
          </ul>
          <button className="mt-1 rounded border border-zinc-700 px-2 py-1 text-xs" onClick={copyDiff}>Copy diff</button>
          {copyStatus ? <p className="text-zinc-500">{copyStatus}</p> : null}
        </div>
      ) : null}
      <div className="flex gap-2 pt-1">
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onExport}>Export Artifact JSON</button>
        <button className="rounded border border-zinc-700 px-2 py-1" onClick={props.onDelete}>Delete Artifact</button>
      </div>
      <p className="text-zinc-500">Modeled/theoretical artifact only — local storage, no cloud sync.</p>
    </div>
  );
}
