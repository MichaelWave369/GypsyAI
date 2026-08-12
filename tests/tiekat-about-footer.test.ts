import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  APP_COMMERCIAL_NOTE_LABEL,
  APP_COMMERCIAL_NOTE_PATH,
  APP_IDENTITY_LINE,
  APP_LICENSE_LABEL,
  APP_LOCAL_PRIVACY_NOTE,
  APP_MODELED_NOTE,
  APP_NAME,
  APP_SOURCE_LINK_LABEL,
  APP_SOURCE_LINK_URL
} from '@/lib/app/aboutInfo';
import { AppFooterInfo } from '@/components/app/AppFooterInfo';

describe('about/footer info surface', () => {
  it('exposes deterministic about info constants', () => {
    expect(APP_NAME).toBe('GypsyAI');
    expect(APP_LICENSE_LABEL).toBe('MIT');
    expect(APP_SOURCE_LINK_LABEL).toBe('Source');
    expect(APP_SOURCE_LINK_URL).toContain('github.com');
    expect(APP_COMMERCIAL_NOTE_LABEL).toBe('MIT License');
    expect(APP_COMMERCIAL_NOTE_PATH).toBe('/LICENSE');
    expect(APP_LOCAL_PRIVACY_NOTE.toLowerCase()).toContain('local-first');
    expect(APP_MODELED_NOTE.toLowerCase()).toContain('modeled/theoretical');
    expect(APP_IDENTITY_LINE.toLowerCase()).toContain('sovereign oracle habitat');
  });

  it('renders compact footer/about content and safe dynamic status line', () => {
    const statusLine =
      'Habitat: Quiet Reflection • Frequently Used • 2 recent deck(s) • mode synthesis_oracle.';
    const html = renderToStaticMarkup(
      React.createElement(AppFooterInfo, { habitatStatusLine: statusLine })
    );

    expect(html).toContain('GypsyAI');
    expect(html).toContain('Source');
    expect(html).toContain('MIT');
    expect(html).toContain('MIT License');
    expect(html).toContain('Local-first configuration memory only');
    expect(html).toContain('Modeled/theoretical oracle system; not a physical measurement device.');
    expect(html).toContain(statusLine);
    expect(html.toLowerCase()).not.toContain('transcript:');
    expect(html.toLowerCase()).not.toContain('ancestor name');
    expect(html.toLowerCase()).not.toContain('message:');
  });
});
