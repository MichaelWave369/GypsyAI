import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OracleConstellation } from '@/components/assistant/OracleConstellation';
import { SacredGeometryGlyph } from '@/components/assistant/SacredGeometryGlyph';
import { buildOracleConstellationState } from '@/lib/tiekat/oracleConstellation';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { buildSacredGeometryState } from '@/lib/tiekat/sacredGeometry';

describe('assistant visibility behaviors', () => {
  it('keeps geometry hidden when toggle is off and shows diagnostics trace/constellation when enabled', () => {
    const geometry = buildSacredGeometryState({
      gravity: { status: 'theoretical', informationIntegral: 0.5, deltaGPredicted: 1e-10 },
      trend: 'stable',
      versionSummary: { state: 'single_version' },
      sessionMode: 'open_reflection',
      activeModules: ['assistant'],
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis'
    } as any);
    const artifacts = [
      normalizeOracleArtifact({ id: 'a', timestamp: '2026-03-01T00:00:00.000Z' }),
      normalizeOracleArtifact({ id: 'b', timestamp: '2026-03-02T00:00:00.000Z', sessionMode: { key: 'synthesis_oracle', label: 'Synthesis Oracle', ritualFrame: 'frame', allowV55Framing: true } })
    ];
    const constellation = buildOracleConstellationState({ artifacts });

    const hiddenHtml = renderToStaticMarkup(
      React.createElement('div', null, false ? React.createElement(SacredGeometryGlyph, { state: geometry }) : null)
    );
    const diagnosticsHtml = renderToStaticMarkup(
      React.createElement('div', null,
        React.createElement('div', null, `Rule: ${geometry.trace.selectionReason}`),
        React.createElement(OracleConstellation, { state: constellation })
      )
    );

    expect(hiddenHtml).not.toContain('sacred-geometry');
    expect(diagnosticsHtml).toContain('Rule:');
    expect(diagnosticsHtml).toContain('oracle-constellation');
  });
});
