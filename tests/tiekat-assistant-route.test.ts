import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/assistant/chat/route';

describe('assistant route with tiekat', () => {
  it('returns tiekat metadata in deterministic test mode', async () => {
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
    expect(data.intent).toBe('CHAT');
    expect(data.tiekat.route).toBe('assistant_synthesis');
    expect(data.tiekat.verification.passed).toBe(true);
    expect(data.tiekat.gravityBootstrap.status).toBe('theoretical');
    expect(data.tiekat.gravityBootstrap.sourceMode).toBe('modeled_internal_signal');
    expect(data.tiekat.gravityBootstrap.confidenceNote).toContain('not a physical sensor measurement');

    vi.unstubAllEnvs();
  });
});
