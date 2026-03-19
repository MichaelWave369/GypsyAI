import { describe, expect, it } from 'vitest';
import { buildOracleArtifact, normalizeOracleArtifact } from '@/lib/tiekat/oracleArtifact';
import {
  buildCouncilInputEnvelope,
  buildCouncilPlan,
  getCouncilRoster,
  runOracleCouncil,
  summarizePromptForCouncil
} from '@/lib/tiekat/oracleCouncil';

describe('oracle council layer', () => {
  it('gates lineage_keeper role by ancestry consent', () => {
    const denied = getCouncilRoster({ allowAncestry: false });
    const allowed = getCouncilRoster({ allowAncestry: true });
    expect(denied).not.toContain('lineage_keeper');
    expect(allowed).toContain('lineage_keeper');
  });

  it('builds sanitized council envelope without raw private payload leakage', () => {
    const envelope = buildCouncilInputEnvelope({
      message: 'Please read Jane and Michael\'s lineage deeply',
      sessionMode: 'synthesis_oracle',
      route: 'assistant_synthesis',
      modules: ['assistant', 'ancestry'],
      ritualFrame: 'ritual frame',
      artifactContinuitySummary: 'Prior artifact continuity summary',
      ancestrySummary: 'Lineage notes with names',
      consent: { allowAncestry: false, includeNames: false },
      gravitySummary: { status: 'theoretical', informationIntegral: 0.4, deltaGPredicted: 1e-10 }
    });
    expect(envelope.promptSummary).toContain('[name]');
    expect(envelope.ancestrySummary).toBeUndefined();
  });

  it('returns null for disabled council mode and deterministic result otherwise', () => {
    const envelope = buildCouncilInputEnvelope({
      message: 'General prompt',
      sessionMode: 'open_reflection',
      route: 'assistant_synthesis',
      modules: ['assistant'],
      ritualFrame: 'frame',
      artifactContinuitySummary: 'continuity',
      consent: { allowAncestry: false, includeNames: false }
    });
    expect(runOracleCouncil({ mode: 'disabled', consent: { allowAncestry: false }, envelope })).toBeNull();

    const result = runOracleCouncil({ mode: 'oracle_council', consent: { allowAncestry: false }, envelope });
    expect(result?.summary.mode).toBe('oracle_council');
    expect(result?.summary.turnCount).toBeGreaterThan(0);
    expect(result?.summary.footer.toLowerCase()).toContain('theoretical');
  });

  it('stores compact council metadata in artifacts and normalizes older artifacts', () => {
    const council = runOracleCouncil({
      mode: 'deliberation_oracle',
      consent: { allowAncestry: true },
      envelope: buildCouncilInputEnvelope({
        message: 'Council prompt',
        sessionMode: 'synthesis_oracle',
        route: 'assistant_synthesis',
        modules: ['assistant', 'ancestry'],
        ritualFrame: 'frame',
        artifactContinuitySummary: 'continuity',
        ancestrySummary: 'allowed ancestry summary',
        consent: { allowAncestry: true, includeNames: false }
      })
    });
    const artifact = buildOracleArtifact({
      sessionId: 's1',
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis',
      activeModules: ['assistant'],
      prompt: 'prompt',
      response: 'response',
      gravity: {
        status: 'theoretical',
        informationIntegral: 0.5,
        deltaGPredicted: 1e-10,
        scoringVersion: 'v54-gb-v1',
        canonicalSpecVersion: 'TIEKAT-v54'
      } as any,
      consent: { memoryEnabled: true, includeNames: false, allowAncestry: false, hideLivingPersons: true },
      enableV55Framing: false,
      council: council?.summary ?? null
    });
    expect(artifact.council?.roles.length).toBeGreaterThan(0);
    const normalized = normalizeOracleArtifact({ id: 'legacy' });
    expect(normalized.council).toBeUndefined();
  });

  it('buildCouncilPlan returns empty roles for disabled mode', () => {
    const disabled = buildCouncilPlan('disabled', { allowAncestry: true });
    expect(disabled.roles.length).toBe(0);
    expect(summarizePromptForCouncil('A B C Name')).toContain('[name]');
  });
});
