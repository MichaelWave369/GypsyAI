/**
 * GAIA Cross-Tradition Concordance v1.2
 *
 * A deliberately LIMITED first corpus of eight historically identifiable
 * trump correspondences, not a universal synthesis of "the tarot."
 * These fields document labels and ordinal position, not card meanings,
 * divination efficacy or equivalence of physical deck artwork.
 *
 * All citations are curated literal URLs; no network requests or images.
 */
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';
import { getHermeticAuditForCard } from './hermeticAudit';

export type ConcordanceTradition = 'rws'|'marseille'|'golden-dawn'|'thoth';
export type ConcordanceSource = {
  id:string;title:string;author:string;year:string;
  type:'historical-primary-text'|'institutional-exhibit'|'academic-study'|'secondary-reference';
  url:string;scope:string;
};
export type ConcordanceFace = {
  label:string;
  ordinal:string;
  sourceId:string;
  note:string;
};
export type ConcordanceEntry = {
  cardId:string;
  canonicalName:string;
  rws:ConcordanceFace;
  marseille:ConcordanceFace;
  thoth:ConcordanceFace;
  goldenDawn:{hebrewLetter:string;attribution:string;path:string;sourceId:string;note:string};
  differences:('numbering'|'renaming'|'untitled-card'|'unchanged-label')[];
  interpretationBoundary:string;
};

export const CONCORDANCE_SOURCES:readonly ConcordanceSource[] = [
  {
    id:'rws-waite',
    title:'The Pictorial Key to the Tarot',
    author:'Arthur Edward Waite; illustrations by Pamela Colman Smith',
    year:'1911',
    type:'historical-primary-text',
    url:'https://original.sacred-texts.com/tarot/pkt/index.htm',
    scope:'Rider–Waite–Smith major-trump sequence and Waite’s authored descriptions; not the source for older Marseille card titles.'
  },
  {
    id:'marseille-mit',
    title:'French Playing Cards: The Tarot Deck',
    author:'Massachusetts Institute of Technology',
    year:'Historical collection, modern exhibit',
    type:'institutional-exhibit',
    url:'https://frenchplayingcards.mit.edu/tarot/tarot-deck',
    scope:'Institutional history of the tarot pack, conventional 78-card structure and Marseille-era court/iconography examples.'
  },
  {
    id:'marseille-pattern',
    title:'Major Arcana titles in the Nicolas Conver Marseille pattern',
    author:'Marselia historical deck comparison; derived from BnF preserved Conver deck',
    year:'1760 deck, modern catalog commentary',
    type:'secondary-reference',
    url:'https://marselia.app/blog/major-arcana-marseille-tarot',
    scope:'Conver card names, VIII Justice / XI La Force numbering, unnumbered Fool and untitled XIII; text reflects historical printed cartouches.'
  },
  {
    id:'gd-book-t',
    title:'Book T / Liber LXXVIII, The Equinox I:8',
    author:'Hermetic Order of the Golden Dawn tradition; printed in 1912',
    year:'1912',
    type:'historical-primary-text',
    url:'https://hermeticcloud.com/library/liber-lxxviii/',
    scope:'Golden Dawn Hebrew-letter and astrological trump attributions. GAIA uses Rider–Waite–Smith names as its lookup IDs, not as evidence every printed Golden Dawn numbering is identical.'
  },
  {
    id:'thoth-names',
    title:'Thoth Tarot: historical deck and nomenclature',
    author:'Divinity Atlas; secondary historical and deck catalog',
    year:'Deck painted 1938–1943, first issued 1969',
    type:'secondary-reference',
    url:'https://www.divinityatlas.com/tarot-decks/thoth',
    scope:'Thoth trump titles, VIII Adjustment, XI Lust, Art, Aeon and Universe; no reproduction of Frieda Harris artwork.'
  },
  {
    id:'thoth-scholarship',
    title:'The Lady and the Beast, chapter 9: The Book of Thoth',
    author:'Deja Whitehouse, Oxford University Press',
    year:'2024',
    type:'academic-study',
    url:'https://academic.oup.com/book/58979/chapter-abstract/494473299',
    scope:'Academic history of Aleister Crowley and Lady Frieda Harris, publication of the 1944 book and art/correspondence development; not card-by-card interpretation evidence.'
  }
] as const;

