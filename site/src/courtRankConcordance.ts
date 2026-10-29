/**
 * GAIA v1.4 | Court Rank Concordance
 *
 * This is a historically labeled CROSSWALK, not a claim that different
 * decks share exact imagery, divinatory meanings, or card identities.
 * The two King/Knight alignments are deliberately selectable.
 *
 * Printed-role alignment follows the 1912 Book T Knight / King labels;
 * rank-hierarchy alignment is an interpretive comparison of the top
 * Rider–Waite–Smith King with the mounted fire/Yod rank instead.
 */
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';
import { expectedBookTAceCourt } from './bookTCourtCatalog';

export type CourtSuit='Wands'|'Cups'|'Swords'|'Pentacles';
export type CourtRank='Page'|'Knight'|'Queen'|'King';
export type CourtAlignment='printed-role'|'rank-hierarchy';
export type CourtReference={
  id:string;label:string;author:string;kind:'historical-primary-text'|'modern-secondary-comparison';
  url:string;scope:string;
};
export const COURT_REFERENCES: readonly CourtReference[]=[
  {
    id:'book-t',
    label:'Book T / Liber LXXVIII, The Equinox I:8 (1912), court sections',
    author:'Golden Dawn traditional material, printed by Aleister Crowley',
    kind:'historical-primary-text',
    url:'https://hermeticcloud.com/library/liber-lxxviii/',
    scope:'Printed Knight/King/Queen/Knave court names, mounted ruler, charioted Prince, elemental grades and historic titles. Does not decide all Rider–Waite–Smith equivalences.'
  },
  {
    id:'waite-key',
    label:'The Pictorial Key to the Tarot',
    author:'Arthur Edward Waite',
    kind:'historical-primary-text',
    url:'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot',
    scope:'Rider–Waite–Smith court labels Page, Knight, Queen, King. Waite’s titles do not by themselves settle esoteric role comparisons.'
  },
  {
    id:'crowley-thoth',
    label:'The Book of Thoth, Court Cards',
    author:'Aleister Crowley',
    kind:'historical-primary-text',
    url:'https://hermetic.com/crowley/book-of-thoth/court-cards',
    scope:'Thoth’s Knight, Queen, Prince, Princess roles, horse/chariot distinction and elemental grades. This is historic source text, not bundled Thoth artwork.'
  },
  {
    id:'marseille-courts',
    label:'Marseille court labels and Latin suit names',
    author:'LearnTarot, historical-pattern comparison',
    kind:'modern-secondary-comparison',
    url:'https://www.learntarot.com/mxdesc.htm',
    scope:'Roy, Reyne, Cavalier, Valet with Bâtons, Coupes, Épées, Deniers. Translated titles are a descriptive crosswalk, not a claim that Marseille had Golden Dawn elemental grades.'
  },
  {
    id:'rank-comparison',
    label:'Court ranks: elemental-grade and name-alignment dispute',
    author:'The Final Star, modern comparative analysis',
    kind:'modern-secondary-comparison',
    url:'https://thefinalstar.com/library/courts/',
    scope:'Explains why a source-literal Book T/horse alignment and a top-rank hierarchy alignment give different pairs for King and Knight.'
  }
] as const;

const cards=deck as TarotCard[];
const SUITS:CourtSuit[]=['Wands','Cups','Swords','Pentacles'];
const RANKS:CourtRank[]=['Page','Knight','Queen','King'];
const marseilleSuit:Record<CourtSuit,string>={Wands:'Bâtons',Cups:'Coupes',Swords:'Épées',Pentacles:'Deniers'};
const marseilleRank:Record<CourtRank,string>={Page:'Valet',Knight:'Cavalier',Queen:'Reyne',King:'Roy'};
const thothSuit:Record<CourtSuit,string>={Wands:'Wands',Cups:'Cups',Swords:'Swords',Pentacles:'Disks'};
const SOURCE_IDS=COURT_REFERENCES.map(x=>x.id);
const source= (id:string) => {
  const match=COURT_REFERENCES.find(x=>x.id===id);
  if(!match)throw new Error('Missing curated court source '+id);
  return match;
};

