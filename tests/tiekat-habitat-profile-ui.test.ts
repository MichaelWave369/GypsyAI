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
        onBuildPinnedDeck: vi.fn(),
        onBuildRecentDeck: vi.fn(),
        onBuildAllDeck: vi.fn(),
        onExportDeckJson: vi.fn(),
        onExportDeckMarkdown: vi.fn(),
        onImportDeck: vi.fn(),
        recentDecks: [{
          id: 'deck-1',
          name: 'Recent habitat ritual deck',
          createdAt: '2026-03-20T00:00:00.000Z',
          cardCount: 2,
          kind: 'recent',
          savedLabel: 'saved 5m ago',
          sphereLabel: 'Modeled sphere: coherent / resonant_orbit',
          sphereContinuityLabel: 'Dominant sphere identity: coherent / resonant_orbit.'
        }],
        onSelectRecentDeck: vi.fn(),
        pendingDeleteDeckId: null,
        onRequestDeleteRecentDeck: vi.fn(),
        onCancelDeleteRecentDeck: vi.fn(),
        onConfirmDeleteRecentDeck: vi.fn(),
        sourceLabel: 'Source',
        sourceUrl: 'https://github.com/MichaelWave369/GypsyAI',
        sourceLicenseId: 'AGPL-3.0-or-later',
        diffPreview: { lines: ['Session mode: open_reflection → synthesis_oracle'], ancestryFallbackLine: 'Consent-safe fallback on apply: ancestral_listening → open_reflection.' },
        transitionSummary: {
          headline: 'Transitioning from Quiet Reflection to Synthesis Oracle.',
          line: 'This shift emphasizes: Session mode: open_reflection → synthesis_oracle.'
        },
        transitionChips: [{ key: 'session_mode', label: 'Session mode: open_reflection → synthesis_oracle', severity: 'high' }],
        profileUsageSummary: 'Used 5 times • Last mode synthesis_oracle',
        profileLastAppliedLabel: 'Last applied 2 hours ago',
        usageBadge: 'Frequently Used',
        constellationContinuityNote: 'Recent continuity favors Synthesis Oracle.',
        constellationTransitionNote: 'Recent transition: Quiet Reflection → Synthesis Oracle.',
        constellationNodeLabels: ['Synthesis Oracle', 'Council Deliberation'],
        sphereLabel: 'council_star • awakened/fortified/council_aligned',
        sphereCaption: 'Configuration-derived sphere profile: awakened • fortified • council_aligned.',
        sphereConfidenceNote: 'Modeled habitat sphere signature (theoretical, local configuration identity only).',
        deckSummaryLine: '2 habitat card(s). Lead: Synthesis Oracle.',
        deckSphereSummaryLine: 'Modeled habitat deck sphere memory: coherent / resonant_orbit. Dominant sphere identity: coherent / resonant_orbit.',
        deckPreviewLabels: ['Synthesis Oracle', 'Council Deliberation'],
        deckNote: 'Built pinned habitat ritual deck.',
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
    expect(html).toContain('Frequently Used');
    expect(html).toContain('Recent continuity favors Synthesis Oracle.');
    expect(html).toContain('Constellation: Synthesis Oracle • Council Deliberation');
    expect(html).toContain('Modeled habitat sphere signature: council_star • awakened/fortified/council_aligned');
    expect(html).toContain('Configuration-derived sphere profile: awakened • fortified • council_aligned.');
    expect(html).toContain('theoretical, local configuration identity only');
    expect(html).toContain('Export Deck JSON');
    expect(html).toContain('Export Deck Markdown');
    expect(html).toContain('Import Deck JSON');
    expect(html).toContain('Recent habitat decks');
    expect(html).toContain('Recent habitat ritual deck (recent, 2) • saved 5m ago');
    expect(html).toContain('Modeled sphere: coherent / resonant_orbit');
    expect(html).toContain('Dominant sphere identity: coherent / resonant_orbit.');
    expect(html).toContain('2 habitat card(s). Lead: Synthesis Oracle.');
    expect(html).toContain('Modeled habitat deck sphere memory: coherent / resonant_orbit.');
    expect(html).toContain('Deck cards: Synthesis Oracle • Council Deliberation');
    expect(html).toContain('Expand chip details');
    expect(html).toContain('Shortcuts: Alt+Shift+P');
    expect(html).toContain('preferences/configuration, no transcript');
    expect(html).toContain('Modeled/theoretical posture is unchanged');
    expect(html).toContain('Source');
    expect(html).toContain('AGPL-3.0-or-later');
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
        onBuildPinnedDeck: vi.fn(),
        onBuildRecentDeck: vi.fn(),
        onBuildAllDeck: vi.fn(),
        onExportDeckJson: vi.fn(),
        onExportDeckMarkdown: vi.fn(),
        onImportDeck: vi.fn(),
        recentDecks: [{
          id: 'deck-quiet',
          name: 'Quiet deck',
          createdAt: '2026-03-20T00:00:00.000Z',
          cardCount: 1,
          kind: 'pinned',
          savedLabel: 'saved just now',
          sphereLabel: 'Modeled sphere: quiet / quiet_lotus',
          sphereContinuityLabel: 'Dominant sphere identity: quiet / quiet_lotus.'
        }],
        onSelectRecentDeck: vi.fn(),
        pendingDeleteDeckId: 'deck-quiet',
        onRequestDeleteRecentDeck: vi.fn(),
        onCancelDeleteRecentDeck: vi.fn(),
        onConfirmDeleteRecentDeck: vi.fn(),
        sourceLabel: 'Source',
        sourceUrl: 'https://github.com/MichaelWave369/GypsyAI',
        transitionChips: [],
        profileUsageSummary: 'Never applied',
        profileLastAppliedLabel: 'Never applied',
        usageBadge: 'Never Applied',
        constellationNodeLabels: ['Quiet Reflection'],
        sphereLabel: 'quiet_lotus • quiet/open/solo',
        deckSphereSummaryLine: 'Modeled habitat deck sphere memory: quiet / quiet_lotus. Dominant sphere identity: quiet / quiet_lotus.',
        deckPreviewLabels: ['Quiet Reflection']
      })
    );
    expect(html).toContain('Never applied');
    expect(html).toContain('Never Applied');
    expect(html).toContain('Constellation: Quiet Reflection');
    expect(html).toContain('Modeled habitat sphere signature: quiet_lotus • quiet/open/solo');
    expect(html).toContain('Deck cards: Quiet Reflection');
    expect(html).toContain('Confirm');
    expect(html).toContain('Cancel');
    expect(html).toContain('saved just now');
    expect(html).toContain('Modeled sphere: quiet / quiet_lotus');
    expect(html).toContain('Modeled habitat deck sphere memory: quiet / quiet_lotus.');
  });
});
