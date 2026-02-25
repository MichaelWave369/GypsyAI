import { AncestryData, Family, Person } from './types';

interface NodeLine { level: number; tag: string; value?: string; pointer?: string }

const parseLine = (line: string): NodeLine | null => {
  const m = line.match(/^(\d+)\s+(?:(@[^@]+@)\s+)?([A-Z0-9_]+)(?:\s+(.*))?$/);
  if (!m) return null;
  return { level: Number(m[1]), pointer: m[2], tag: m[3], value: m[4] };
};

const cleanId = (x?: string) => x?.replaceAll('@', '');

export function parseGedcom(text: string): AncestryData {
  const lines = text.split(/\r?\n/).map(parseLine).filter(Boolean) as NodeLine[];
  const people: Record<string, Person> = {};
  const families: Record<string, Family> = {};
  const warnings: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const head = lines[i];
    if (head.level !== 0 || !head.pointer) {
      i++;
      continue;
    }

    if (head.tag === 'INDI') {
      const id = cleanId(head.pointer)!;
      const p: Person = { id, names: [], events: [], notes: [], famc: [], fams: [], sources: [] };
      i++;
      while (i < lines.length && lines[i].level > 0) {
        const l = lines[i];
        if (l.tag === 'NAME' && l.value) p.names.push(l.value.replaceAll('/', '').trim());
        if (l.tag === 'SEX' && l.value) p.sex = l.value;
        if (l.tag === 'FAMC' && l.value) p.famc.push(cleanId(l.value)!);
        if (l.tag === 'FAMS' && l.value) p.fams.push(cleanId(l.value)!);
        if (l.tag === 'NOTE' && l.value) p.notes.push(l.value);
        if (l.tag === 'SOUR' && l.value) p.sources.push(l.value);
        if (l.tag === 'BIRT' || l.tag === 'DEAT') {
          const ev = { type: l.tag } as any;
          i++;
          while (i < lines.length && lines[i].level > l.level) {
            const s = lines[i];
            if (s.tag === 'DATE') ev.date = s.value;
            if (s.tag === 'PLAC') ev.place = s.value;
            if (s.tag === 'NOTE' && s.value) p.notes.push(s.value);
            i++;
          }
          if (l.tag === 'BIRT') p.birth = ev;
          if (l.tag === 'DEAT') p.death = ev;
          p.events.push(ev);
          continue;
        }
        i++;
      }
      people[id] = p;
      continue;
    }

    if (head.tag === 'FAM') {
      const id = cleanId(head.pointer)!;
      const f: Family = { id, chil: [], events: [], notes: [] };
      i++;
      while (i < lines.length && lines[i].level > 0) {
        const l = lines[i];
        if (l.tag === 'HUSB' && l.value) f.husb = cleanId(l.value);
        if (l.tag === 'WIFE' && l.value) f.wife = cleanId(l.value);
        if (l.tag === 'CHIL' && l.value) f.chil.push(cleanId(l.value)!);
        if (l.tag === 'NOTE' && l.value) f.notes.push(l.value);
        if (l.tag === 'MARR' || l.tag === 'DIV') {
          const ev = { type: l.tag } as any;
          i++;
          while (i < lines.length && lines[i].level > l.level) {
            const s = lines[i];
            if (s.tag === 'DATE') ev.date = s.value;
            if (s.tag === 'PLAC') ev.place = s.value;
            if (s.tag === 'NOTE' && s.value) f.notes.push(s.value);
            i++;
          }
          f.events.push(ev);
          continue;
        }
        i++;
      }
      families[id] = f;
      continue;
    }

    i++;
  }

  if (!Object.keys(people).length) warnings.push('No INDI records found.');
  return { people, families, warnings };
}
