import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGedcom } from '@/lib/ancestry/gedcom';

describe('GEDCOM parser', () => {
  it('parses families, people and events', () => {
    const text = readFileSync('tests/fixtures/sample.ged', 'utf8');
    const out = parseGedcom(text);
    expect(Object.keys(out.people)).toHaveLength(6);
    expect(Object.keys(out.families)).toHaveLength(2);
    expect(out.families['F1'].chil).toContain('I3');
    expect(out.people['I3'].famc).toContain('F1');
    expect(out.families['F2'].events[0].type).toBe('MARR');
  });
});
