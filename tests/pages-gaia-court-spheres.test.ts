import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  COURT_SPHERES_SOURCE, getCourtSphere, listCourtSpheres, courtSphereCoverage,
  nextZodiacSign
} from '../site/src/courtSpheres';

describe('GAIA v1.1 source-checked Court Spheres',()=>{
  it('holds exactly 12 30-degree spans, 4 Princess quadrants, and all 36 pip cards without duplication',()=>{
    const all=listCourtSpheres();
    const spans=all.filter(s=>s.type==='zodiac-span');
    const quadrants=all.filter(s=>s.type==='polar-quadrant');
    expect(all).toHaveLength(16);
    expect(spans).toHaveLength(12);
    expect(quadrants).toHaveLength(4);
    const referenced=spans.flatMap(s=>s.pipReferences);
    expect(referenced).toHaveLength(36);
    expect(new Set(referenced.map(x=>x.id)).size).toBe(36);
    expect(courtSphereCoverage()).toMatchObject({
      total:16,zodiacSpans:12,polarQuadrants:4,distinctSpanPips:36
    });
    for(const p of referenced){
      const source=deck.find(c=>c.id===p.id)!;
      expect(source.name).toBe(p.name);
      expect(source.hermetic.decan).toBe(p.sign+' '+p.startDegree+'-'+(p.endDegree-1)+'°');
    }
  });

  it('respects the exact published Book T cardinal, fixed and mutable court regions',()=>{
    const checks: Array<[string,string,string,Array<string>]> = [
      ['Knight of Wands','Scorpio','Sagittarius',['7 of Cups','8 of Wands','9 of Wands']],
      ['Queen of Wands','Pisces','Aries',['10 of Cups','2 of Wands','3 of Wands']],
      ['King of Wands','Cancer','Leo',['4 of Cups','5 of Wands','6 of Wands']],
      ['Knight of Cups','Aquarius','Pisces',['7 of Swords','8 of Cups','9 of Cups']],
      ['Queen of Cups','Gemini','Cancer',['10 of Swords','2 of Cups','3 of Cups']],
      ['King of Cups','Libra','Scorpio',['4 of Swords','5 of Cups','6 of Cups']],
      ['Knight of Swords','Taurus','Gemini',['7 of Pentacles','8 of Swords','9 of Swords']],
      ['Queen of Swords','Virgo','Libra',['10 of Pentacles','2 of Swords','3 of Swords']],
      ['King of Swords','Capricorn','Aquarius',['4 of Pentacles','5 of Swords','6 of Swords']],
      ['Knight of Pentacles','Leo','Virgo',['7 of Wands','8 of Pentacles','9 of Pentacles']],
      ['Queen of Pentacles','Sagittarius','Capricorn',['10 of Wands','2 of Pentacles','3 of Pentacles']],
      ['King of Pentacles','Aries','Taurus',['4 of Wands','5 of Pentacles','6 of Pentacles']]
    ];
    for(const [name,from,to,expected] of checks){
      const matching=deck.find(c=>c.name===name)!;
      const sphere=getCourtSphere(matching.id)!;
      expect(sphere.type).toBe('zodiac-span');
      expect(sphere.from).toEqual({sign:from,degree:20});
      expect(sphere.to).toEqual({sign:to,degree:20});
      expect(sphere.pipReferences.map(p=>p.name)).toEqual(expected);
    }
  });

  it('does not fabricate degree-based associations for any Page/Princess or Ace',()=>{
    for(const suit of ['Wands','Cups','Swords','Pentacles']){
      const page=deck.find(c=>c.name==='Page of '+suit)!;
      const source=getCourtSphere(page.id)!;
      expect(source.type).toBe('polar-quadrant');
      expect(source.from).toBeUndefined();
      expect(source.to).toBeUndefined();
      expect(source.pipReferences).toEqual([]);
      expect(source.caveat).toContain('not a continuous 30-degree zodiac band');
      const ace=deck.find(c=>c.name==='Ace of '+suit)!;
      expect(getCourtSphere(ace.id)).toBeNull();
    }
  });

  it('retains explicit historical attribution and unmodified drawn card names',()=>{
    const king=getCourtSphere('cups-king')!;
    expect(king.cardName).toBe('King of Cups');
    expect(king.historicalBookTRole).toBe('King / charioted Prince');
    expect(king.sourceUrl).toBe(COURT_SPHERES_SOURCE.url);
    expect(COURT_SPHERES_SOURCE.kind).toBe('historical-primary-text');
    expect(king.caveat).toContain('not a measured astrological effect');
    expect(getCourtSphere('major-7')).toBeNull();
    expect(getCourtSphere('nonexistent-id')).toBeNull();
    expect(nextZodiacSign('Pisces')).toBe('Aries');
  });

  it('does not change the separately sourced 78-card Hermetic record or original meanings',()=>{
    expect(deck).toHaveLength(78);
    const sphere=getCourtSphere('wands-knight')!;
    expect(sphere.pipReferences[1].name).toBe('8 of Wands');
    const card=deck.find(c=>c.id==='wands-knight')!;
    expect(card.hermetic.decan).toContain('not applicable');
    expect(card.short_upright_meaning.length).toBeGreaterThan(20);
    expect(card.name).toBe('Knight of Wands');
  });
});
