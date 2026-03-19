import { describe, expect, it } from 'vitest';
import {
  buildOraclePresentation,
  formatDriftNumber,
  formatGravityStateLabel,
  formatModeledConfidenceText,
  shouldShowOraclePresentation,
  formatMasterActionFraming
} from '@/lib/tiekat/oraclePresentation';

describe('tiekat oracle presentation', () => {
  const gravity = {
    status: 'theoretical' as const,
    enabled: true,
    lambdaI: 0.75,
    baselineMatterDensity: 1,
    informationIntegral: 0.42,
    deltaGPredicted: 1.23e-10,
    deltaGBand: { min: 1e-10, max: 1.4e-10 },
    classicalLimitReached: false,
    confidenceNote: 'Canonical TIEKAT v54 modeled gravity signal. Theoretical only; not hardware-measured and not a physical gravimetry claim.',
    sourceMode: 'modeled_internal_signal' as const,
    contributingAnchors: ['safe-anchor'],
    contributingModules: ['assistant'] as const,
    modelVersion: 'gravity-bootstrap-v1' as const,
    scoringVersion: 'v54-gb-v1',
    canonicalSpecVersion: 'TIEKAT-v54'
  };

  it('builds deterministic oracle presentation shape', () => {
    const presentation = buildOraclePresentation({
      gravity: gravity as any,
      trend: 'rising',
      versionSummary: { state: 'drift_detected', versionCount: 2, drift: { from: 'v54-gb-v1', to: 'v55-gb-v1', informationIntegralDrift: 0.01, deltaGDrift: 1e-11 } },
      enableV55Framing: true,
      sessionMode: 'synthesis_oracle'
    });

    expect(presentation.headline).toContain('Modeled Field');
    expect(presentation.narrative).toContain('Symbolic gravity bootstrap result');
    expect(presentation.footer).toContain('Modeled/theoretical');
    expect(presentation.drift).toContain('Version drift');
    expect(presentation.masterActionFraming).toContain('theoretical master-action framing lens');
    expect(presentation.modeLabel).toBe('Synthesis Oracle');
    expect(presentation.ritualFrame).toContain('modeled/theoretical');
  });

  it('formats near-zero drift values clearly', () => {
    expect(formatDriftNumber(1e-10, 'integral')).toBe('≈0');
    expect(formatDriftNumber(1e-20, 'deltaG')).toBe('≈0');
  });

  it('preserves theoretical safety phrasing', () => {
    expect(formatModeledConfidenceText(gravity.confidenceNote)).toContain('not a physical sensor measurement');
    expect(formatGravityStateLabel({ status: 'theoretical', informationIntegral: 0.1 })).toContain('Modeled Field');
  });

  it('does not leak diagnostics payload by default', () => {
    const presentation = buildOraclePresentation({
      gravity: gravity as any,
      trend: 'stable',
      versionSummary: { state: 'single_version', versionCount: 1, drift: null }
    });

    expect(JSON.stringify(presentation).toLowerCase()).not.toContain('diagnostics');
    expect(shouldShowOraclePresentation(gravity as any)).toBe(true);
    expect(shouldShowOraclePresentation(null)).toBe(false);
  });

  it('avoids ancestry/private content in oracle text', () => {
    const presentation = buildOraclePresentation({
      gravity: gravity as any,
      trend: 'falling',
      versionSummary: { state: 'insufficient_data', versionCount: 0, drift: null }
    });

    const text = `${presentation.headline} ${presentation.narrative} ${presentation.footer}`.toLowerCase();
    expect(text).not.toContain('ancestor name');
    expect(text).not.toContain('family tree record');
  });


  it('renders master-action framing only when enabled', () => {
    expect(formatMasterActionFraming(true)).toContain('TIEKAT-v55');
    expect(formatMasterActionFraming(false)).toBeUndefined();
  });
});
