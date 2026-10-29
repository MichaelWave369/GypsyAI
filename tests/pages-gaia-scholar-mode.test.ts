import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import type { DrawnCard, TarotCard } from '@/types';
import { ritualReadingPacket } from '../site/src/ritualDraw';
import { atlasReadingPacket, ATLAS_TEMPLATES } from '../site/src/spreadAtlas';
import { scholarPacket, scholarPreview } from '../site/src/scholarMode';
import { readingInvitation } from '../site/src/readingExperience';

const cards = deck as TarotCard[];
function chosen(names:string[], positions:string[]): DrawnCard[] {
  return names.map((name,i)=>{
    const card=cards.find(c=>c.name===name);
    if (!card) throw new Error('Missing card '+name);
    return {card,position:positions[i],orientation:i%2===0?'upright':'reversed'};
  });
}
const sample=()=>chosen(['The Chariot','5 of Wands','10 of Swords'],['Past','Present','Future']);

describe('GAIA v0.8 opt-in historical Scholar Mode',()=>{
  it('only attaches reviewed historical notes to matched cards',()=>{
    const view=scholarPreview(sample());
    expect(view.drawnCount).toBe(3);
    expect(view.matches.map(m=>m.cardName)).toEqual(['The Chariot','5 of Wands']);
    expect(view.unreviewed).toEqual(['10 of Swords']);
    for(const match of view.matches){
      expect(match.sectionUrl).toMatch(/^https:\/\/sacred-texts\.com\/book\/the-pictorial-key-to-the-tarot\//);
      expect(match.source).toContain('Arthur Edward Waite');
      expect(match.summary.length).toBeGreaterThan(60);
    }
  });

  it('keeps a historical imagery note from masquerading as a reversed interpretation',()=>{
    const view=scholarPreview(chosen(['Death','8 of Wands'],['Inside','Outside']));
    expect(view.matches).toHaveLength(2);
    expect(view.matches[0].scope).toBe('card-symbolism');
    expect(view.matches[1].scope).toBe('divinatory-upright-reversed');
    expect(view.matches[0].orientation).toBe('upright');
  });

  it('adds only reviewed material while retaining the exact originally chosen cards',()=>{
    const draws=sample();
    const base=ritualReadingPacket('three-card',draws);
    const withHistory=scholarPacket(base,draws);
    const history=(withHistory.facts as Record<string, unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;position:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(history.reviewedMatches.map(m=>m.name)).toEqual(['The Chariot','5 of Wands']);
    expect(history.unreviewedCards).toEqual(['10 of Swords']);
    expect(history.reviewedMatches[0].position).toBe('Past');
    expect(history.reviewedMatches[1].position).toBe('Present');
    expect(history.reviewedMatches[0].historicalSourceURL).toContain('vii-the-chariot');
    expect(JSON.stringify(withHistory).length).toBeLessThanOrEqual(5800);
    expect(JSON.stringify(base)).not.toContain('scholarMode');
    expect(JSON.stringify(withHistory)).not.toContain('private journal');
  });

  it('handles custom five-card spreads without dropping references or exceeding the consent boundary',()=>{
    const layout=ATLAS_TEMPLATES[0];
    const draws=chosen(
      ['The Chariot','Death','5 of Wands','8 of Wands','9 of Pentacles'],
      layout.slots.map(s=>s.label)
    );
    const base=atlasReadingPacket(layout,draws);
    const scholar=scholarPacket(base,draws);
    expect(JSON.stringify(scholar).length).toBeLessThanOrEqual(5800);
    const field=(scholar.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string}>;
      unreviewedCards:string[];
    };
    expect(field.reviewedMatches.map(m=>m.name)).toEqual(
      ['The Chariot','Death','5 of Wands','8 of Wands']
    );
    expect(field.unreviewedCards).toEqual(['9 of Pentacles']);
  });

  it('stages only confirmed new source notes and keeps unreviewed cards out of citations',()=>{
    const draws=chosen(['The Fool','Ace of Wands','4 of Cups'],['Past','Present','Future']);
    const preview=scholarPreview(draws);
    expect(preview.matches.map(m=>m.cardName)).toEqual(['The Fool','Ace of Wands']);
    expect(preview.unreviewed).toEqual(['4 of Cups']);
    expect(preview.matches[0].scope).toBe('card-symbolism');
    expect(preview.matches[1].scope).toBe('divinatory-upright-reversed');
    expect(preview.matches[0].sectionUrl).toContain('/zero-the-fool');
    expect(preview.matches[1].sectionUrl).toContain('/ace-of-wands');
    const packet=scholarPacket(ritualReadingPacket('three-card',draws),draws);
    expect(JSON.stringify(packet).length).toBeLessThanOrEqual(5800);
    const history=(packet.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string;scope:string}>;
      unreviewedCards:string[];
    };
    expect(history.reviewedMatches).toHaveLength(2);
    expect(history.unreviewedCards).toEqual(['4 of Cups']);
    expect(JSON.stringify(packet)).not.toContain('/four-of-cups');
  });

  it('does not fabricate a source when zero selected cards have historical review',()=>{
    const draws=chosen(['4 of Cups'],['Focus']);
    const base=ritualReadingPacket('single',draws);
    const scholar=scholarPacket(base,draws);
    const field=(scholar.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:unknown[]; unreviewedCards:string[];
    };
    expect(field.reviewedMatches).toEqual([]);
    expect(field.unreviewedCards).toEqual(['4 of Cups']);
    expect(JSON.stringify(scholar)).not.toContain('https://');
  });

  it('includes the newly reviewed Devil and Tower only on explicit Scholar staging',()=>{
    const draws=chosen(['The Devil','The Tower','4 of Cups'],['Past','Present','Future']);
    const preview=scholarPreview(draws);
    expect(preview.matches.map(m=>m.cardName)).toEqual(['The Devil','The Tower']);
    expect(preview.unreviewed).toEqual(['4 of Cups']);
    expect(preview.matches.every(m=>m.scope==='card-symbolism')).toBe(true);
    const ordinary=ritualReadingPacket('three-card',draws);
    expect(JSON.stringify(ordinary)).not.toContain('scholarMode');
    const reviewed=scholarPacket(ordinary,draws);
    const facts=(reviewed.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(facts.reviewedMatches.map(m=>m.name)).toEqual(['The Devil','The Tower']);
    expect(facts.unreviewedCards).toEqual(['4 of Cups']);
    expect(facts.reviewedMatches.map(m=>m.historicalSourceURL)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xv-the-devil',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xvi-the-tower'
    ]);
    expect(JSON.stringify(reviewed).length).toBeLessThanOrEqual(5800);
  });

  it('stages new Wands and Cups source reviews but excludes an unreviewed Minor card',()=>{
    const draws=chosen(['4 of Wands','Ace of Cups','4 of Cups'],['Past','Present','Future']);
    const preview=scholarPreview(draws);
    expect(preview.matches.map(m=>m.cardName)).toEqual(['4 of Wands','Ace of Cups']);
    expect(preview.unreviewed).toEqual(['4 of Cups']);
    expect(preview.matches.every(m=>m.scope==='divinatory-upright-reversed')).toBe(true);
    const base=ritualReadingPacket('three-card',draws);
    expect(JSON.stringify(base)).not.toContain('scholarMode');
    const sourced=scholarPacket(base,draws);
    const history=(sourced.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string;scope:string}>;
      unreviewedCards:string[];
    };
    expect(history.reviewedMatches.map(m=>m.historicalSourceURL)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/four-of-wands',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-cups'
    ]);
    expect(history.reviewedMatches.map(m=>m.scope)).toEqual([
      'divinatory-upright-reversed','divinatory-upright-reversed'
    ]);
    expect(history.unreviewedCards).toEqual(['4 of Cups']);
    expect(JSON.stringify(sourced).length).toBeLessThanOrEqual(5800);
    expect(JSON.stringify(sourced)).not.toContain('/four-of-cups');
  });

  it('stages v1.9 Cups and Pentacles citations, with an unreviewed card still excluded',()=>{
    const draws=chosen(['6 of Cups','5 of Pentacles','4 of Cups'],['Past','Present','Future']);
    const preview=scholarPreview(draws);
    expect(preview.matches.map(m=>m.cardName)).toEqual(['6 of Cups','5 of Pentacles']);
    expect(preview.unreviewed).toEqual(['4 of Cups']);
    expect(preview.matches.map(m=>m.scope)).toEqual([
      'divinatory-upright-reversed','divinatory-upright-reversed'
    ]);
    const base=ritualReadingPacket('three-card',draws);
    expect(JSON.stringify(base)).not.toContain('scholarMode');
    const sourced=scholarPacket(base,draws);
    const history=(sourced.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(history.reviewedMatches.map(m=>m.historicalSourceURL)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/six-of-cups',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-pentacles'
    ]);
    expect(history.unreviewedCards).toEqual(['4 of Cups']);
    expect(JSON.stringify(sourced)).not.toContain('/four-of-cups');
    expect(JSON.stringify(sourced).length).toBeLessThanOrEqual(5800);
  });

  it('fails closed on a fabricated card, duplicate cards, mismatched position, and missing base',()=>{
    const draws=sample();
    const bad=chosen(['The Chariot'],['Focus']);
    bad[0].card={...bad[0].card,name:'Fake Chariot'};
    expect(()=>scholarPreview(bad)).toThrow('actual GAIA deck cards');
    expect(()=>scholarPreview([draws[0],draws[0]])).toThrow('distinct');
    expect(()=>scholarPacket({},draws)).toThrow('source-grounded tarot');
    const base=ritualReadingPacket('three-card',draws);
    expect(()=>scholarPacket(base,[{...draws[0],position:'Elsewhere'},...draws.slice(1)])).toThrow('changed');
  });

  it('only shows scholarly instructions if the user explicitly opts in',()=>{
    const normal=readingInvitation('tarot','direction');
    const opted=readingInvitation('tarot','direction',true);
    expect(normal).not.toContain('Scholar Mode is ON');
    expect(opted).toContain('Scholar Mode is ON');
    expect(opted).toContain('Do not attribute GAIA modern keywords to Waite');
    expect(readingInvitation('astrology','direction',true)).not.toContain('Scholar Mode is ON');
    expect(opted).toContain('direction');
  });
});
