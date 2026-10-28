import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';
import {
  auditHermeticCard, hermeticAuditCoverage, goldenDawnDecan, goldenDawnMajor,
  getHermeticAuditForCard, HERMETIC_AUDIT_REFERENCES
} from '../site/src/hermeticAudit';

const cards=deck as TarotCard[];
const card=(name:string)=>{const found=cards.find(c=>c.name===name);if(!found)throw new Error(name);return found;};

describe('GAIA v0.9 Golden Dawn correspondence evidence audit',()=>{
  it('verifies all 36 numbered 2–10 decan, ruler and historical title triples',()=>{
    const pips=cards.filter(c=>c.arcana==='minor'&&typeof c.number==='number'&&c.number>=2&&c.number<=10);
    expect(pips).toHaveLength(36);
    for(const c of pips){
      const expected=goldenDawnDecan(c.suit as 'Wands', c.number!);
      expect(c.hermetic.decan).toBe(expected.decan);
      expect(c.hermetic.planet_ruler).toBe(expected.planet_ruler);
      expect(c.hermetic.hermetic_title).toBe(expected.hermetic_title);
      expect(auditHermeticCard(c).fields).toHaveLength(3);
    }
    expect(new Set(pips.map(c=>c.hermetic.decan)).size).toBe(36);
  });
  it('corrects the real inherited false source mappings, not merely the UI wording',()=>{
    expect(card('2 of Wands').hermetic).toMatchObject({
      decan:'Aries 0-9°',planet_ruler:'Mars',hermetic_title:'Lord of Dominion'
    });
    expect(card('5 of Wands').hermetic).toMatchObject({
      decan:'Leo 0-9°',planet_ruler:'Saturn',hermetic_title:'Lord of Strife'
    });
    expect(card('8 of Wands').hermetic).toMatchObject({
      decan:'Sagittarius 0-9°',planet_ruler:'Mercury',hermetic_title:'Lord of Swiftness'
    });
    expect(card('10 of Swords').hermetic).toMatchObject({
      decan:'Gemini 20-29°',planet_ruler:'Sun',hermetic_title:'Lord of Ruin'
    });
    expect(card('9 of Pentacles').hermetic).toMatchObject({
      decan:'Virgo 10-19°',planet_ruler:'Venus',hermetic_title:'Lord of Material Gain'
    });
  });
  it('verifies all 22 traditional major letter, attribution and Tree path mappings',()=>{
    const majors=cards.filter(c=>c.arcana==='major');
    expect(majors).toHaveLength(22);
    for(const c of majors){
      const expected=goldenDawnMajor(c.number!);
      expect(c.hermetic).toMatchObject(expected);
      expect(auditHermeticCard(c).fields).toHaveLength(3);
    }
    expect(card('The Emperor').hermetic.path).toBe('2->6');
    expect(card('The Hierophant').hermetic.path).toBe('2->4');
    expect(card('The Lovers').hermetic.path).toBe('3->6');
    expect(card('The Chariot').hermetic.path).toBe('3->5');
  });
  it('explicitly leaves court/ace mapping and unrelated generic majors unverified',()=>{
    const pending=cards.filter(c=>c.arcana==='minor'&&(c.court!==null||c.number===1));
    expect(pending).toHaveLength(20);
    expect(pending.every(c=>auditHermeticCard(c).status==='pending-specialist-review')).toBe(true);
    for(const major of cards.filter(c=>c.arcana==='major')){
      expect(auditHermeticCard(major).pendingFields).toContain('sephirothic_context');
      expect(auditHermeticCard(major).pendingFields).toContain('magical_title');
    }
    expect(hermeticAuditCoverage()).toMatchObject({
      total:78,traditionChecked:58,specialistPending:20
    });
  });
  it('keeps the Golden Dawn reference explicit and separated from empirical proof',()=>{
    expect(HERMETIC_AUDIT_REFERENCES.map(r=>r.id)).toEqual(['book-t-1912','golden-dawn-tree']);
    expect(HERMETIC_AUDIT_REFERENCES[0].url).toContain('/crowley/equinox/i/viii/');
    const c=getHermeticAuditForCard('wands-8')!;
    expect(c.sources).toContain('book-t-1912');
    expect(c.notes.join(' ')).toContain('not a prediction');
    expect(getHermeticAuditForCard('fake-id')).toBeNull();
  });
  it('refuses invalid inputs or a mutated card that conflicts with published source mapping',()=>{
    expect(()=>goldenDawnDecan('Wands',1)).toThrow('2–10');
    expect(()=>goldenDawnDecan('Wands',11)).toThrow('2–10');
    expect(()=>goldenDawnMajor(22)).toThrow('0–21');
    expect(()=>auditHermeticCard({...card('The Chariot'),
      hermetic:{...card('The Chariot').hermetic,path:'3->6'}})).toThrow('audit mismatch');
    expect(()=>auditHermeticCard({...card('5 of Wands'),
      hermetic:{...card('5 of Wands').hermetic,planet_ruler:'Mercury'}})).toThrow('audit mismatch');
  });
});
