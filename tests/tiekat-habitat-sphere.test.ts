import { describe, expect, it } from 'vitest';
import { buildHabitatSphereSignature } from '@/lib/tiekat/habitatSphere';
import { buildDefaultHabitatProfiles, normalizeHabitatProfile } from '@/lib/tiekat/habitatProfile';

describe('tiekat habitat sphere signature', () => {
  it('builds deterministic signature for the same profile', () => {
    const profile = normalizeHabitatProfile({
      ...buildDefaultHabitatProfiles()[2],
      applyCount: 6,
      pinned: true,
      lastAppliedAt: '2026-03-20T00:00:00.000Z'
    });
    const a = buildHabitatSphereSignature(profile);
    const b = buildHabitatSphereSignature(profile);
    expect(a).toEqual(b);
    expect(a.specVersion).toBe('TIEKAT-habitat-sphere-v1');
  });

  it('maps quiet and council-heavy profiles into representative sphere identities', () => {
    const quiet = buildHabitatSphereSignature(buildDefaultHabitatProfiles()[0]);
    expect(quiet.awakeningState).toBe('quiet');
    expect(quiet.synchronyState).toBe('solo');

    const council = buildHabitatSphereSignature(normalizeHabitatProfile({
      ...buildDefaultHabitatProfiles()[3],
      pinned: true,
      applyCount: 5
    }));
    expect(council.synchronyState).toBe('council_aligned');
    expect(council.shieldStatus).toBe('fortified');
    expect(council.glyphFamily).toBe('council_star');
  });

  it('keeps signature text modeled/theoretical and free of private/raw content', () => {
    const signature = buildHabitatSphereSignature(buildDefaultHabitatProfiles()[4]);
    expect(signature.caption.toLowerCase()).toContain('configuration-derived sphere profile');
    expect(signature.confidenceNote.toLowerCase()).toContain('modeled habitat sphere signature');
    expect(signature.caption.toLowerCase()).not.toContain('detected sphere');
    expect(signature.caption.toLowerCase()).not.toContain('measured habitat field');
    expect(signature.caption.toLowerCase()).not.toContain('ancestor name');
    expect(signature.caption.toLowerCase()).not.toContain('message');
  });
});
