/**
 * GAIA Cross-Tradition Concordance v1.3
 *
 * A source-indexed catalog of all 22 Major Arcana label/number correspondences,
 * not a verified equivalence of interpretation or a synthesis of all tarot.
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
  engravedCartouche?:string;
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
    id:'bnf-conver-catalog',
    title:'BnF catalog: Tarot de Marseille, dit Tarot Conver',
    author:'Bibliothèque nationale de France',
    year:'Surviving Conver pattern c.1809–1833; model engraved 1760',
    type:'institutional-exhibit',
    url:'https://catalogue.bnf.fr/ark:/12148/cb43706229t',
    scope:'Bibliographic catalog for historical Conver-pattern copies. Distinguishes the 1760 engraved model date from the early-nineteenth-century surviving exemplar; does not by itself verify individual interpretive meanings.'
  },
  {
    id:'marseille-pattern',
    title:'Major Arcana titles in the Nicolas Conver Marseille pattern',
    author:'Marselia historical deck comparison; derived from BnF preserved Conver deck',
    year:'1760 engraved model; surviving BnF copy c.1809–1833',
    type:'secondary-reference',
    url:'https://marselia.app/blog/major-arcana-marseille-tarot',
    scope:'Modern secondary transcription of Conver-pattern cartouches and additive numerals from the BnF copy. This is not a direct independent card-image audit or evidence for divinatory meanings.'
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
    scope:'Thoth trump titles and numbering, including VIII Adjustment, XI Lust, the Magus, Art, Aeon and Universe; Crowley also changed Emperor/Star Hebrew-letter associations. No reproduction of Frieda Harris artwork.'
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
    id:'major-1',
    marseille:['Le Bateleur','I','The Conver plate calls this trump Le Bateleur, a performer rather than Waite’s Magician title.'],
    thoth:['The Magus','I','Crowley and Harris title this trump The Magus.'],
    differences:['renaming'],
    boundary:'Historical card titles reflect different traditions. They are not guarantees of identical pictorial details or divinatory readings.'
  },
  {
    id:'major-2',
    marseille:['La Papesse','II','The Conver-pattern title is La Papesse, the female Pope, not Waite’s High Priestess.'],
    thoth:['The Priestess','II','Thoth shortens the Priestess title.'],
    differences:['renaming'],
    boundary:'La Papesse and High Priestess are distinct historical descriptions, not license to invent a single universal reading.'
  },
  {
    id:'major-3',
    marseille:["L’Impératrice",'III','Conver uses the Empress title; its engraved spelling differs from modern French.'],
    thoth:['The Empress','III','Thoth retains the familiar Empress title.'],
    differences:['unchanged-label'],
    boundary:'Similar titles and numbers do not establish identical art, symbolism or historical interpretation.'
  },
  {
    id:'major-4',
    marseille:["L’Empereur",'IIII','Conver uses the additive IIII numeral; Waite and Thoth use IV.'],
    thoth:['The Emperor','IV','Thoth retains Aries but Crowley assigns Tzaddi where the Golden Dawn uses Heh.'],
    differences:['numbering'],
    boundary:'The Golden Dawn column shows Heh on the Emperor. Crowley’s Thoth changes Emperor to Tzaddi. These attributions must not be conflated.'
  },
  {
    id:'major-5',
    marseille:['Le Pape','V','Conver uses Le Pape, the Pope; Waite adopts the title Hierophant.'],
    thoth:['The Hierophant','V','Thoth keeps the Hierophant title.'],
    differences:['renaming'],
    boundary:'Changing from Pope to Hierophant reflects distinct editorial and esoteric framing, not evidence that one tradition supersedes another.'
  },
  {
    id:'major-6',
    marseille:["L’Amoureux",'VI','The Marseille title is traditionally singular: The Lover. Waite uses The Lovers.'],
    thoth:['The Lovers','VI','Thoth retains the plural Lovers title.'],
    differences:['renaming'],
    boundary:'A singular title and a plural title need not imply identical imagery or the same advice for a person.'
  },
  {
    id:'major-9',
    marseille:["L’Hermite",'VIIII','Conver prints additive VIIII, rather than modern IX; the Hermit remains recognizable.'],
    thoth:['The Hermit','IX','Thoth retains the Hermit title.'],
    differences:['numbering'],
    boundary:'Printed numeral conventions are historical typography, not indicators of stronger or weaker divinatory powers.'
  },
  {
    id:'major-10',
    marseille:['La Roue de Fortune','X','The Conver title is the Wheel of Fortune in French.'],
    thoth:['Fortune','X','Thoth shortens Wheel of Fortune to Fortune.'],
    differences:['renaming'],
    boundary:'Name changes alone cannot prove that the associated interpretations are equivalent.'
  },
  {
    id:'major-12',
    marseille:['Le Pendu','XII','The Hanged Man appears as Le Pendu in the Marseille pattern.'],
    thoth:['The Hanged Man','XII','Thoth keeps the standard Hanged Man title.'],
    differences:['unchanged-label'],
    boundary:'A similar figure or translation in multiple decks does not establish the same teaching or prediction.'
  },
  {
    id:'major-15',
    marseille:['Le Diable','XV','The Conver card carries the French Devil title.'],
    thoth:['The Devil','XV','Thoth retains the Devil title.'],
    differences:['unchanged-label'],
    boundary:'A historically recognizable title does not prove literal supernatural beings or a shared theological position.'
  },
  {
    id:'major-16',
    marseille:['La Maison Dieu','XVI','Conver prints House of God, whereas Waite uses The Tower.'],
    thoth:['The Tower','XVI','Thoth retains The Tower title.'],
    differences:['renaming'],
    boundary:'House of God and Tower describe related historical trump placements but are not evidence of identical artwork or meaning.'
  },
  {
    id:'major-17',
    marseille:["L’Étoile",'XVII','The Star keeps its traditional seventeenth place.'],
    thoth:['The Star','XVII','Thoth retains the name and Aquarius but Crowley gives it Heh where Golden Dawn uses Tzaddi.'],
    differences:['unchanged-label'],
    boundary:'Golden Dawn assigns Tzaddi to the Star; Crowley’s Thoth assigns Heh. A matching card title conceals this genuine attribution difference.'
  },
  {
    id:'major-18',
    marseille:['La Lune','XVIII','Conver uses La Lune, the Moon.'],
    thoth:['The Moon','XVIII','Thoth retains the Moon title and number.'],
    differences:['unchanged-label'],
    boundary:'Matching titles and card numbers do not validate astrology, divination or a common reading methodology.'
  },
  {
    id:'major-19',
    marseille:['Le Soleil','XVIIII','Conver prints additive XVIIII instead of the modern XIX.'],
    thoth:['The Sun','XIX','Thoth retains the Sun title.'],
    differences:['numbering'],
    boundary:'Marseille’s additive numeral is a historical engraving convention, not a different astronomical phenomenon.'
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

/** Normalized transcription of the Conver-pattern cartouche from a secondary
 * index cross-referenced to the BnF catalog, NOT an original plate scan audit. */
const converCartouches:Record<string,string> = {
  'major-0':"LE MAT",
  'major-1':"LE·BATELEUR",
  'major-2':"LA·PAPESSE",
  'major-3':"LIMPERATRICE",
  'major-4':"LEMPEREUR",
  'major-5':"LE PAPE",
  'major-6':"LAMOVREVX",
  'major-7':"LE CHARIOT",
  'major-8':"LA·FORCE",
  'major-9':"L'HERMITE",
  'major-10':"LA·ROVE·DE·FORTVNE",
  'major-11':"LA JUSTICE",
  'major-12':"LE·PENDU",
  'major-13':"(no cartouche)",
  'major-14':"TEMPERANCE",
  'major-15':"LE·DIABLE",
  'major-16':"LA·MAISON·DIEV",
  'major-17':"LETOILLE",
  'major-18':"LA·LVNE",
  'major-19':"LE SOLEIL",
  'major-20':"LE·IUGEMENT",
  'major-21':"LE MONDE"
};

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
      marseille:{...face(c.marseille[0],c.marseille[1],'marseille-pattern',c.marseille[2]),
        engravedCartouche:converCartouches[c.id]},
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
