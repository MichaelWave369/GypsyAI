import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DiagnosticsSection } from '@/components/assistant/DiagnosticsSection';
import { OracleCard } from '@/components/assistant/OracleCard';

describe('oracle/diagnostics UI visibility', () => {
  it('shows oracle block with disclaimer and optional v55 framing', () => {
    const withFraming = renderToStaticMarkup(
      React.createElement(OracleCard, {
        oracle: {
          headline: 'Modeled Field: Transitional',
          narrative: 'Symbolic gravity bootstrap result.',
          trend: 'Local modeled trend is stable.',
          masterActionFraming: 'v54 operational gravity bootstrap is the active runtime layer; TIEKAT-v55 remains a theoretical master-action framing lens.',
          footer: 'Modeled/theoretical output only — not a physical sensor measurement.'
        }
      })
    );
    const withoutFraming = renderToStaticMarkup(
      React.createElement(OracleCard, {
        oracle: {
          headline: 'Modeled Field: Transitional',
          narrative: 'Symbolic gravity bootstrap result.',
          trend: 'Local modeled trend is stable.',
          footer: 'Modeled/theoretical output only — not a physical sensor measurement.'
        }
      })
    );

    expect(withFraming).toContain('Modeled/theoretical output only');
    expect(withFraming).toContain('TIEKAT-v55');
    expect(withoutFraming).not.toContain('TIEKAT-v55');
  });

  it('keeps diagnostics content compact and hidden-placeholder when not provided', () => {
    const diagnosticsHtml = renderToStaticMarkup(
      React.createElement(DiagnosticsSection, {
        gravityTrend: 'stable',
        recentGravity: [],
        sparklinePoints: '',
        versionState: null,
        scoringVersion: 'v54-gb-v1',
        gravityDiagnostics: ''
      })
    );

    expect(diagnosticsHtml).toContain('Diagnostics hidden in response until next request.');
    expect(diagnosticsHtml).not.toContain('ancestor name');
  });
});
