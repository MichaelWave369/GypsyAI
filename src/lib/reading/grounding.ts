import { Aspect, DrawnCard, PlanetPosition, TarotSpreadType } from '@/types';
import { getPositionMeanings } from '@/lib/tarot/positions';

export interface GroundingPacket {
  modality: 'tarot' | 'astro' | 'genekeys' | 'blend';
  facts: Record<string, unknown>;
  allowedTerms: string[];
  requiredSections: string[];
}

const tarotSections = ['Opening','Spread overview','Card-by-card','Hermetic Layer','Integration','Practical steps','Closing line'];
const astroSections = ['Big Three summary','Element + modality balance','Strongest aspects highlights','House emphasis','Hermetic Keys synthesis','Practical reflection'];
const gkSections = ['Short opening','Activation Sequence overview','Each sphere','Integration theme','Journal prompts'];

function suitElement(card: DrawnCard){
  return String(card.card.hermetic.element || card.card.hermetic.attribution || '');
}

export function buildGroundingPacketTarot(spread: TarotSpreadType, cards: DrawnCard[]): GroundingPacket {
  const positions = getPositionMeanings(spread);
  const dignity = cards.slice(0,-1).map((c,i)=>{
    const a=suitElement(c); const b=suitElement(cards[i+1]);
    const relation = a && b ? (a===b?'support':(a==='Fire'&&b==='Water')||(a==='Water'&&b==='Fire')||(a==='Air'&&b==='Earth')||(a==='Earth'&&b==='Air')?'weaken':'neutral'):'neutral';
    return `${c.card.name}→${cards[i+1].card.name}: ${relation} (may suggest)`;
  });
  return {
    modality:'tarot',
    facts:{spread,cards:cards.map((c)=>({position:c.position,orientation:c.orientation,name:c.card.name,hermetic:c.card.hermetic,keywords:c.orientation==='upright'?c.card.upright_keywords:c.card.reversed_keywords,doNotSay:['literal death prediction','fatalistic certainty']})),positions,dignityNotes:dignity},
    allowedTerms:[...new Set(cards.flatMap((c)=>[c.card.name,...Object.values(c.card.hermetic),...c.card.upright_keywords,...c.card.reversed_keywords]))],
    requiredSections: tarotSections
  };
}

export function buildGroundingPacketAstro(input:{placements:PlanetPosition[];aspects:Aspect[];houses:{house:number;sign:string;cusp:number}[];keys:string[];dignityNotes:string[];aspectTags:string[]}): GroundingPacket {
  return { modality:'astro', facts:input, allowedTerms:[...new Set([...input.placements.map(p=>p.body),...input.placements.map(p=>p.sign),...input.aspectTags,...input.keys])], requiredSections: astroSections };
}

export function buildGroundingPacketGeneKeys(input:{activationSequence:unknown;planetary:unknown;guideMode:string;triads:string[]}): GroundingPacket {
  return { modality:'genekeys', facts:input, allowedTerms:[...input.triads,input.guideMode], requiredSections:gkSections };
}
