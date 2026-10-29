import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  CONCORDANCE_SOURCES, concordanceEntries, concordanceEntry,
  concordanceCoverage, findConcordanceSource
} from '../site/src/crossTradition';
import { getHermeticAuditForCard } from '../site/src/hermeticAudit';

describe('GAIA v1.3 complete Major structural Cross-Tradition Concordance',()=>{
  const samples=concordanceEntries();

  it('indexes exactly 22 structural comparisons, while not implying full 78-card interpretation coverage',()=>{
    expect(samples).toHaveLength(22);
    expect(new Set(samples.map(c=>c.cardId)).size).toBe(22);
    expect(samples.map(c=>c.cardId)).toEqual(Array.from({length:22},(_,i)=>'major-'+i));
    expect(concordanceCoverage()).toEqual({
      originalDeckCards:78, majorTrumps:22, comparisons:22,pending:0,
      traditions:4,interpretationReviewsNotImplied:true
    });
    expect(concordanceEntry('major-2')?.marseille.label).toBe('La Papesse');
    expect(concordanceEntry('fake')).toBeNull();
  });

  it('preserves the exact canonical name and identity of every locally drawn card',()=>{
    for(const c of samples){
      const original=deck.find(d=>d.id===c.cardId)!;
      expect(original.arcana).toBe('major');
      expect(c.canonicalName).toBe(original.name);
      expect(c.rws.label).toBe(original.name);
      expect(c.interpretationBoundary.length).toBeGreaterThan(55);
      expect(c.marseille.engravedCartouche?.length).toBeGreaterThan(5);
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
    expect(samples.every(e=>e.thoth.sourceId==='thoth-full-index')).toBe(true);
    expect(samples.every(e=>e.differences.every(x=>['numbering','renaming','untitled-card','unchanged-label'].includes(x)))).toBe(true);
  });

  it('links every displayed source to a typed and recognized external reference',()=>{
    const types=CONCORDANCE_SOURCES.map(s=>s.type);
    expect(types).toContain('historical-primary-text');
    expect(types).toContain('institutional-exhibit');
    expect(findConcordanceSource('bnf-conver-catalog').url).toBe('https://catalogue.bnf.fr/ark:/12148/cb43706229t');
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

  it('tracks historical additive Conver numerals and separately transcribed plate wording',()=>{
    const cases: Array<[string,string,string,string]> = [
      ['major-1','I','LE·BATELEUR','The Magus'],
      ['major-4','IIII','LEMPEREUR','The Emperor'],
      ['major-9','VIIII',"L'HERMITE",'The Hermit'],
      ['major-10','X','LA·ROVE·DE·FORTVNE','Fortune'],
      ['major-14','XIIII','TEMPERANCE','Art'],
      ['major-16','XVI','LA·MAISON·DIEV','The Tower'],
      ['major-19','XVIIII','LE SOLEIL','The Sun']
    ];
    for (const [id,ordinal,plate,thoth] of cases){
      const c=concordanceEntry(id)!;
      expect(c.marseille.ordinal).toBe(ordinal);
      expect(c.marseille.engravedCartouche).toBe(plate);
      expect(c.thoth.label).toBe(thoth);
      expect(c.marseille.sourceId).toBe('marseille-pattern');
    }
    expect(concordanceEntry('major-13')?.marseille.engravedCartouche).toBe('(no cartouche)');
  });

  it('does not silently equate Golden Dawn and Thoth Emperor/Star Hebrew attributions',()=>{
    const emperor=concordanceEntry('major-4')!;
    const star=concordanceEntry('major-17')!;
    expect(emperor.goldenDawn.hebrewLetter).toBe('Heh');
    expect(star.goldenDawn.hebrewLetter).toBe('Tzaddi');
    expect(emperor.thoth.note).toContain('Tzaddi');
    expect(star.thoth.note).toContain('Heh');
    expect(emperor.interpretationBoundary).toContain('must not be conflated');
    expect(star.interpretationBoundary).toContain('conceals this genuine attribution difference');
  });

  it('uses source-aware labels without inventing a 56-card Minor Arcana concordance',()=>{
    expect(samples.some(e=>e.cardId.includes('wands'))).toBe(false);
    expect(concordanceCoverage().originalDeckCards).toBe(78);
    expect(concordanceCoverage().majorTrumps).toBe(22);
    expect(concordanceCoverage().interpretationReviewsNotImplied).toBe(true);
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