export type CourtRankRecord={
  canonical:{id:string;name:string;suit:CourtSuit;rank:CourtRank};
  marseille:{name:string;nameSource:string;note:string};
  goldenDawn:{printedName:string;role:string;elementalGrade:string;bookTTitle:string;sourceId:string};
  thoth:{name:string;rank:string;sourceId:string};
  alignment:CourtAlignment;
  provenance:{sourceIds:string[];isDebated:boolean;warning:string};
};
function isSuit(v:unknown):v is CourtSuit{return SUITS.includes(v as CourtSuit);}
function isRank(v:unknown):v is CourtRank{return RANKS.includes(v as CourtRank);}
function pairedRank(rank:CourtRank,alignment:CourtAlignment):CourtRank{
  if(alignment==='printed-role')return rank;
  return rank==='King'?'Knight':rank==='Knight'?'King':rank;
}

export function courtRankRecord(cardId:string,alignment:CourtAlignment):CourtRankRecord|null{
  if(alignment!=='printed-role'&&alignment!=='rank-hierarchy')throw new Error('Unknown court alignment.');
  const selected=cards.find(c=>c.id===cardId);
  if(!selected||selected.arcana!=='minor'||!selected.court)return null;
  if(!isSuit(selected.suit)||!isRank(selected.court))throw new Error('Unrecognized court record.');
  const suit=selected.suit,rank=selected.court;
  const sourceCard=cards.find(c=>c.suit===suit&&c.court===pairedRank(rank,alignment));
  if(!sourceCard)throw new Error('Golden Dawn source court is missing.');
  const checked=expectedBookTAceCourt(sourceCard);
  if(Object.entries(checked).some(([key,value])=>sourceCard.hermetic[key]!==value))
    throw new Error('Book T source court failed its earlier audit.');
  const labelByPrintedRole:Record<CourtRank,string>={
    Page:'Princess',Knight:'Knight',Queen:'Queen',King:'Prince'
  };
  const thoth=labelByPrintedRole[sourceCard.court as CourtRank];
  const name=marseilleRank[rank]+' de '+marseilleSuit[suit];
  return {
    canonical:{id:selected.id,name:selected.name,suit,rank},
    marseille:{
      name,nameSource:'marseille-courts',
      note:'Marseille court names follow the familiar printed-rank translation; no Golden Dawn elemental grade is attributed to the historical Marseille card.'
    },
    goldenDawn:{
      printedName:(sourceCard.court==='Page'?'Knave':sourceCard.court)+' of '+suit,
      role:checked.book_t_role,
      elementalGrade:checked.book_t_elemental_grade||'not documented',
      bookTTitle:checked.hermetic_title,
      sourceId:'book-t'
    },
    thoth:{name:thoth+' of '+thothSuit[suit],rank:thoth,sourceId:'crowley-thoth'},
    alignment,
    provenance:{
      sourceIds:SOURCE_IDS.filter(id=>id==='waite-key'||id==='marseille-courts'||id==='book-t'||id==='crowley-thoth'||id==='rank-comparison'),
      isDebated:rank==='King'||rank==='Knight',
      warning:alignment==='printed-role'
        ? 'Printed-role alignment: use the 1912 Book T headings and the vehicle/elemental role. GAIA Knight aligns to Thoth Knight; GAIA King to Thoth Prince. This is not a verified claim of picture-for-picture equivalence.'
        : 'Rank-hierarchy alignment: compare the top Waite–Smith King to Thoth mounted Knight, and Waite–Smith Knight to Thoth charioted Prince. This is a common modern interpretive crosswalk, NOT a literal 1912 Book T label match.'
    }
  };
}
export function listCourtRankRecords(alignment:CourtAlignment):CourtRankRecord[]{
  return SUITS.flatMap(suit=>RANKS.map(rank=>{
    const c=cards.find(card=>card.suit===suit&&card.court===rank);
    if(!c)throw new Error('Missing one of the 16 local court records.');
    const record=courtRankRecord(c.id,alignment);
    if(!record)throw new Error('Missing court source for '+c.id);
    return record;
  }));
}
export function courtRankCoverage(){
  return {courtCards:16,suits:4,rankAlignmentModes:2,majorTrumps:22,
    unindexedMinorPipsAndAces:40,interpretiveEquivalenceEstablished:false};
}
export function courtRankReference(id:string):CourtReference{return source(id);}
