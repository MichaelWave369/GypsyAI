import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  MINOR_REFERENCES, THOTH_PIP_KEYWORDS, listMinorConcordanceEntries,
  minorConcordanceCoverage, minorConcordanceEntry, minorReference
} from '../site/src/minorConcordance';
import { auditHermeticCard } from '../site/src/hermeticAudit';

describe('GAIA v1.5 source-indexed Minor Ace and Pip Concordance',()=>{
  const entries=listMinorConcordanceEntries();

  it('indexes all 40 Ace and numbered Minor cards exactly once and preserves canonical identity',()=>{
    expect(entries).toHaveLength(40);
    expect(new Set(entries.map(e=>e.id)).size).toBe(40);
    expect(entries.filter(e=>e.canonical.isAce)).toHaveLength(4);
    expect(entries.filter(e=>!e.canonical.isAce)).toHaveLength(36);
    expect(minorConcordanceCoverage()).toEqual({
      minorCards:56,structuralComparisons:40,aces:4,decanPips:36,
      courtCardsComparedInSeparateChamber:16,
      interpretiveReviewsConferred:0,
      structurallyIndexedAcrossMajorCourtAndPip:78
    });
    for(const e of entries){
      const original=deck.find(c=>c.id===e.id)!;
      expect(e.canonical.name).toBe(original.name);
      expect(e.canonical.number).toBe(original.number);
      expect(e.rws.label).toBe(original.name);
      expect(e.provenance.claimType).toBe('historical-structural-crosswalk');
      expect(e.provenance.interpretationReviewed).toBe(false);
    }
  });

  it('preserves the exact 36 Thoth Ace-excluded pip keywords per suit, independently of Book T Lord titles',()=>{
    const expected={
      Wands:['Dominion','Virtue','Completion','Strife','Victory','Valour','Swiftness','Strength','Oppression'],
      Cups:['Love','Abundance','Luxury','Disappointment','Pleasure','Debauch','Indolence','Happiness','Satiety'],
      Swords:['Peace','Sorrow','Truce','Defeat','Science','Futility','Interference','Cruelty','Ruin'],
      Pentacles:['Change','Works','Power','Worry','Success','Failure','Prudence','Gain','Wealth']
    };
    expect(THOTH_PIP_KEYWORDS).toEqual(expected);
    for(const e of entries.filter(x=>!x.canonical.isAce)){
      const expectedKey=expected[e.canonical.suit][e.canonical.number-2];
      expect(e.thoth.printedKeyword).toBe(expectedKey);
      expect(e.thoth.label).toContain(' · '+expectedKey);
    }
    expect(minorConcordanceEntry('wands-3')?.thoth.printedKeyword).toBe('Virtue');
    expect(minorConcordanceEntry('cups-7')?.thoth.printedKeyword).toBe('Debauch');
    expect(minorConcordanceEntry('swords-6')?.thoth.printedKeyword).toBe('Science');
    expect(minorConcordanceEntry('pentacles-7')?.thoth.printedKeyword).toBe('Failure');
    expect(minorConcordanceEntry('pentacles-3')?.thoth.printedKeyword).toBe('Works');
  });

  it('checks all 36 Golden Dawn fields against the independently audited canonical deck',()=>{
    for(const e of entries.filter(x=>!x.canonical.isAce)){
      const card=deck.find(x=>x.id===e.id)!;
      const audit=auditHermeticCard(card);
      expect(audit.status).toBe('checked-in-golden-dawn-tradition');
      expect(e.goldenDawn.title).toBe(card.hermetic.hermetic_title);
      expect(e.goldenDawn.decan).toBe(card.hermetic.decan);
      expect(e.goldenDawn.planetRuler).toBe(card.hermetic.planet_ruler);
      expect(e.goldenDawn.sephirah).toBe(card.hermetic.sephirah);
      expect(e.goldenDawn.isDecanPip).toBe(true);
      expect(e.goldenDawn.decan).toMatch(/\d+-\d+°$/);
    }
    expect(minorConcordanceEntry('wands-2')?.goldenDawn).toMatchObject({
      title:'Lord of Dominion',decan:'Aries 0-9°',planetRuler:'Mars'
    });
    expect(minorConcordanceEntry('swords-10')?.goldenDawn).toMatchObject({
      title:'Lord of Ruin',decan:'Gemini 20-29°',planetRuler:'Sun'
    });
  });

  it('keeps all four Aces elemental, in Kether, without an invented decan or Thoth keyword',()=>{
    for(const suit of ['wands','cups','swords','pentacles']){
      const e=minorConcordanceEntry(suit+'-ace')!;
      expect(e.canonical.isAce).toBe(true);
      expect(e.canonical.number).toBe(1);
      expect(e.goldenDawn.sephirah).toBe('Kether');
      expect(e.goldenDawn.isDecanPip).toBe(false);
      expect(e.goldenDawn.decan).toBeNull();
      expect(e.goldenDawn.planetRuler).toBeNull();
      expect(e.thoth.printedKeyword).toBeNull();
      expect(e.marseille.normalizedLabel).toContain('As · ');
      expect(e.marseille.printedLabelCaution).toContain('NOT a claim');
    }
    expect(minorConcordanceEntry('pentacles-ace')?.thoth.label).toBe('Ace of Disks');
  });

  it('distinguishes Marseille non-scenic arrangements and suit labels from Waite scenes and Thoth Disks',()=>{
    const p=minorConcordanceEntry('pentacles-9')!;
    expect(p.marseille.suitLabel).toBe('Deniers');
    expect(p.rws.label).toBe('9 of Pentacles');
    expect(p.thoth.suitLabel).toBe('Disks');
    expect(p.thoth.label).toBe('9 of Disks · Gain');
    expect(p.marseille.visualConvention).toContain('Repeated suit emblems');
    expect(p.rws.visualConvention).toContain('illustrated scene');
    expect(p.marseille.printedLabelCaution).toContain('NOT a claim');
    expect(p.marseille.normalizedLabel).not.toBe('historical printed cartouche');
  });

  it('fails closed on invalid cards and never returns a fake historical result',()=>{
    expect(minorConcordanceEntry('major-7')).toBeNull();
    expect(minorConcordanceEntry('wands-king')).toBeNull();
    expect(minorConcordanceEntry('nonexistent')).toBeNull();
    expect(entries.some(e=>e.canonical.suit==='Bananas')).toBe(false);
  });

  it('has typed, traceable references and does not confuse primary and modern sources',()=>{
    expect(MINOR_REFERENCES).toHaveLength(5);
    expect(MINOR_REFERENCES.filter(r=>r.kind==='historical-primary-text')).toHaveLength(2);
    expect(MINOR_REFERENCES.filter(r=>r.kind==='modern-secondary-index')).toHaveLength(3);
    for(const ref of MINOR_REFERENCES){
      expect(minorReference(ref.id)).toEqual(ref);
      expect(ref.url).toMatch(/^https:\/\//);
      expect(ref.scope.length).toBeGreaterThan(75);
    }
    for(const e of entries){
      expect(minorReference(e.rws.sourceId).id).toBe('waite-pictorial-key');
      expect(minorReference(e.marseille.sourceId).id).toBe('marseille-pip-index');
      expect(minorReference(e.goldenDawn.sourceId).id).toBe('golden-dawn-book-t');
      expect(minorReference(e.thoth.sourceId).id).toBe('thoth-title-list');
    }
    expect(()=>minorReference('invented')).toThrow('Unrecognized structural evidence source');
    expect(deck).toHaveLength(78);
  });
});
