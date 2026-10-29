import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import type { DrawnCard, TarotCard } from '@/types';
import { ritualReadingPacket } from '../site/src/ritualDraw';
import { atlasReadingPacket, ATLAS_TEMPLATES } from '../site/src/spreadAtlas';
import { scholarPacket, scholarPreview } from '../site/src/scholarMode';
import { readingInvitation } from '../site/src/readingExperience';

const cards = deck as TarotCard[];
function chosen(names:string[],positions:string[]): DrawnCard[] {
  return names.map((name,i)=>{
    const card=cards.find(c=>c.name===name);
    if (!card) throw new Error('Missing card '+name);
    return {card,position:positions[i],orientation:i%2===0?'upright':'reversed'};
  });
}
const sample=()=>chosen(['The Chariot','5 of Wands','Page of Wands'],['Past','Present','Future']);

describe('GAIA historical Scholar Mode after the complete v2.1 primary-source review',()=>{
  it('matches all chosen canonical cards now that the Waite 78-card source desk is complete',()=>{
    const view=scholarPreview(sample());
    expect(view.drawnCount).toBe(3);
    expect(view.matches.map(m=>m.cardName)).toEqual(['The Chariot','5 of Wands','Page of Wands']);
    expect(view.unreviewed).toEqual([]);
    for(const match of view.matches){
      expect(match.sectionUrl).toMatch(/^https:\/\/sacred-texts\.com\/book\/the-pictorial-key-to-the-tarot\//);
      expect(match.source).toContain('Arthur Edward Waite');
      expect(match.summary.length).toBeGreaterThan(60);
    }
  });

  it('retains imagery-only scope for Major chapters; no automatic historical reversed claim',()=>{
    const view=scholarPreview(chosen(['Death','8 of Wands'],['Inside','Outside']));
    expect(view.matches.map(m=>m.scope)).toEqual(['card-symbolism','divinatory-upright-reversed']);
    expect(view.matches[0].orientation).toBe('upright');
  });

  it('adds citations only in the separately approved Scholar packet, never in ordinary ritual mode',()=>{
    const draws=sample();
    const base=ritualReadingPacket('three-card',draws);
    expect(JSON.stringify(base)).not.toContain('scholarMode');
    const withHistory=scholarPacket(base,draws);
    const field=(withHistory.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;position:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(field.reviewedMatches.map(m=>m.name)).toEqual(['The Chariot','5 of Wands','Page of Wands']);
    expect(field.reviewedMatches.map(m=>m.position)).toEqual(['Past','Present','Future']);
    expect(field.reviewedMatches.map(m=>m.historicalSourceURL)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/vii-the-chariot',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-wands',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/page-of-wands'
    ]);
    expect(field.unreviewedCards).toEqual([]);
    expect(JSON.stringify(withHistory).length).toBeLessThanOrEqual(5800);
    expect(JSON.stringify(withHistory)).not.toContain('private journal');
    expect(JSON.stringify(base)).not.toContain('scholarMode');
  });

  it('handles five reviewed cards without truncating citations; otherwise rejects over-limit packets',()=>{
    const layout=ATLAS_TEMPLATES[0];
    const draws=chosen(
      ['The Chariot','Death','5 of Wands','8 of Wands','Page of Pentacles'],
      layout.slots.map(s=>s.label)
    );
    const base=atlasReadingPacket(layout,draws);
    let scholar:ReturnType<typeof scholarPacket>;
    try {
      scholar=scholarPacket(base,draws);
    } catch(error) {
      expect((error as Error).message).toMatch(/historical comparison is too large/i);
      return;
    }
    expect(JSON.stringify(scholar).length).toBeLessThanOrEqual(5800);
    const field=(scholar.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(field.reviewedMatches.map(m=>m.name)).toEqual(
      ['The Chariot','Death','5 of Wands','8 of Wands','Page of Pentacles']
    );
    expect(field.unreviewedCards).toEqual([]);
    expect(field.reviewedMatches.every(m=>m.historicalSourceURL.startsWith('https://'))).toBe(true);
  });

  it('stages source-accurate cross-suit courts with original reversed nuances and zero unreviewed cards',()=>{
    const draws=chosen(['Queen of Wands','Queen of Cups','Knight of Swords'],['Past','Present','Future']);
    const preview=scholarPreview(draws);
    expect(preview.matches.map(m=>m.scope)).toEqual([
      'divinatory-upright-reversed','divinatory-upright-reversed','divinatory-upright-reversed'
    ]);
    expect(preview.unreviewed).toEqual([]);
    expect(preview.matches[0].summary).toContain('conditional jealousy');
    expect(preview.matches[1].summary).toContain('reversed lists explicitly vary');
    expect(preview.matches[2].caution).toContain('neighbor-card qualification');
    const base=ritualReadingPacket('three-card',draws);
    expect(JSON.stringify(base)).not.toContain('scholarMode');
    const packet=scholarPacket(base,draws);
    const field=(packet.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{name:string;historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(field.reviewedMatches.map(m=>m.historicalSourceURL)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/queen-of-wands',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/queen-of-cups',
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/knight-of-swords'
    ]);
    expect(field.unreviewedCards).toEqual([]);
    expect(JSON.stringify(packet).length).toBeLessThanOrEqual(5800);
  });

  it('now gives a checked historical citation to an individual Page instead of a fabricated missing-source label',()=>{
    const draws=chosen(['Page of Cups'],['Focus']);
    const preview=scholarPreview(draws);
    expect(preview.unreviewed).toEqual([]);
    expect(preview.matches.map(m=>m.sectionUrl)).toEqual([
      'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/page-of-cups'
    ]);
    const packet=scholarPacket(ritualReadingPacket('single',draws),draws);
    const field=(packet.facts as Record<string,unknown>).scholarMode as {
      reviewedMatches:Array<{historicalSourceURL:string}>;
      unreviewedCards:string[];
    };
    expect(field.reviewedMatches).toHaveLength(1);
    expect(field.unreviewedCards).toEqual([]);
  });

  it('never omits source records silently when an otherwise valid staged packet exceeds its limit',()=>{
    const draws=sample();
    const base=ritualReadingPacket('three-card',draws);
    const facts=(base.facts as Record<string,unknown>);
    const oversized={...base,facts:{...facts,extraResearchText:'X'.repeat(6000)}};
    expect(()=>scholarPacket(oversized,draws)).toThrow('historical comparison is too large');
  });

  it('rejects fabricated cards, repeats, changed positions or orientation, and missing base',()=>{
    const draws=sample();
    const bad=chosen(['The Chariot'],['Focus']);
    bad[0].card={...bad[0].card,name:'Fake Chariot'};
    expect(()=>scholarPreview(bad)).toThrow('actual GAIA deck cards');
    expect(()=>scholarPreview([draws[0],draws[0]])).toThrow('distinct');
    expect(()=>scholarPacket({},draws)).toThrow('source-grounded tarot');
    const base=ritualReadingPacket('three-card',draws);
    expect(()=>scholarPacket(base,[{...draws[0],position:'Elsewhere'},...draws.slice(1)])).toThrow('changed');
    expect(()=>scholarPacket(base,[{...draws[0],orientation:'reversed' as const},...draws.slice(1)])).toThrow('changed');
  });

  it('instructs on historical caution only after explicit Scholar opt-in',()=>{
    const normal=readingInvitation('tarot','direction');
    const opted=readingInvitation('tarot','direction',true);
    expect(normal).not.toContain('Scholar Mode is ON');
    expect(opted).toContain('Scholar Mode is ON');
    expect(opted).toContain('Do not attribute GAIA modern keywords to Waite');
    expect(readingInvitation('astrology','direction',true)).not.toContain('Scholar Mode is ON');
  });
});
