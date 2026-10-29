/**
 * GAIA v1.5 Minor Pip Concordance: 40 Ace / 2–10 structural comparisons.
 *
 * Derived deterministically from the canonical local GAIA deck.
 * Each record keeps its original ID, name, upright/reversed editorial data.
 * Documented title/index differences are NOT equivalence of imagery or
 * divinatory interpretation. Marseille labels here are MODERN NORMALIZATIONS,
 * not transcriptions of text printed on particular surviving cards.
 */
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';
import { auditHermeticCard } from './hermeticAudit';

export type MinorSuit='Wands'|'Cups'|'Swords'|'Pentacles';
type MinorReferenceKind='historical-primary-text'|'modern-secondary-index';
export type MinorReference={
  id:string;title:string;authorOrEditor:string;kind:MinorReferenceKind;
  url:string;scope:string;
};

export const MINOR_REFERENCES: readonly MinorReference[]=[
  {
    id:'waite-pictorial-key',
    title:'The Pictorial Key to the Tarot',
    authorOrEditor:'Arthur Edward Waite; illustrations by Pamela Colman Smith',
    kind:'historical-primary-text',
    url:'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot',
    scope:'Rider–Waite–Smith English suit names and the 1909 pictorial 2–10 minor cards. Pictorial descriptions belong to Waite’s tradition, not Marseille.'
  },
  {
    id:'marseille-pip-index',
    title:'How to read the Marseille pips from the drawing',
    authorOrEditor:'Marselia, a modern comparison of Conver/Dodal/Noblet patterns',
    kind:'modern-secondary-index',
    url:'https://marselia.app/blog/reading-marseille-tarot-pips',
    scope:'French suit name and number conventions, non-scenic pip arrangement and the fact that actual printed numerals differ by suit and edition. No claim to have checked each historical engraved plate.'
  },
  {
    id:'golden-dawn-book-t',
    title:'Book T / Liber LXXVIII, The Equinox I:8 (1912)',
    authorOrEditor:'Hermetic Order of the Golden Dawn tradition, historic printed text',
    kind:'historical-primary-text',
    url:'https://hermeticcloud.com/library/liber-lxxviii/',
    scope:'The four elemental Aces and 36 decan-based numbered pips (2–10), with documented Lord titles and planetary rulers; no single decan belongs to an Ace.'
  },
  {
    id:'thoth-title-list',
    title:'Thoth minor cards: original deck labels indexed by suit',
    authorOrEditor:'Bill Heidrick, historical deck title table',
    kind:'modern-secondary-index',
    url:'https://billheidrick.com/works/tarottbl.htm',
    scope:'The 36 displayed Thoth small-card keywords and four Aces, including substantial differences from the older Golden Dawn Lord titles.'
  },
  {
    id:'thoth-comparison',
    title:'Thoth Tarot 78-card index and Marseille comparisons',
    authorOrEditor:'Marselia, modern secondary deck catalog',
    kind:'modern-secondary-index',
    url:'https://marselia.app/tarot-decks/thoth',
    scope:'Thoth Wands/Cups/Swords/Disks labels, numbering and selected planetary associations. Not an original Crowley 1944 book edition or a source of copyrighted Harris artwork.'
  }
] as const;

const SUITS:MinorSuit[]=['Wands','Cups','Swords','Pentacles'];
const suitMap:Record<MinorSuit,{marseille:string;thoth:string;element:string}>={
  Wands:{marseille:'Bâtons',thoth:'Wands',element:'Fire'},
  Cups:{marseille:'Coupes',thoth:'Cups',element:'Water'},
  Swords:{marseille:'Épées',thoth:'Swords',element:'Air'},
  Pentacles:{marseille:'Deniers',thoth:'Disks',element:'Earth'}
};

/** Explicit, sourced THOTH printed keywords. Not auto-derived from Book T titles. */
export const THOTH_PIP_KEYWORDS:Record<MinorSuit,readonly string[]>={
  Wands:['Dominion','Virtue','Completion','Strife','Victory','Valour','Swiftness','Strength','Oppression'],
  Cups:['Love','Abundance','Luxury','Disappointment','Pleasure','Debauch','Indolence','Happiness','Satiety'],
  Swords:['Peace','Sorrow','Truce','Defeat','Science','Futility','Interference','Cruelty','Ruin'],
  Pentacles:['Change','Works','Power','Worry','Success','Failure','Prudence','Gain','Wealth']
};
const cards=deck as TarotCard[];