const cards=deck as TarotCard[];
type Case = {
  id:string;
  marseille:[label:string,ordinal:string,note:string];
  thoth:[label:string,ordinal:string,note:string];
  differences:ConcordanceEntry['differences'];
  boundary:string;
};
const corpus:readonly Case[] = [
  {
    id:'major-0',
    marseille:['Le Mat','unnumbered','The traditional Marseille Fool is unnumbered; GAIA / Waite uses 0.'],
    thoth:['The Fool','0','Crowley and Harris retain the Fool’s zero position.'],
    differences:['numbering','renaming'],
    boundary:'The unnumbered Marseille Fool is not a claim that it has a different physical or psychological influence.'
  },
  {
    id:'major-7',
    marseille:['Le Chariot','VII','The Chariot remains seventh in this Marseille pattern.'],
    thoth:['The Chariot','VII','The title and trump ordinal remain recognizable.'],
    differences:['unchanged-label'],
    boundary:'Matching names and numbers do not establish identical imagery, meanings or hidden historical causation.'
  },
  {
    id:'major-8',
    marseille:['La Force','XI','In the older Marseille convention Strength is XI, while Waite makes it VIII.'],
    thoth:['Lust','XI','Thoth renames Strength to Lust and returns it to XI.'],
    differences:['numbering','renaming'],
    boundary:'The RWS VIII position and Marseille/Thoth XI position are different deck conventions, not different cards drawn by GAIA.'
  },
  {
    id:'major-11',
    marseille:['La Justice','VIII','Marseille places Justice at VIII, rather than Waite’s XI.'],
    thoth:['Adjustment','VIII','Thoth renames Justice Adjustment and assigns it VIII.'],
    differences:['numbering','renaming'],
    boundary:'Golden Dawn Libra and Lamed attributions are historical classifications, not measurements of fairness.'
  },
  {
    id:'major-13',
    marseille:['XIII · untitled','XIII','The Marseille thirteenth trump typically prints its number without a Death title.'],
    thoth:['Death','XIII','Thoth keeps the Death title and number.'],
    differences:['untitled-card'],
    boundary:'The absence of a Marseille cartouche is a printing/design practice, not a literal death omen.'
  },
  {
    id:'major-14',
    marseille:['Tempérance','XIIII','Marseille uses its historic cartouche and additive numeral spelling.'],
    thoth:['Art','XIV','Thoth renames Temperance Art.'],
    differences:['renaming'],
    boundary:'The name Art should not be confused with modern tarot art-generation features or a proof of alchemical transformation.'
  },
  {
    id:'major-20',
    marseille:['Le Jugement','XX','The traditional Marseille name is Le Jugement.'],
    thoth:['The Aeon','XX','Thoth renames Judgement to The Aeon.'],
    differences:['renaming'],
    boundary:'The Thoth title represents Crowley’s system; it is not a documented ancient original for all tarot decks.'
  },
  {
    id:'major-21',
    marseille:['Le Monde','XXI','Marseille uses the historic Le Monde cartouche.'],
    thoth:['The Universe','XXI','Thoth uses Universe rather than World.'],
    differences:['renaming'],
    boundary:'Similar numbering is an editorial correspondence, not a guarantee that the traditions interpret this trump identically.'
  }
] as const;

function numeral(number:number):string{
  const values=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
  return values[number]||'?';
}

function face(label:string,ordinal:string,sourceId:string,note:string):ConcordanceFace{
  return {label,ordinal,sourceId,note};
}

export function concordanceEntries():ConcordanceEntry[]{
  return corpus.map(c=>{
    const card=cards.find(x=>x.id===c.id);
    if(!card||card.arcana!=='major'||card.number===null)throw new Error('Missing documented Major Arcana card '+c.id);
    const audit=getHermeticAuditForCard(card.id);
    if(!audit||audit.status!=='checked-in-golden-dawn-tradition')throw new Error('Unaudited Golden Dawn attribution '+card.id);
    const letter=card.hermetic.hebrew_letter||'';
    const attribution=card.hermetic.attribution||'';
    const path=card.hermetic.path||'';
    if(!letter||!attribution||!path)throw new Error('Incomplete historical attribution');
    return {
      cardId:card.id,canonicalName:card.name,
      rws:face(card.name,numeral(card.number),'rws-waite','GAIA’s familiar Rider–Waite–Smith-oriented deck identity.'),
      marseille:face(c.marseille[0],c.marseille[1],'marseille-pattern',c.marseille[2]),
      thoth:face(c.thoth[0],c.thoth[1],'thoth-names',c.thoth[2]),
      goldenDawn:{hebrewLetter:letter,attribution,path,sourceId:'gd-book-t',
        note:'Audited Golden Dawn letter / attribution / Tree path; not an additional physical card draw.'},
      differences:[...c.differences],interpretationBoundary:c.boundary
    };
  });
}

export function concordanceEntry(cardId:string):ConcordanceEntry|null{
  return concordanceEntries().find(entry=>entry.cardId===cardId)||null;
}

export function findConcordanceSource(id:string):ConcordanceSource {
  const source=CONCORDANCE_SOURCES.find(s=>s.id===id);
  if(!source)throw new Error('Unknown research source '+id);
  return source;
}

export function concordanceCoverage(){
  return {
    originalDeckCards:cards.length,
    majorTrumps:cards.filter(c=>c.arcana==='major').length,
    comparisons:corpus.length,
    pending:cards.filter(c=>c.arcana==='major').length-corpus.length,
    traditions:4,
    interpretationReviewsNotImplied:true
  };
}
