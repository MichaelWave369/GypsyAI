import { describe, expect, it } from 'vitest';
import { buildGroundingPacketTarot } from '@/lib/reading/grounding';
import { verifyReading } from '@/lib/reading/verifier';
import { drawCards } from '@/lib/tarot/engine';

describe('grounding verifier', () => {
  it('flags missing required section', () => {
    const packet = buildGroundingPacketTarot('single', drawCards('single', 'x'));
    const issues = verifyReading('Opening: hi\nCard-by-card: one', packet);
    expect(issues.some((x) => x.includes('Missing section'))).toBe(true);
  });

  it('flags non-packet card mention', () => {
    const packet = buildGroundingPacketTarot('single', drawCards('single', 'x'));
    const issues = verifyReading('Opening\nSpread overview\nCard-by-card: The Emperor\nHermetic Layer\nIntegration\nPractical steps\nClosing line', packet);
    expect(issues.some((x) => x.includes('Potential non-packet card reference'))).toBe(true);
  });
});