export type MinorEntry={
  id:string;
  canonical:{name:string;suit:MinorSuit;number:number;isAce:boolean};
  rws:{label:string;visualConvention:string;sourceId:string};
  marseille:{normalizedLabel:string;suitLabel:string;visualConvention:string;sourceId:string;printedLabelCaution:string};
  goldenDawn:{title:string;element:string;sephirah:string;decan:string|null;planetRuler:string|null;sourceId:string;isDecanPip:boolean};
  thoth:{label:string;suitLabel:string;printedKeyword:string|null;sourceId:string};
  provenance:{claimType:'historical-structural-crosswalk'; interpretationReviewed:false; notes:string[]};
};

export function minorConcordanceEntry(id:string):MinorEntry|null{
  const card=cards.find(c=>c.id===id);
  if(!card||card.arcana!=='minor'||card.court!==null||card.number===null
    ||card.number<1||card.number>10||!Number.isInteger(card.number)) return null;
  if(!SUITS.includes(card.suit as MinorSuit)) throw new Error('Unknown numbered minor suit.');
  const suit=card.suit as MinorSuit;
  const rank=card.number;
  const isAce=rank===1;
  const historical=auditHermeticCard(card);
  if(!historical.fields.length) throw new Error('Unverified Golden Dawn record for '+card.id);
  const existing=suitMap[suit];
  const keyword=isAce?null:THOTH_PIP_KEYWORDS[suit][rank-2];
  if(!isAce&&!keyword)throw new Error('Missing documented Thoth pip title.');
  const title=isAce?'Ace of '+existing.thoth:rank+' of '+existing.thoth;
  return {
    id:card.id,
    canonical:{name:card.name,suit,number:rank,isAce},
    rws:{
      label:card.name,sourceId:'waite-pictorial-key',
      visualConvention:isAce?'A richly illustrated single suit emblem.':'An illustrated scene specific to this numbered card, not merely a geometric count of emblems.'
    },
    marseille:{
      normalizedLabel:(isAce?'As':String(rank))+' · '+existing.marseille,
      suitLabel:existing.marseille,sourceId:'marseille-pip-index',
      visualConvention:isAce?'A single large suit emblem.':'Repeated suit emblems, geometrically arranged with floral/decorative motifs; generally not an illustrated people-in-scene narrative.',
      printedLabelCaution:'Modern normalized card identifier; NOT a claim that a particular Marseille engraving prints this exact label or even a numeral.'
    },
    goldenDawn:{
      title:card.hermetic.hermetic_title,
      element:existing.element,
      sephirah:card.hermetic.sephirah,
      decan:isAce?null:card.hermetic.decan,
      planetRuler:isAce?null:card.hermetic.planet_ruler,
      isDecanPip:!isAce,sourceId:'golden-dawn-book-t'
    },
    thoth:{
      label:keyword?title+' · '+keyword:title,
      suitLabel:existing.thoth,printedKeyword:keyword,sourceId:'thoth-title-list'
    },
    provenance:{
      claimType:'historical-structural-crosswalk',
      interpretationReviewed:false,
      notes:[
        'GAIA retains its original card identity. These four names/systems are compared for research, not redrawn or merged.',
        'This is a label, suit, rank and published correspondence crosswalk. It is NOT an audit of card-by-card readings or all surviving Marseille plates.',
        isAce?'An Ace is an elemental root, not one of the 36 ten-degree Golden Dawn decans.':'Golden Dawn’s planetary decan and Thoth’s printed keyword are distinct historical claims. A shared suit or number does not imply the same imagery.'
      ]
    }
  };
}
export function listMinorConcordanceEntries():MinorEntry[]{
  return SUITS.flatMap(suit=>Array.from({length:10},(_,i)=>{
    const rank=i+1;
    const id=suit.toLowerCase()+'-'+(rank===1?'ace':rank);
    const value=minorConcordanceEntry(id);
    if(!value)throw new Error('Missing GAIA source card '+id);
    return value;
  }));
}
export function minorConcordanceCoverage(){
  const entries=listMinorConcordanceEntries();
  return {minorCards:56,structuralComparisons:entries.length,
    aces:entries.filter(e=>e.canonical.isAce).length,
    decanPips:entries.filter(e=>!e.canonical.isAce).length,
    courtCardsComparedInSeparateChamber:16,
    interpretiveReviewsConferred:0,
    structurallyIndexedAcrossMajorCourtAndPip:22+16+entries.length};
}
export function minorReference(id:string):MinorReference{
  const reference=MINOR_REFERENCES.find(r=>r.id===id);
  if(!reference)throw new Error('Unrecognized structural evidence source '+id);
  return reference;
}
