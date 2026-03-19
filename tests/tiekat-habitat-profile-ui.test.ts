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
        note: 'Applied habitat profile Quiet Reflection.',
        error: ''
      })
    );

    expect(html).toContain('Sovereign Habitat Profile');
    expect(html).toContain('Save New');
    expect(html).toContain('Import JSON');
    expect(html).toContain('preferences/configuration, no transcript');
    expect(html).toContain('Modeled/theoretical posture is unchanged');
  });
});
