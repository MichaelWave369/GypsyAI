import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OracleArtifactList } from '@/components/assistant/OracleArtifactList';
import { OracleArtifactReplayCard } from '@/components/assistant/OracleArtifactReplayCard';
import { PromptPresetChips } from '@/components/assistant/PromptPresetChips';
import { SessionModeSelector } from '@/components/assistant/SessionModeSelector';
import { normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import { getPromptPresetGroup } from '@/lib/tiekat/promptPresets';

describe('session mode and artifact replay ui', () => {
  it('renders mode selector and artifact replay components', () => {
    const artifact = normalizeOracleArtifact({
      id: 'a1',
      sessionId: 's1',
      route: 'assistant_synthesis',
      sessionMode: { key: 'synthesis_oracle', label: 'Synthesis Oracle', ritualFrame: 'frame', allowV55Framing: true }
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

    expect(selectorHtml).toContain('Ritual Session Mode');
    expect(listHtml).toContain('Synthesis Oracle');
    expect(replayHtml).toContain('mode key: synthesis_oracle');
    expect(replayHtml).toContain('What changed');
    expect(presetsHtml).toContain('Open Reflection Prompts');
  });
});
