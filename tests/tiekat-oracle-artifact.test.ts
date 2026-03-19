import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = {
  oracleArtifacts: [] as any[]
};

vi.mock('@/lib/local/db', () => ({
  dbGet: async (store: string) => (db as any)[store] ?? null,
  dbSet: async (store: string, value: unknown) => {
    (db as any)[store] = value;
  }
}));

import {
  appendOracleArtifact,
  buildOracleArtifact,
  buildOracleArtifactSummary,
  compareOracleArtifacts,
  deleteOracleArtifact,
  exportOracleArtifactJson,
  importOracleArtifactJson,
  getRecentOracleArtifacts,
  loadOracleArtifacts,
  normalizeOracleArtifact
} from '@/lib/tiekat/oracleArtifact';

const gravity = {
  status: 'theoretical' as const,
  enabled: true,
  lambdaI: 0.75,
  baselineMatterDensity: 1,
  informationIntegral: 0.42,
  deltaGPredicted: 1.23e-10,
  deltaGBand: { min: 1e-10, max: 1.4e-10 },
  classicalLimitReached: false,
  confidenceNote: 'modeled/theoretical',
  sourceMode: 'modeled_internal_signal' as const,
  contributingAnchors: ['sun'],
  contributingModules: ['assistant', 'tarot'] as const,
  modelVersion: 'gravity-bootstrap-v1' as const,
  scoringVersion: 'v54-gb-v1',
  canonicalSpecVersion: 'TIEKAT-v54'
};

