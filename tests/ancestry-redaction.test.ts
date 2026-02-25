import { describe, expect, it } from 'vitest';
import { isLiving, redactPerson } from '@/lib/ancestry/redaction';

describe('living person redaction', () => {
  const p = { id: 'x', names: ['Alex Doe'], sex: 'M', birth: { type: 'BIRT', date: '2001' }, death: undefined, events: [], notes: ['note'], famc: [], fams: [], sources: [] };
  it('detects living by 120-year heuristic', () => {
    expect(isLiving(p as any, 2026)).toBe(true);
  });
  it('redacts living details by default mode', () => {
    const r = redactPerson(p as any, true);
    expect(r.names[0]).toBe('Private Person');
    expect(r.notes).toHaveLength(0);
  });
});
