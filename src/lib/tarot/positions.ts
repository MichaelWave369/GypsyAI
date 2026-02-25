import { TarotSpreadType } from '@/types';

export interface PositionMeaning { position: string; meaning: string; hermeticFrame: string }

const defs: Record<TarotSpreadType, PositionMeaning[]> = {
  single: [{ position: 'Focus', meaning: 'Core signal for now.', hermeticFrame: 'A single gate on the Tree asking for conscious attention.' }],
  'three-card': [
    { position: 'Past', meaning: 'Context still echoing.', hermeticFrame: 'What prior current feeds the present vessel.' },
    { position: 'Present', meaning: 'Active pattern now.', hermeticFrame: 'The path currently illuminated.' },
    { position: 'Future', meaning: 'Near trajectory if unchanged.', hermeticFrame: 'Potential unfolding, not fixed destiny.' }
  ],
  'celtic-cross': ['Present','Challenge','Root','Past','Goal','Near Future','Self','Environment','Hopes/Fears','Outcome'].map((p)=>({position:p,meaning:`Role of ${p.toLowerCase()} in the spread dynamic.`,hermeticFrame:'A station in a ritual map of tension and integration.'})),
  'tree-of-life': ['Kether','Chokmah','Binah','Chesed','Geburah','Tiphareth','Netzach','Hod','Yesod','Malkuth'].map((p)=>({position:p,meaning:`Sephirah lens of ${p}.`,hermeticFrame:'Card interpreted through this Sephirothic station.'})),
  '369': ['Triad Theme','Triad Shadow','Triad Resource','Clarifier 1','Clarifier 2','Clarifier 3','Clarifier 4','Clarifier 5','Synthesis'].map((p)=>({position:p,meaning:`Function of ${p}.`,hermeticFrame:'Numerical rhythm of manifestation and refinement.'}))
};

export const getPositionMeanings = (spread: TarotSpreadType) => defs[spread];
