import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  COURT_REFERENCES, courtRankRecord, listCourtRankRecords,
  courtRankReference, courtRankCoverage
} from '../site/src/courtRankConcordance';
import type { CourtAlignment } from '../site/src/courtRankConcordance';

const S=['wands','cups','swords','pentacles'];
const G=['Page','Knight','Queen','King'];

describe('GAIA v1.4 source-bounded Court Rank Concordance',()=>{
  it('covers all 16 original courts exactly once under both methods without changing the deck',()=>{
    for(const method of ['printed-role','rank-hierarchy'] as CourtAlignment[]){
      const entries=listCourtRankRecords(method);
      expect(entries).toHaveLength(16);
      expect(new Set(entries.map(c=>c.canonical.id)).size).toBe(16);
      for(const suit of S)for(const rank of G){
        const id=suit+'-'+rank.toLowerCase();
        const record=entries.find(e=>e.canonical.id===id)!;
        const original=deck.find(c=>c.id===id)!;
        expect(record.canonical.name).toBe(original.name);
        expect(record.canonical.rank).toBe(original.court);
        expect(record.canonical.suit).toBe(original.suit);
        expect(record.alignment).toBe(method);
      }
    }
    expect(courtRankCoverage()).toEqual({
      courtCards:16,suits:4,rankAlignmentModes:2,majorTrumps:22,
      unindexedMinorPipsAndAces:40,interpretiveEquivalenceEstablished:false
    });
  });

  it('prints Book T Knights as mounted Fire, Kings as charioted Air in the literal source alignment',()=>{
    const knight=courtRankRecord('wands-knight','printed-role')!;
    expect(knight.canonical.name).toBe('Knight of Wands');
    expect(knight.goldenDawn).toMatchObject({
      printedName:'Knight of Wands',role:'Knight / mounted King',
      elementalGrade:'Fire of Fire',bookTTitle:'Lord of the Flame and the Lightning'
    });
    expect(knight.thoth).toMatchObject({name:'Knight of Wands',rank:'Knight'});
    const king=courtRankRecord('wands-king','printed-role')!;
    expect(king.goldenDawn).toMatchObject({
      printedName:'King of Wands',role:'King / charioted Prince',
      elementalGrade:'Air of Fire',bookTTitle:'Prince of the Chariot of Fire'
    });
    expect(king.thoth).toMatchObject({name:'Prince of Wands',rank:'Prince'});
  });

  it('supports alternative hierarchy comparison without changing actual Rider–Waite–Smith cards',()=>{
    const king=courtRankRecord('wands-king','rank-hierarchy')!;
    expect(king.canonical.name).toBe('King of Wands');
    expect(king.thoth.name).toBe('Knight of Wands');
    expect(king.goldenDawn.elementalGrade).toBe('Fire of Fire');
    const knight=courtRankRecord('wands-knight','rank-hierarchy')!;
    expect(knight.canonical.name).toBe('Knight of Wands');
    expect(knight.thoth.name).toBe('Prince of Wands');
    expect(knight.goldenDawn.elementalGrade).toBe('Air of Fire');
    expect(king.provenance.isDebated).toBe(true);
    expect(knight.provenance.warning).toContain('NOT a literal 1912');
    expect(courtRankRecord('wands-king','printed-role')!.canonical).toEqual(king.canonical);
    expect(courtRankRecord('wands-knight','printed-role')!.canonical).toEqual(knight.canonical);
  });

  it('keeps Queens and Pages consistent across the two alignment approaches',()=>{
    for(const suit of S)for(const rank of ['page','queen']){
      const id=suit+'-'+rank;
      const a=courtRankRecord(id,'printed-role')!;
      const b=courtRankRecord(id,'rank-hierarchy')!;
      expect(a.goldenDawn).toEqual(b.goldenDawn);
      expect(a.thoth).toEqual(b.thoth);
      expect(a.provenance.isDebated).toBe(false);
    }
    expect(courtRankRecord('cups-page','printed-role')!.thoth.name).toBe('Princess of Cups');
    expect(courtRankRecord('cups-queen','rank-hierarchy')!.thoth.name).toBe('Queen of Cups');
  });

  it('uses historic suit names and does not pass Golden Dawn elements off as Marseille evidence',()=>{
    const names=[
      ['wands','Bâtons','Wands'],
      ['cups','Coupes','Cups'],
      ['swords','Épées','Swords'],
      ['pentacles','Deniers','Disks']
    ];
    for(const [suit,marseille,thoth] of names){
      const card=courtRankRecord(suit+'-page','printed-role')!;
      expect(card.marseille.name).toContain(marseille);
      expect(card.marseille.note).toContain('no Golden Dawn elemental grade');
      expect(card.thoth.name).toBe('Princess of '+thoth);
    }
    expect(courtRankRecord('pentacles-king','rank-hierarchy')!.thoth.name).toBe('Knight of Disks');
    expect(courtRankRecord('pentacles-king','printed-role')!.thoth.name).toBe('Prince of Disks');
  });

  it('rejects fabricated card IDs, non-courts and unknown alignment choices',()=>{
    expect(courtRankRecord('major-8','printed-role')).toBeNull();
    expect(courtRankRecord('wands-8','printed-role')).toBeNull();
    expect(courtRankRecord('cups-1','printed-role')).toBeNull();
    expect(courtRankRecord('not-a-card','rank-hierarchy')).toBeNull();
    expect(()=>courtRankRecord('wands-king','fake' as CourtAlignment)).toThrow('Unknown court alignment');
    expect(deck).toHaveLength(78);
  });

  it('has explicit traceable primary and secondary references for each comparison',()=>{
    expect(COURT_REFERENCES).toHaveLength(5);
    for(const ref of COURT_REFERENCES){
      expect(courtRankReference(ref.id)).toEqual(ref);
      expect(ref.url).toMatch(/^https:\/\//);
      expect(ref.scope.length).toBeGreaterThan(40);
    }
    expect(COURT_REFERENCES.filter(x=>x.kind==='historical-primary-text')).toHaveLength(3);
    expect(COURT_REFERENCES.filter(x=>x.kind==='modern-secondary-comparison')).toHaveLength(2);
    expect(()=>courtRankReference('invented')).toThrow('Missing curated court source');
    const r=courtRankRecord('swords-king','printed-role')!;
    for(const id of r.provenance.sourceIds)expect(courtRankReference(id)).toBeTruthy();
  });
});
