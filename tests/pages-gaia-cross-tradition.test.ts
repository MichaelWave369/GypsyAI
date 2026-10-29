import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  CONCORDANCE_SOURCES, concordanceEntries, concordanceEntry,
  concordanceCoverage, findConcordanceSource
} from '../site/src/crossTradition';
import { getHermeticAuditForCard } from '../site/src/hermeticAudit';

describe('GAIA v1.2 limited Cross-Tradition Concordance',()=>{
  const samples=concordanceEntries();

  it('curates exactly eight transparent structural case studies rather than fake full-deck coverage',()=>{
    expect(samples).toHaveLength(8);
    expect(new Set(samples.map(c=>c.cardId)).size).toBe(8);
    expect(concordanceCoverage()).toEqual({
      originalDeckCards:78, majorTrumps:22, comparisons:8,pending:14,
      traditions:4,interpretationReviewsNotImplied:true
    });
    expect(concordanceEntry('major-2')).toBeNull();
    expect(concordanceEntry('fake')).toBeNull();
  });

  it('preserves the exact canonical name and identity of every locally drawn card',()=>{
    for(const c of samples){
      const original=deck.find(d=>d.id===c.cardId)!;
      expect(original.arcana).toBe('major');
      expect(c.canonicalName).toBe(original.name);
      expect(c.rws.label).toBe(original.name);
      expect(c.interpretationBoundary.length).toBeGreaterThan(55);
      const verified=getHermeticAuditForCard(c.cardId)!;
      expect(verified.status).toBe('checked-in-golden-dawn-tradition');
      expect(c.goldenDawn.hebrewLetter).toBe(original.hermetic.hebrew_letter);
      expect(c.goldenDawn.attribution).toBe(original.hermetic.attribution);
      expect(c.goldenDawn.path).toBe(original.hermetic.path);
    }
  });

  it('shows real historical Strength and Justice divergence in numbering and labels',()=>{
    const strength=concordanceEntry('major-8')!;
    expect(strength.rws).toMatchObject({label:'Strength',ordinal:'VIII'});
    expect(strength.marseille).toMatchObject({label:'La Force',ordinal:'XI'});
    expect(strength.thoth).toMatchObject({label:'Lust',ordinal:'XI'});
    expect(strength.goldenDawn).toMatchObject({hebrewLetter:'Teth',attribution:'Leo'});
    expect(strength.differences).toContain('numbering');

    const justice=concordanceEntry('major-11')!;
    expect(justice.rws).toMatchObject({label:'Justice',ordinal:'XI'});
    expect(justice.marseille).toMatchObject({label:'La Justice',ordinal:'VIII'});
    expect(justice.thoth).toMatchObject({label:'Adjustment',ordinal:'VIII'});
    expect(justice.goldenDawn).toMatchObject({hebrewLetter:'Lamed',attribution:'Libra'});
  });

  it('does not give Marseille the English Death cartouche, or number Le Mat',()=>{
    const death=concordanceEntry('major-13')!;
    expect(death.rws).toMatchObject({label:'Death',ordinal:'XIII'});
    expect(death.marseille).toMatchObject({label:'XIII · untitled',ordinal:'XIII'});
    expect(death.differences).toContain('untitled-card');
    const fool=concordanceEntry('major-0')!;
    expect(fool.rws.ordinal).toBe('0');
    expect(fool.marseille.ordinal).toBe('unnumbered');
    expect(fool.marseille.label).toBe('Le Mat');
  });

  it('labels Crowley/Harris renamings without implying copied art or shared predictions',()=>{
    expect(concordanceEntry('major-14')?.thoth.label).toBe('Art');
    expect(concordanceEntry('major-20')?.thoth.label).toBe('The Aeon');
    expect(concordanceEntry('major-21')?.thoth.label).toBe('The Universe');
    expect(concordanceEntry('major-7')?.thoth.label).toBe('The Chariot');
    expect(samples.every(e=>e.thoth.sourceId==='thoth-names')).toBe(true);
    expect(samples.every(e=>e.differences.every(x=>['numbering','renaming','untitled-card','unchanged-label'].includes(x)))).toBe(true);
  });

  it('links every displayed source to a typed and recognized external reference',()=>{
    const types=CONCORDANCE_SOURCES.map(s=>s.type);
    expect(types).toContain('historical-primary-text');
    expect(types).toContain('institutional-exhibit');
    expect(types).toContain('secondary-reference');
    expect(types).toContain('academic-study');
    for(const s of CONCORDANCE_SOURCES){
      expect(s.url.startsWith('https://')).toBe(true);
      expect(s.scope.length).toBeGreaterThan(45);
    }
    for(const e of samples){
      for(const face of [e.rws,e.marseille,e.thoth]){
        expect(findConcordanceSource(face.sourceId).url).toMatch(/^https:\/\//);
        expect(face.note).not.toBe('');
      }
      expect(findConcordanceSource(e.goldenDawn.sourceId).id).toBe('gd-book-t');
    }
    expect(()=>findConcordanceSource('invented-source')).toThrow();
  });

  it('keeps original 78-card deck and sourced 1912 Book T fields immutable',()=>{
    expect(deck).toHaveLength(78);
    const original=deck.find(x=>x.id==='major-8')!;
    const before=JSON.stringify(original);
    samples[0].rws.label='modified local UI sample';
    samples[0].differences.push('renaming');
    expect(JSON.stringify(deck.find(x=>x.id==='major-8'))).toBe(before);
    const next=concordanceEntries();
    expect(next.find(x=>x.cardId==='major-0')!.rws.label).toBe('The Fool');
  });
});
