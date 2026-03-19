import { describe, expect, it } from 'vitest';
import { buildTiekatContextEnvelope, buildTiekatReflectionPlan, buildTiekatSessionState } from '@/lib/tiekat/core';
import { computeGravityBootstrap } from '@/lib/tiekat/gravity';
import { TIEKAT_GRAVITY_SCORING_VERSION } from '@/lib/tiekat/gravityVersioning';
import { verifyTiekatOutput } from '@/lib/tiekat/verification';

describe('tiekat gravity bootstrap', () => {
  const consent = { allowAncestry: true, includeNames: false, hideLivingPersons: true, memoryEnabled: true };

  it('returns expected theoretical result shape', () => {
    const session = buildTiekatSessionState('s1', 'blend tarot and chart in gravitational coherence', consent);
    const envelope = buildTiekatContextEnvelope({
      message: 'blend tarot and chart in gravitational coherence',
      consent,
      moduleData: {
        tarot: { spread: 'three-card', drawn: [{ card: { name: 'The Sun' }, position: 'Now', orientation: 'upright' }] }
      }
    });
    session.state.symbolicAnchors = envelope.symbolicAnchors;
    const plan = buildTiekatReflectionPlan(session.state, envelope);
    const verification = verifyTiekatOutput('Tarot and chart reflections support practical integration.', plan, consent);
    const result = computeGravityBootstrap({ session: session.state, envelope, verification });

    expect(result.status).toBe('theoretical');
    expect(result.scoringVersion).toBe(TIEKAT_GRAVITY_SCORING_VERSION);
    expect(result.sourceMode).toBe('modeled_internal_signal');
    expect(result.confidenceNote).toContain('Theoretical only');
    expect(typeof result.deltaGPredicted).toBe('number');
    expect(result.deltaGBand.min).toBeLessThan(result.deltaGBand.max);
  });

  it('keeps diagnostics hidden by default and exposes when enabled', () => {
    const session = buildTiekatSessionState('s2', 'tarot reflection', consent);
    const envelope = buildTiekatContextEnvelope({ message: 'tarot reflection', consent });
    const verification = { passed: true, coherenceScore: 0.8, issues: [], usedModules: ['assistant', 'tarot'] as const };

    const compact = computeGravityBootstrap({ session: session.state, envelope, verification: verification as any });
    const detailed = computeGravityBootstrap({ session: session.state, envelope, verification: verification as any, includeDiagnostics: true });

    expect(compact.diagnostics).toBeUndefined();
    expect(detailed.diagnostics?.enabled).toBe(true);
    expect(detailed.diagnostics?.scoringVersion).toBe(TIEKAT_GRAVITY_SCORING_VERSION);
    expect(detailed.diagnostics?.features.symbolicMarkerBoost).toBeDefined();
  });

  it('is deterministic for same input', () => {
    const session = buildTiekatSessionState('s3', 'tarot reflection', consent);
    const envelope = buildTiekatContextEnvelope({ message: 'tarot reflection', consent });
    const verification = { passed: true, coherenceScore: 0.8, issues: [], usedModules: ['assistant', 'tarot'] as const };

    const a = computeGravityBootstrap({ session: session.state, envelope, verification: verification as any, includeDiagnostics: true });
    const b = computeGravityBootstrap({ session: session.state, envelope, verification: verification as any, includeDiagnostics: true });
    expect(a).toEqual(b);
  });

  it('reaches classical limit when information integral is zero', () => {
    const session = buildTiekatSessionState('s4', '', { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false });
    const envelope = {
      message: '',
      consent: { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false },
      moduleContext: {},
      memoryContext: [],
      symbolicAnchors: [],
      redactionApplied: ['ancestry_blocked', 'names_removed', 'living_persons_hidden', 'memory_disabled']
    };
    const verification = { passed: false, coherenceScore: 0, issues: ['Output is empty.', 'Output is too short to be meaningful.'], usedModules: ['assistant'] as const };

    const result = computeGravityBootstrap({ session: session.state, envelope, verification: verification as any });
    expect(result.informationIntegral).toBe(0);
    expect(result.deltaGPredicted).toBe(0);
    expect(result.classicalLimitReached).toBe(true);
  });

  it('applies consent/redaction penalties', () => {
    const baseSession = buildTiekatSessionState('s5', 'tarot and lineage integration', { allowAncestry: true, includeNames: true, hideLivingPersons: false, memoryEnabled: true });
    const baseEnvelope = buildTiekatContextEnvelope({
      message: 'tarot and lineage integration',
      consent: { allowAncestry: true, includeNames: true, hideLivingPersons: false, memoryEnabled: true },
      moduleData: { ancestry: { repeatingGivenNames: [['Anna', 2]] } }
    });

    const strictSession = buildTiekatSessionState('s6', 'tarot and lineage integration', { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false });
    const strictEnvelope = buildTiekatContextEnvelope({
      message: 'tarot and lineage integration',
      consent: { allowAncestry: false, includeNames: false, hideLivingPersons: true, memoryEnabled: false },
      moduleData: { ancestry: { repeatingGivenNames: [['Anna', 2]] } }
    });

    const verification = { passed: true, coherenceScore: 0.9, issues: [], usedModules: ['assistant', 'tarot'] as const };
    const base = computeGravityBootstrap({ session: baseSession.state, envelope: baseEnvelope, verification: verification as any });
    const strict = computeGravityBootstrap({ session: strictSession.state, envelope: strictEnvelope, verification: verification as any, includeDiagnostics: true });

    expect(strict.informationIntegral).toBeLessThan(base.informationIntegral);
    expect(strict.deltaGPredicted).toBeLessThan(base.deltaGPredicted);
    expect(strict.diagnostics?.notes.join(' ')).toContain('Redaction');
  });
});
