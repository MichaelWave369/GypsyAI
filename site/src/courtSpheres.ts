/**
 * GAIA Court Spheres Atlas v1.1
 *
 * Reconstructs the explicitly stated zodiac spans of twelve mounted/Queen/
 * charioted Golden Dawn court roles in the 1912 printed Book T.
 * Princess/Page cards have four polar celestial quarters; they do not
 * have a single zodiac span. None of this is a birth-chart prediction.
 *
 * We do NOT silently equate historical roles or artwork from other decks.
 */
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';

export const COURT_SPHERES_SOURCE = {
  title:'Book T, The Equinox I:8 (1912), The Spheres of Influence of the Court Cards',
  url:'https://hermeticcloud.com/library/liber-lxxviii/',
  kind:'historical-primary-text',
  scope:'Historical Golden Dawn allocations, not empirical celestial influences, psychological classifications or a modern deck identity guarantee.'
} as const;

type Suit = 'Wands'|'Cups'|'Swords'|'Pentacles';
type Role = 'Knight'|'Queen'|'King'|'Page';
type Sign = 'Aries'|'Taurus'|'Gemini'|'Cancer'|'Leo'|'Virgo'|'Libra'|'Scorpio'|'Sagittarius'|'Capricorn'|'Aquarius'|'Pisces';
const zodiac:Sign[] = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const cards=deck as TarotCard[];

export type PipReference = {id:string;name:string;sign:Sign;startDegree:0|10|20;endDegree:10|20|30};
export type CourtSphere = {
  cardId:string;cardName:string;suit:Suit;court:Role;
  historicalBookTRole:string;
  type:'zodiac-span'|'polar-quadrant';
  from?:{sign:Sign;degree:20};
  to?:{sign:Sign;degree:20};
  pipReferences:PipReference[];
  sourceUrl:string;
  sourceSection:string;
  caveat:string;
};

// Each 30-degree Book T court span crosses from 20° in one sign to 20°
// in its zodiac successor, but does not literally assign a single decan.
const spans: Record<Suit,Record<Exclude<Role,'Page'>,Sign>> = {
  Wands:{Knight:'Scorpio',Queen:'Pisces',King:'Cancer'},
  Cups:{Knight:'Aquarius',Queen:'Gemini',King:'Libra'},
  Swords:{Knight:'Taurus',Queen:'Virgo',King:'Capricorn'},
  Pentacles:{Knight:'Leo',Queen:'Sagittarius',King:'Aries'}
};

export function nextZodiacSign(sign:Sign):Sign{
  const index=zodiac.indexOf(sign);
  if(index<0)throw new Error('Unrecognized zodiac sign');
  return zodiac[(index+1)%zodiac.length];
}

function lookupPip(sign:Sign,degree:0|10|20):PipReference{
  const target=sign+' '+degree+'-'+(degree+9)+'°';
  const matches=cards.filter(c=>c.arcana==='minor'&&c.number!==null&&c.number>=2&&c.number<=10&&
    c.hermetic.decan===target);
  if(matches.length!==1)throw new Error('Book T span is missing exactly one source pip: '+target);
  const found=matches[0];
  return {id:found.id,name:found.name,sign,startDegree:degree,endDegree:(degree+10) as 10|20|30};
}

export function getCourtSphere(cardId:string):CourtSphere|null {
  const card=cards.find(c=>c.id===cardId);
  if(!card||card.arcana!=='minor'||!card.court)return null;
  const suit=card.suit as Suit;
  const court=card.court as Role;
  if(!(suit in spans)||!['Page','Knight','Queen','King'].includes(court)) {
    throw new Error('Unknown historical court classification');
  }
  const historicalBookTRole=card.hermetic.book_t_role || 'Book T role not indexed';
  const base={
    cardId:card.id,cardName:card.name,suit,court,historicalBookTRole,
    sourceUrl:COURT_SPHERES_SOURCE.url,
    sourceSection:card.hermetic.hermetic_title || 'Court section',
    caveat:'A published Golden Dawn symbolic mapping. The familiar GAIA court name is retained. This is not a measured astrological effect or individual prediction.'
  };
  if(court==='Page')return {
    ...base,type:'polar-quadrant',
    pipReferences:[],
    caveat:'Book T assigns the Princess/Knave to a celestial polar quadrant and the throne of an Ace, not a continuous 30-degree zodiac band. Exact boundaries were not specified in the reviewed passage.'
  };
  const from=spans[suit][court];
  const to=nextZodiacSign(from);
  return {
    ...base,type:'zodiac-span',
    from:{sign:from,degree:20},
    to:{sign:to,degree:20},
    pipReferences:[lookupPip(from,20),lookupPip(to,0),lookupPip(to,10)]
  };
}

export function listCourtSpheres():CourtSphere[]{
  return cards.filter(c=>c.arcana==='minor'&&c.court!==null).map(c=>{
    const result=getCourtSphere(c.id);
    if(!result)throw new Error('A source court record was not found.');
    return result;
  });
}

export function courtSphereCoverage(){
  const all=listCourtSpheres();
  return {
    total:all.length,
    zodiacSpans:all.filter(x=>x.type==='zodiac-span').length,
    polarQuadrants:all.filter(x=>x.type==='polar-quadrant').length,
    distinctSpanPips:new Set(all.flatMap(x=>x.pipReferences.map(p=>p.id))).size,
    warning:'12 Book T 30-degree court spans and 4 non-zodiac Princess quadrants; not personal predictions or artwork equivalence.'
  };
}
