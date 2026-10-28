/**
 * GAIA Hermetic Audit v0.9, distinct from GAIA's modern editorial meanings.
 * Source tradition: Golden Dawn / Book T, published in The Equinox I:8 (1912).
 * Historical agreement is NOT empirical proof of divination.
 */
import type { TarotCard } from '@/types';

export const HERMETIC_AUDIT_REFERENCES = [
  {
    id:'book-t-1912', type:'historical-primary-text',
    title:'A Description of the Cards of the Tarot (Book T), The Equinox I:8 (1912), pp. 143–210',
    url:'https://hermetic.com/crowley/equinox/i/viii/eqi08016',
    scope:'Historical Golden Dawn pip-card decans, planetary rulers, titles and trump letter/astrological attributions. Strength/Justice numbering varies across editions.'
  },
  {
    id:'golden-dawn-tree', type:'comparative-reconstruction',
    title:'Golden Dawn Tree of Life, 22 traditional path endpoints',
    url:'https://lunarcana.app/en/guide/qabalah',
    scope:'Comparative reconstruction of the Golden Dawn 22-path Tree, used to check endpoints; not a newly discovered ancient tarot manuscript.'
  }
] as const;

const signsBySuit = {
  Wands:['Aries','Leo','Sagittarius'],
  Cups:['Cancer','Scorpio','Pisces'],
  Swords:['Libra','Aquarius','Gemini'],
  Pentacles:['Capricorn','Taurus','Virgo']
} as const;
type Suit = keyof typeof signsBySuit;
const zodiac=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const chaldean=['Mars','Sun','Venus','Mercury','Moon','Saturn','Jupiter'];
const decanTitles: Record<Suit, readonly string[]> = {
  Wands:['Dominion','Established Strength','Perfected Work','Strife','Victory','Valour','Swiftness','Great Strength','Oppression'],
  Cups:['Love','Abundance','Blended Pleasure','Loss in Pleasure','Pleasure','Illusionary Success','Abandoned Success','Material Happiness','Perfected Success'],
  Swords:['Peace Restored','Sorrow','Rest from Strife','Defeat','Earned Success','Unstable Effort','Shortened Force','Despair and Cruelty','Ruin'],
  Pentacles:['Harmonious Change','Material Works','Earthly Power','Material Trouble','Material Success','Success Unfulfilled','Prudence','Material Gain','Wealth']
};

/** RWS labels paired to the Golden Dawn letter/endpoint tradition. */
const trumps = [
  ['Aleph','Air','1->2'],['Beth','Mercury','1->3'],['Gimel','Moon','1->6'],
  ['Daleth','Venus','2->3'],['Heh','Aries','2->6'],['Vav','Taurus','2->4'],
  ['Zayin','Gemini','3->6'],['Cheth','Cancer','3->5'],['Teth','Leo','4->5'],
  ['Yod','Virgo','4->6'],['Kaph','Jupiter','4->7'],['Lamed','Libra','5->6'],
  ['Mem','Water','5->8'],['Nun','Scorpio','6->7'],['Samekh','Sagittarius','6->8'],
  ['Ayin','Capricorn','6->9'],['Peh','Mars','7->8'],['Tzaddi','Aquarius','7->9'],
  ['Qoph','Pisces','7->10'],['Resh','Sun','8->9'],['Shin','Fire','8->10'],
  ['Tav','Saturn','9->10']
] as const;

export type AuditedField = {field:string; value:string; evidence:string};
export type HermeticAuditRecord = {
  status:'checked-in-golden-dawn-tradition'|'pending-specialist-review';
  cardId:string;
  fields:AuditedField[];
  pendingFields:string[];
  notes:string[];
  sources:string[];
};

export function goldenDawnDecan(suit: Suit, number: number){
  if (!Number.isInteger(number)||number<2||number>10) throw new Error('Golden Dawn decans belong only to pips 2–10.');
  const group=Math.floor((number-2)/3);
  const decanInSign=(number-2)%3;
  const sign=signsBySuit[suit][group];
  const signPosition=zodiac.indexOf(sign);
  const ruler=chaldean[(signPosition*3+decanInSign)%7];
  const start=decanInSign*10;
  return {decan:sign+' '+start+'-'+(start+9)+'°',planet_ruler:ruler,
    hermetic_title:'Lord of '+decanTitles[suit][number-2]};
}

export function goldenDawnMajor(number:number){
  if (!Number.isInteger(number)||number<0||number>21) throw new Error('Major number 0–21 required.');
  const [hebrew_letter,attribution,path]=trumps[number];
  return {hebrew_letter,attribution,path};
}

export function auditHermeticCard(card: TarotCard): HermeticAuditRecord {
  const fields:AuditedField[]=[];
  const pendingFields:string[]=[];
  const notes:string[]=[];
  const sources:string[]=[];
  const record=(field:string,expected:string,evidence:string,actual:unknown)=>{
    if (actual!==expected) {
      throw new Error('Hermetic audit mismatch: '+card.id+' '+field+' expected '+expected+' got '+String(actual));
    }
    fields.push({field,value:expected,evidence});
  };
  if(card.arcana==='major'){
    const m=goldenDawnMajor(card.number!);
    for(const key of ['hebrew_letter','attribution','path'] as const){
      record(key,m[key],
        key==='path'?'golden-dawn-tree':'book-t-1912',card.hermetic[key]);
    }
    sources.push('book-t-1912','golden-dawn-tree');
    pendingFields.push('magical_title','sephirothic_context');
    notes.push('Historical Golden Dawn path convention; Strength VIII / Justice XI use Rider–Waite–Smith numbering, which is not uniform across early Book T prints.');
  }else if(card.arcana==='minor'&&typeof card.number==='number'&&card.number>=2&&card.number<=10){
    const suit=card.suit as Suit;
    if(!(suit in signsBySuit))throw new Error('Unknown minor suit for audit.');
    const values=goldenDawnDecan(suit,card.number);
    for(const key of ['decan','planet_ruler','hermetic_title'] as const){
      record(key,values[key],'book-t-1912',card.hermetic[key]);
    }
    sources.push('book-t-1912');
    pendingFields.push('Extended astrological interpretation','Any historical reverse-only meaning');
    notes.push('One of Book T’s 36 zodiac decan pips (2–10), not a prediction or physical influence.');
  }else{
    pendingFields.push('Full court/ace attribution and rank mapping');
    notes.push('Aces and court cards do not share the 36-card pip decan table; court titles and sign spans require a separate, edition-aware audit.');
  }
  return {
    status:fields.length?'checked-in-golden-dawn-tradition':'pending-specialist-review',
    cardId:card.id,fields,pendingFields,notes,sources
  };
}
