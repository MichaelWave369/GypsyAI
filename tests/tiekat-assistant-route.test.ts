import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/assistant/chat/route';

describe('assistant route with tiekat', () => {
  it('keeps diagnostics hidden by default', async () => {
    vi.stubEnv('TEST_MODE', '1');

    const req = new NextRequest('http://localhost/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Blend tarot and chart for reflection',
        tiekat: {
          sessionId: 's1',
          consent: { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false },
          memoryEntries: []
        }
      }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.tiekat.gravityBootstrap.status).toBe('theoretical');
    expect(data.tiekat.gravityBootstrap.scoringVersion).toBe('v54-gb-v1');
    expect(data.tiekat.v54.specVersion).toBe('TIEKAT-v54');
    expect(data.tiekat.gravityBootstrap.diagnostics).toBeUndefined();

    vi.unstubAllEnvs();
  });

  it('returns diagnostics when explicitly enabled', async () => {
    vi.stubEnv('TEST_MODE', '1');

    const req = new NextRequest('http://localhost/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Blend tarot and chart for gravitational coherence',
        tiekat: {
          sessionId: 's1',
          gravityDiagnostics: true,
          consent: { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false },
          memoryEntries: []
        }
      }),
      headers: { 'content-type': 'application/json' }
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.tiekat.gravityBootstrap.diagnostics.enabled).toBe(true);
    expect(data.tiekat.gravityBootstrap.diagnostics.features.redactionPenalty).toBeGreaterThan(0);
    expect(data.tiekat.gravityBootstrap.sourceMode).toBe('modeled_internal_signal');
    expect(data.tiekat.gravityBootstrap.confidenceNote).toContain('Theoretical only');

    vi.unstubAllEnvs();
  });
});
