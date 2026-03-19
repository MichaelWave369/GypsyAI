import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AwakenedSphereCard } from '@/components/assistant/AwakenedSphereCard';
import { buildAwakenedSphereState, computeSphereOverlap, computeSphereShield, computeSphereSynchrony, formatSphereCaption } from '@/lib/tiekat/awakenedSphere';
import { exportTiekatV56Spec, getTiekatV56Metadata } from '@/lib/tiekat/v56';

describe('tiekat v56 sovereign sphere', () => {
  it('returns canonical v56 metadata/spec export', () => {
    const meta = getTiekatV56Metadata();
    expect(meta.specVersion).toBe('TIEKAT-v56');
    expect(meta.relationship.v54).toContain('Operational');
    expect(exportTiekatV56Spec()).toContain('Awakened Sphere / Sovereign Sphere');
  });

  it('computes deterministic shield/synchrony/overlap mappings', () => {
    expect(computeSphereShield({ gravity: { status: 'disabled', informationIntegral: 0 }, council: null })).toBe('open');
    expect(computeSphereSynchrony({ modules: ['assistant', 'tarot', 'astrology'], trend: 'rising', councilContinuity: { state: 'council_continuity' }, versionSummary: { state: 'mixed_versions' } })).toBe('aligned');
    expect(computeSphereOverlap({ constellation: { nodes: [{ id: 'a' } as any, { id: 'b' } as any, { id: 'c' } as any, { id: 'd' } as any], edges: [] }, council: { turnCount: 2 } })).toBe('bridged');
  });

  it('builds awakened sphere state deterministically from sanitized metadata', () => {
    const sharedCouncil = {
      mode: 'oracle_council' as const,
      roles: ['oracle_reader', 'pattern_weaver', 'skeptic_grounder', 'final_integrator'] as const,
      turnCount: 4,
      roleSummaries: [],
      disagreement: false,
      synthesisNote: 's',
      selectedModules: ['assistant', 'tarot'] as const,
      warnings: [],
      executionSource: 'provider_backed' as const,
      adapterAvailable: true,
      footer: 'f'
    };
    const sharedInput = {
      gravity: { status: 'theoretical' as const, informationIntegral: 0.72, deltaGPredicted: 1e-10 },
      councilSummary: sharedCouncil as any,
      councilContinuity: {
        state: 'council_continuity' as const,
        recentModes: ['oracle_council'] as const,
        disagreementRate: 0,
        executionSources: ['provider_backed'] as const,
        roleStability: 'stable' as const,
        note: 'n'
      },
      geometry: { glyph: 'lattice_bloom' as const, density: 4, layers: [], caption: 'c', trace: { selectionRule: 'x', selectionReason: 'y', layerReason: 'z' } },
      constellation: { nodes: [{ id: '1' } as any, { id: '2' } as any, { id: '3' } as any, { id: '4' } as any, { id: '5' } as any, { id: '6' } as any], edges: [] as any, caption: '' },
      sessionMode: 'synthesis_oracle' as const,
      modules: ['assistant', 'tarot', 'astrology'] as const,
      versionSummary: { state: 'mixed_versions' as const },
      trend: 'rising' as const
    };
    const stateA = buildAwakenedSphereState({
      ...sharedInput
    });
    const stateB = buildAwakenedSphereState({
      ...sharedInput
    });
    expect(stateA.caption).toContain('Theoretical integration layer only');
    expect(stateA.awakeningState).toBe('awakened');
    expect(stateA.caption).toBe(formatSphereCaption(stateA));
    expect(stateA.glyphFamily).toBe(stateB.glyphFamily);
  });

  it('renders lightweight awakened sphere card with diagnostics trace', () => {
    const state = buildAwakenedSphereState({
      gravity: { status: 'theoretical', informationIntegral: 0.42, deltaGPredicted: 1e-10 },
      councilSummary: null,
      councilContinuity: null,
      geometry: null,
      constellation: null,
      sessionMode: 'open_reflection',
      modules: ['assistant'],
      versionSummary: { state: 'single_version' },
      trend: 'stable'
    });
    const html = renderToStaticMarkup(React.createElement(AwakenedSphereCard, { state, showDiagnostics: true }));
    expect(html).toContain('v56 Sovereign Sphere');
    expect(html).toContain('Modeled sovereign sphere state');
    expect(html).toContain('awakened-sphere-trace');
  });
});
