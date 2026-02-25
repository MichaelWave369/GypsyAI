import { describe, expect, it } from 'vitest';
import { assertProvider, ensureProviderConfigured } from '@/lib/ai/client';
import { buildGroundingPacketTarot } from '@/lib/reading/grounding';
import { verifyReading } from '@/lib/reading/verifier';
import { drawCards } from '@/lib/tarot/engine';

describe('provider selection', () => {
  it('rejects unknown provider values', () => {
    expect(() => assertProvider('unknown')).toThrow('invalid_provider:unknown');
  });

  it('returns clear error when xai key is missing', () => {
    expect(() => ensureProviderConfigured('xai')).toThrow('missing_api_key:xai');
  });
});

describe('reading mode verifier compatibility', () => {
  it('demo reading structure satisfies required tarot sections', () => {
    const packet = buildGroundingPacketTarot('three-card', drawCards('three-card', 'demo-check'));
    const demoReading = `Opening\nSpread overview\nCard-by-card\nHermetic Layer\nIntegration\nPractical steps\nClosing line`;
    expect(verifyReading(demoReading, packet)).toEqual([]);
  });
});
