import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OracleArtifactList } from '@/components/assistant/OracleArtifactList';
import { OracleArtifactReplayCard } from '@/components/assistant/OracleArtifactReplayCard';
import { PromptPresetChips } from '@/components/assistant/PromptPresetChips';
import { SacredGeometryGlyph } from '@/components/assistant/SacredGeometryGlyph';
import { SessionModeSelector } from '@/components/assistant/SessionModeSelector';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { getPromptPresetGroup } from '@/lib/tiekat/promptPresets';
import { buildSacredGeometryState } from '@/lib/tiekat/sacredGeometry';

describe('session mode and artifact replay ui', () => {
  it('renders mode selector and artifact replay components', () => {
    const artifact = normalizeOracleArtifact({
      id: 'a1',
      sessionId: 's1',
      route: 'assistant_synthesis',
      sessionMode: { key: 'synthesis_oracle', label: 'Synthesis Oracle', ritualFrame: 'frame', allowV55Framing: true },
      v56: {
        specVersion: 'TIEKAT-v56',
        awakeningState: 'coherent',
        shieldStatus: 'stable',
        synchronyState: 'resonant',
        overlapState: 'bridged',
        glyphFamily: 'metatron_grid',
        caption: 'Modeled sovereign sphere summary. Theoretical integration layer only.',
        confidenceNote: 'Modeled sovereign sphere summary only.'
      }
    });

    const selectorHtml = renderToStaticMarkup(
      React.createElement(SessionModeSelector, {
        value: 'open_reflection',
        onChange: vi.fn()
      })
    );
    const listHtml = renderToStaticMarkup(
      React.createElement(OracleArtifactList, {
        artifacts: [artifact],
        selectedId: 'a1',
        onSelect: vi.fn()
      })
    );
    const replayHtml = renderToStaticMarkup(
      React.createElement(OracleArtifactReplayCard, {
        artifact,
        diffView: { title: 'What changed', lines: ['Session mode: A → B', 'ΔI 0.020000'] },
        onExport: vi.fn(),
        onDelete: vi.fn()
      })
    );
    const presetsHtml = renderToStaticMarkup(
      React.createElement(PromptPresetChips, {
        group: getPromptPresetGroup('open_reflection', false),
        onChoose: vi.fn()
      })
    );
    const geometry = buildSacredGeometryState({
      gravity: { status: 'theoretical', informationIntegral: 0.5, deltaGPredicted: 1e-10 },
      trend: 'stable',
      versionSummary: { state: 'single_version' },
      sessionMode: 'open_reflection',
      activeModules: ['assistant'],
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis'
    } as any);
    const geometryHtml = renderToStaticMarkup(React.createElement(SacredGeometryGlyph, { state: geometry }));

    expect(selectorHtml).toContain('Ritual Session Mode');
    expect(listHtml).toContain('Synthesis Oracle');
    expect(replayHtml).toContain('mode key: synthesis_oracle');
    expect(replayHtml).toContain('v56 awakening coherent');
    expect(replayHtml).toContain('What changed');
    expect(presetsHtml).toContain('Open Reflection Prompts');
    expect(geometryHtml).toContain('Modeled field geometry');
  });
});
