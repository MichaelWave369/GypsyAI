import { TiekatGravityBootstrapResult } from '@/lib/tiekat/schema';

export interface OracleVersionSummary {
  state: 'single_version' | 'mixed_versions' | 'drift_detected' | 'insufficient_data';
  versionCount: number;
  drift?: {
    from: string;
    to: string;
    informationIntegralDrift: number;
    deltaGDrift: number;
  } | null;
}

export interface TiekatOraclePresentation {
  headline: string;
  narrative: string;
  trend: string;
  drift?: string;
  footer: string;
}

export function formatDriftNumber(value: number, mode: 'integral' | 'deltaG') {
  const abs = Math.abs(value);
  if (abs < (mode === 'integral' ? 1e-6 : 1e-14)) return '≈0';
  if (mode === 'integral') return value.toFixed(4);
  return value.toExponential(2);
}

export function formatGravityStateLabel(gravity: Pick<TiekatGravityBootstrapResult, 'status' | 'informationIntegral'>) {
  if (gravity.status === 'disabled') return 'Modeled Field: Inactive';
  if (gravity.informationIntegral >= 0.66) return 'Modeled Field: Coherent';
  if (gravity.informationIntegral >= 0.33) return 'Modeled Field: Transitional';
  return 'Modeled Field: Quiet';
}

export function formatGravityTrendSummary(trend: 'rising' | 'stable' | 'falling') {
  if (trend === 'rising') return 'Local modeled trend is rising.';
  if (trend === 'falling') return 'Local modeled trend is easing.';
  return 'Local modeled trend is stable.';
}

export function formatVersionDriftSummary(summary: OracleVersionSummary) {
  if (summary.state !== 'drift_detected' || !summary.drift) return undefined;
  return `Version drift ${summary.drift.from}→${summary.drift.to}: ΔI ${formatDriftNumber(summary.drift.informationIntegralDrift, 'integral')}, ΔΔg ${formatDriftNumber(summary.drift.deltaGDrift, 'deltaG')}.`;
}

export function formatModeledConfidenceText(confidenceNote?: string) {
  const base = 'Modeled/theoretical output only — not a physical sensor measurement.';
  if (!confidenceNote) return base;
  return `${base} ${confidenceNote}`;
}

export function shouldShowOraclePresentation(gravity?: TiekatGravityBootstrapResult | null) {
  return Boolean(gravity);
}

export function buildOraclePresentation(args: {
  gravity: TiekatGravityBootstrapResult;
  trend: 'rising' | 'stable' | 'falling';
  versionSummary: OracleVersionSummary;
}): TiekatOraclePresentation {
  return {
    headline: formatGravityStateLabel(args.gravity),
    narrative: `Symbolic gravity bootstrap result: I=${args.gravity.informationIntegral.toFixed(3)}, Δg=${args.gravity.deltaGPredicted.toExponential(2)}.`,
    trend: formatGravityTrendSummary(args.trend),
    drift: formatVersionDriftSummary(args.versionSummary),
    footer: formatModeledConfidenceText(args.gravity.confidenceNote)
  };
}