describe('tiekat oracle artifact', () => {
  beforeEach(() => {
    db.oracleArtifacts = [];
  });

  it('builds a compact deterministic artifact shape', () => {
    const artifact = buildOracleArtifact({
      sessionId: 's1',
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis',
      activeModules: ['assistant', 'tarot'],
      prompt: 'Tell me about Michael and my lineage',
      response: 'Michael receives a modeled symbolic reading.',
      gravity: gravity as any,
      oracle: { headline: 'Modeled Field: Transitional', narrative: '', trend: '', footer: '' },
      trend: 'stable',
      versionSummary: { state: 'single_version', versionCount: 1, drift: null },
      consent: { memoryEnabled: true, includeNames: false, allowAncestry: false, hideLivingPersons: true },
      enableV55Framing: true,
      sessionMode: 'synthesis_oracle'
    });

    expect(artifact.summary.promptSummary).not.toContain('Michael');
    expect(artifact.v55?.enabled).toBe(true);
    expect(artifact.sessionMode.key).toBe('synthesis_oracle');
    expect(artifact.version.artifactSpecVersion).toBe('TIEKAT-oracle-artifact-v2');
  });

  it('normalizes v56 summary defaults for legacy artifacts and keeps compact shape', () => {
    const withoutV56 = normalizeOracleArtifact({ id: 'legacy-v56', sessionId: 's1' } as any);
    expect(withoutV56.v56).toBeUndefined();

    const withV56 = normalizeOracleArtifact({
      id: 'with-v56',
      sessionId: 's1',
      v56: {
        specVersion: 'TIEKAT-v56',
        awakeningState: 'awakened',
        shieldStatus: 'reinforced',
        synchronyState: 'aligned',
        overlapState: 'merged',
        glyphFamily: 'lattice_bloom',
        caption: 'Modeled sovereign sphere summary. Theoretical integration layer only.',
        confidenceNote: 'Modeled sovereign sphere summary only.'
      }
    } as any);
    expect(withV56.v56?.awakeningState).toBe('awakened');
    expect(withV56.v56?.caption.toLowerCase()).toContain('theoretical');
  });

  it('builds compact summary fields and keeps payload privacy-safe', () => {
    const summary = buildOracleArtifactSummary({
      prompt: 'Please include ancestor name and private family tree details',
      response: 'I will keep this theoretical and compact.',
      oracleHeadline: 'Modeled Field: Quiet',
      includeNames: false
    });
    expect(summary.promptSummary.length).toBeLessThanOrEqual(180);
    expect(summary.promptSummary.toLowerCase()).not.toContain('ancestor name');
  });

  it('persists, lists recent, and deletes artifacts through local store helpers', async () => {
    const older = normalizeOracleArtifact({ id: 'a1', sessionId: 's1', timestamp: '2026-03-10T00:00:00.000Z' });
    const newer = normalizeOracleArtifact({ id: 'a2', sessionId: 's1', timestamp: '2026-03-11T00:00:00.000Z' });
    await appendOracleArtifact({ enabled: true, artifact: older });
    await appendOracleArtifact({ enabled: true, artifact: newer });

    const rows = await loadOracleArtifacts();
    expect(rows).toHaveLength(2);
    const recent = await getRecentOracleArtifacts(1);
    expect(recent[0].id).toBe('a2');

    await deleteOracleArtifact('a2');
    expect((await loadOracleArtifacts()).map((row) => row.id)).toEqual(['a1']);
  });

  it('normalizes legacy artifacts that do not include session mode fields', () => {
    const normalized = normalizeOracleArtifact({ id: 'legacy-1', sessionId: 's1' } as any);
    expect(normalized.sessionMode.key).toBe('open_reflection');
    expect(normalized.sessionMode.label).toBeTruthy();
  });

  it('does not persist artifacts when memory is disabled', async () => {
    await appendOracleArtifact({
      enabled: false,
      artifact: normalizeOracleArtifact({ id: 'off1', sessionId: 's1' })
    });
    expect(await loadOracleArtifacts()).toEqual([]);
  });

  it('exports deterministic JSON and compares artifacts', () => {
    const a = normalizeOracleArtifact({
      id: 'a',
      route: 'assistant_synthesis',
      activeModules: ['assistant'],
      gravity: { status: 'theoretical', informationIntegral: 0.3, deltaGPredicted: 1e-10, scoringVersion: 'v54-gb-v1', canonicalSpecVersion: 'TIEKAT-v54' },
      trend: 'stable'
    });
    const b = normalizeOracleArtifact({
      id: 'b',
      route: 'tarot_focused',
      activeModules: ['assistant', 'tarot'],
      gravity: { status: 'theoretical', informationIntegral: 0.5, deltaGPredicted: 1.4e-10, scoringVersion: 'v55-gb-v1', canonicalSpecVersion: 'TIEKAT-v54' },
      trend: 'rising',
      v55: { specVersion: 'TIEKAT-v55', enabled: true }
    });

    const comparison = compareOracleArtifacts(a, b);
    expect(comparison.routeChanged).toBe(true);
    expect(comparison.moduleDelta.added).toContain('tarot');
    expect(comparison.scoringVersionChanged).toBe(true);
    expect(comparison.v55FramingChanged).toBe(true);

    const json = exportOracleArtifactJson(b);
    expect(json).toContain('"artifactSpecVersion": "TIEKAT-oracle-artifact-v2"');
    const imported = importOracleArtifactJson(json);
    expect(imported.id).toBe('b');
    expect(imported.sessionMode.key).toBe('open_reflection');
    expect(() => importOracleArtifactJson('{"summary":"bad"}')).toThrowError();
  });

  it('builds deterministic v56 summary from awakened sphere state without private trace leakage', () => {
    const input = {
      sessionId: 's1',
      route: 'assistant_synthesis',
      mode: 'assistant_synthesis' as const,
      activeModules: ['assistant'] as const,
      prompt: 'Check sovereign sphere continuity for [name]',
      response: 'Modeled answer',
      gravity: gravity as any,
      consent: { memoryEnabled: true, includeNames: false, allowAncestry: false, hideLivingPersons: true },
      enableV55Framing: true,
      awakenedSphere: {
        awakeningState: 'coherent',
        shieldStatus: 'stable',
        synchronyState: 'resonant',
        overlapState: 'bridged',
        glyphFamily: 'metatron_grid',
        caption: 'Modeled sovereign sphere summary. Theoretical integration layer only.',
        trace: {
          awakeningReason: 'private lineage raw value',
          shieldReason: 'private lineage raw value',
          synchronyReason: 'private lineage raw value',
          overlapReason: 'private lineage raw value'
        },
        v56: {
          specVersion: 'TIEKAT-v56',
          scoringVersion: 'v56-ss-v1',
          confidenceNote: 'Modeled sovereign sphere summary only.',
          canonicalHierarchy: { v54: '', v55: '', v56: '' },
          disclaimers: []
        }
      } as any
    };
    const a = buildOracleArtifact(input);
    const b = buildOracleArtifact(input);
    expect(a.v56).toEqual(b.v56);
    expect(a.v56?.caption.toLowerCase()).toContain('theoretical');
    expect(JSON.stringify(a.v56)).not.toContain('private lineage');
  });
});
