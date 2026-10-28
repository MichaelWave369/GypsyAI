import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';
import { expectedBookTAceCourt } from '../site/src/bookTCourtCatalog';
import {
  auditHermeticCard, hermeticAuditCoverage, HERMETIC_AUDIT_REFERENCES
} from '../site/src/hermeticAudit';

const cards=deck as TarotCard[];
const aces=cards.filter(c=>c.arcana==='minor'&&c.number===1);
const courts=cards.filter(c=>c.arcana==='minor'&&c.court!==null);
const selected=(name:string)=>cards.find(c=>c.name===name)!;

describe('GAIA v1.0 Book T Ace and court index',()=>{
  it('source indexes all four Aces as elemental roots in Kether, never as pip decans',()=>{
    expect(aces).toHaveLength(4);
    const elements=['Fire','Water','Air','Earth'];
    for(const card of aces){
      const expected=expectedBookTAceCourt(card);
      expect(card.hermetic.hermetic_title).toBe('Root of the Powers of '+card.hermetic.element);
      expect(elements).toContain(card.hermetic.element);
      expect(card.hermetic).toMatchObject({
        ...expected,sephirah:'Kether',decan:'none',planet_ruler:'n/a'
      });
      const audit=auditHermeticCard(card);
      expect(audit.sources).toContain('book-t-1912-court-mirror');
      expect(audit.fields.map(f=>f.field)).toContain('sephirah');
      expect(audit.status).toBe('pending-specialist-review');
    }
  });

  it('indexes all sixteen original Book T court titles, printed rank labels and nested elemental grades',()=>{
    expect(courts).toHaveLength(16);
    for(const card of courts){
      const expected=expectedBookTAceCourt(card);
      expect(card.hermetic).toMatchObject(expected);
      expect(expected.book_t_elemental_grade).toContain(' of ');
      const audit=auditHermeticCard(card);
      expect(audit.status).toBe('pending-specialist-review');
      expect(audit.fields).toHaveLength(5);
      expect(audit.sources).toContain('book-t-1912-court-mirror');
      expect(audit.pendingFields).toContain('Modern deck court-region equivalence and pictorial symbolism across editions');
      expect(card.hermetic.decan).toContain('not applicable');
      expect(card.hermetic.planet_ruler).toContain('not applicable');
    }
    expect(new Set(courts.map(c=>c.hermetic.hermetic_title)).size).toBe(16);
  });

  it('keeps familiar printed court card names distinct from Book T rank roles',()=>{
    expect(selected('Page of Swords').hermetic).toMatchObject({
      book_t_role:'Knave / Princess',book_t_elemental_grade:'Earth of Air',
      hermetic_title:'Princess of the Rushing Winds; Lotus of the Palace of Air'
    });
    expect(selected('Knight of Wands').hermetic).toMatchObject({
      book_t_role:'Knight / mounted King',book_t_elemental_grade:'Fire of Fire',
      hermetic_title:'Lord of the Flame and the Lightning'
    });
    expect(selected('Queen of Cups').hermetic).toMatchObject({
      book_t_role:'Queen',book_t_elemental_grade:'Water of Water',
      hermetic_title:'Queen of the Thrones of the Waters'
    });
    expect(selected('King of Pentacles').hermetic).toMatchObject({
      book_t_role:'King / charioted Prince',book_t_elemental_grade:'Air of Earth',
      hermetic_title:'Prince of the Chariot of Earth'
    });
  });

  it('tracks what is checked without falsely graduating incomplete courts to full-audit status',()=>{
    expect(hermeticAuditCoverage()).toMatchObject({
      total:78, traditionChecked:58, specialistPending:20,
      bookTAceCourtTitlesIndexed:20,courtRegionsStillPending:16
    });
    expect(HERMETIC_AUDIT_REFERENCES.find(x=>x.id==='book-t-1912-court-mirror')?.url)
      .toBe('https://hermeticcloud.com/library/liber-lxxviii/');
    expect(HERMETIC_AUDIT_REFERENCES.find(x=>x.id==='book-t-1912-court-mirror')?.type)
      .toBe('historical-primary-text');
  });

  it('fails closed when Ace and court source data are edited or fabricated',()=>{
    const ace=selected('Ace of Wands');
    expect(()=>auditHermeticCard({...ace, hermetic:{
      ...ace.hermetic,hermetic_title:'Generic title'
    }})).toThrow('Hermetic audit mismatch');
    const king=selected('King of Cups');
    expect(()=>auditHermeticCard({...king,hermetic:{
      ...king.hermetic,book_t_elemental_grade:'Water of Water'
    }})).toThrow('Hermetic audit mismatch');
    expect(()=>expectedBookTAceCourt(selected('10 of Swords'))).toThrow('Expected exactly');
    expect(()=>expectedBookTAceCourt(selected('The Chariot'))).toThrow('requires minor');
  });
});
