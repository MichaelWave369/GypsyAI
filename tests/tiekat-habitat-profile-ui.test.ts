import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { HabitatProfileSelector } from '@/components/assistant/HabitatProfileSelector';
import { buildDefaultHabitatProfiles } from '@/lib/tiekat/habitatProfile';

describe('habitat profile ui', () => {
  it('renders compact habitat controls and theoretical/local-only notes', () => {
    const profiles = buildDefaultHabitatProfiles();
    const html = renderToStaticMarkup(
      React.createElement(HabitatProfileSelector, {
        profiles,
        selectedId: profiles[0].id,
        profileNameDraft: profiles[0].name,
        profileDescriptionDraft: profiles[0].description,
        onSelect: vi.fn(),
        onProfileNameDraftChange: vi.fn(),
        onProfileDescriptionDraftChange: vi.fn(),
        onApply: vi.fn(),
        onSave: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        onExport: vi.fn(),
        onImport: vi.fn(),
        onTogglePin: vi.fn(),
        onMoveUp: vi.fn(),
        onMoveDown: vi.fn(),
        diffPreview: { lines: ['Session mode: open_reflection → synthesis_oracle'], ancestryFallbackLine: 'Consent-safe fallback on apply: ancestral_listening → open_reflection.' },
        transitionSummary: {
          headline: 'Transitioning from Quiet Reflection to Synthesis Oracle.',
          line: 'This shift emphasizes: Session mode: open_reflection → synthesis_oracle.'
        },
        transitionChips: [{ key: 'session_mode', label: 'Session mode: open_reflection → synthesis_oracle', severity: 'high' }],
        profileUsageSummary: 'Used 5 times • Last mode synthesis_oracle',
        profileLastAppliedLabel: 'Last applied 2 hours ago',
        constellationContinuityNote: 'Recent continuity favors Synthesis Oracle.',
        constellationTransitionNote: 'Recent transition: Quiet Reflection → Synthesis Oracle.',
        note: 'Applied habitat profile Quiet Reflection.',
        error: ''
      })
    );

    expect(html).toContain('Sovereign Habitat Profile');
    expect(html).toContain('Save New');
    expect(html).toContain('Import JSON');
    expect(html).toContain('This profile will change:');
    expect(html).toContain('Consent-safe fallback on apply');
    expect(html).toContain('Move Up');
    expect(html).toContain('Transitioning from Quiet Reflection');
    expect(html).toContain('Habitat memory');
    expect(html).toContain('Last applied 2 hours ago');
    expect(html).toContain('Used 5 times');
    expect(html).toContain('Recent continuity favors Synthesis Oracle.');
    expect(html).toContain('Expand chip details');
    expect(html).toContain('Shortcuts: Alt+Shift+P');
    expect(html).toContain('preferences/configuration, no transcript');
    expect(html).toContain('Modeled/theoretical posture is unchanged');
  });

  it('renders never-applied habitat memory cue', () => {
    const profiles = buildDefaultHabitatProfiles();
    const html = renderToStaticMarkup(
      React.createElement(HabitatProfileSelector, {
        profiles,
        selectedId: profiles[0].id,
        profileNameDraft: profiles[0].name,
        profileDescriptionDraft: profiles[0].description,
        onSelect: vi.fn(),
        onProfileNameDraftChange: vi.fn(),
        onProfileDescriptionDraftChange: vi.fn(),
        onApply: vi.fn(),
        onSave: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
        onExport: vi.fn(),
        onImport: vi.fn(),
        onTogglePin: vi.fn(),
        onMoveUp: vi.fn(),
        onMoveDown: vi.fn(),
        transitionChips: [],
        profileUsageSummary: 'Never applied',
        profileLastAppliedLabel: 'Never applied'
      })
    );
    expect(html).toContain('Never applied');
  });
});
