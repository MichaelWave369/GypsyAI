import { describe, expect, it } from 'vitest';
import {
  buildSacredGeometryState,
  formatGeometryCaption,
  loadGeometryVisibilityPreference,
  saveGeometryVisibilityPreference,
  selectGeometryGlyph
} from '@/lib/tiekat/sacredGeometry';

const baseInput = {
  gravity: { status: 'theoretical' as const, informationIntegral: 0.5, deltaGPredicted: 1.1e-10 },
  trend: 'stable' as const,
  versionSummary: { state: 'single_version' as const },
  sessionMode: 'open_reflection' as const,
  activeModules: ['assistant'] as const,
  route: 'assistant_synthesis',
  mode: 'assistant_synthesis' as const
};

describe('tiekat sacred geometry', () => {
  it('builds deterministic geometry state', () => {
    const a = buildSacredGeometryState(baseInput as any);
    const b = buildSacredGeometryState(baseInput as any);
    expect(a).toEqual(b);
    expect(a.layers.length).toBeGreaterThan(0);
    expect(a.trace.selectionRule).toBeTruthy();
    expect(a.trace.selectionReason).toContain('->');
  });

  it('maps representative metadata states to glyph rules', () => {
    expect(selectGeometryGlyph({ ...baseInput, versionSummary: { state: 'drift_detected' } } as any)).toBe('ring_orbit');
    expect(selectGeometryGlyph({ ...baseInput, sessionMode: 'synthesis_oracle', activeModules: ['assistant', 'tarot', 'astrology'] } as any)).toBe('lattice_bloom');
    expect(selectGeometryGlyph({ ...baseInput, mode: 'single_module', activeModules: ['assistant'] } as any)).toBe('triad');
  });

  it('keeps caption modeled/theoretical and avoids diagnostics leakage', () => {
    const caption = formatGeometryCaption(baseInput as any, 'triad');
    expect(caption.toLowerCase()).toContain('modeled');
    expect(caption.toLowerCase()).toContain('theoretical');
    expect(caption.toLowerCase()).not.toContain('diagnostics');
    expect(caption.toLowerCase()).not.toContain('ancestor name');
  });

  it('persists and reloads local geometry visibility preference', () => {
    const store: Record<string, string> = {};
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        }
      }
    };
    expect(loadGeometryVisibilityPreference(false)).toBe(false);
    saveGeometryVisibilityPreference(true);
    expect(loadGeometryVisibilityPreference(false)).toBe(true);
  });
});
