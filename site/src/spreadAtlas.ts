/**
 * GAIA Spread Atlas v0.6.0
 * Independently authored browser-only layout definitions.
 * Coordinates are normalized to [0,1] for consistent rendering/export.
 * Imported text is user-authored DATA, never executable code or model policy.
 */
import deck from '@/lib/tarot/deck.json';
import type { DrawnCard, TarotCard } from '@/types';
import type { RitualCard } from './ritualDraw';

export type AtlasSlot = { id: string; label: string; meaning: string; x: number; y: number };
export type AtlasLayout = { schema: 'GAIA_SPREAD_ATLAS_V1'; name: string; slots: AtlasSlot[] };
const allCards = deck as TarotCard[];
const MAX_JSON = 8000;
const clean = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max
    && value.trim() === value && !/[<>\u0000-\u001f\u007f]/.test(value);
const allowedKeys = (item: object, keys: string[]) =>
  Object.keys(item).sort().join('|') === keys.sort().join('|');

export function validateAtlasLayout(input: unknown): AtlasLayout {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid spread layout.');
  const obj = input as Record<string, unknown>;
  if (!allowedKeys(obj, ['schema', 'name', 'slots']) ||
      obj.schema !== 'GAIA_SPREAD_ATLAS_V1' || !clean(obj.name, 48) ||
      !Array.isArray(obj.slots) || obj.slots.length < 1 || obj.slots.length > 5) {
    throw new Error('Layout must have a title and between one and five positions.');
  }
  const seen = new Set<string>();
  const slots: AtlasSlot[] = obj.slots.map((candidate: unknown, i: number) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new Error('Invalid layout position.');
    const s = candidate as Record<string, unknown>;
    if (!allowedKeys(s, ['id', 'label', 'meaning', 'x', 'y']) ||
        s.id !== 'slot-' + (i + 1) || !clean(s.label, 32) ||
        !clean(s.meaning, 110) ||
        typeof s.x !== 'number' || !Number.isFinite(s.x) || s.x < 0.09 || s.x > 0.91 ||
        typeof s.y !== 'number' || !Number.isFinite(s.y) || s.y < 0.12 || s.y > 0.88) {
      throw new Error('Each position needs a unique label, short meaning, and in-bounds coordinates.');
    }
    const normal = s.label.toLowerCase();
    if (seen.has(normal)) throw new Error('Position labels must be unique.');
    seen.add(normal);
    return { id: s.id, label: s.label, meaning: s.meaning, x: s.x, y: s.y } as AtlasSlot;
  });
  for (let i=0; i<slots.length; i++) {
    for (let j=i+1; j<slots.length; j++) {
      const dx=slots[i].x-slots[j].x, dy=slots[i].y-slots[j].y;
      if (Math.hypot(dx,dy) < 0.15) throw new Error('Move overlapping positions farther apart.');
    }
  }
  return { schema: 'GAIA_SPREAD_ATLAS_V1', name: obj.name, slots };
}
const preset = (name:string, values:Array<[string,string,number,number]>):AtlasLayout =>
  validateAtlasLayout({schema:'GAIA_SPREAD_ATLAS_V1',name,slots:values.map(([label,meaning,x,y],i)=>({
    id:'slot-'+(i+1),label,meaning,x,y
  }))});

export const ATLAS_TEMPLATES: AtlasLayout[] = [
  preset('Crossroads', [
    ['Choice A','One path worth exploring.',.29,.27],
    ['Choice B','A competing path worth exploring.',.71,.27],
    ['Tension','What makes the choice difficult.',.50,.50],
    ['Support','What can help you choose.',.29,.76],
    ['Next Step','A grounded action to consider.',.71,.76]
  ]),
  preset('369 Reflection', [
    ['Signal','What first invites attention.',.23,.30],
    ['Pattern','What develops across the situation.',.50,.50],
    ['Integration','What can be carried forward.',.77,.70]
  ]),
  preset('Two Perspectives', [
    ['Inside','How the situation feels from within.',.29,.50],
    ['Outside','A different way to consider it.',.71,.50]
  ])
];

export function parseAtlasJSON(text: string): AtlasLayout {
  if (text.length > MAX_JSON) throw new Error('Spread JSON is too large.');
  try { return validateAtlasLayout(JSON.parse(text)); }
  catch (e) { throw new Error(e instanceof Error ? e.message : 'Invalid spread JSON.'); }
}

export function serializeAtlasLayout(input: AtlasLayout): string {
  return JSON.stringify(validateAtlasLayout(input), null, 2);
}

export function moveAtlasSlot(input: AtlasLayout, index: number, x: number, y: number): AtlasLayout {
  const layout = validateAtlasLayout(input);
  if (!Number.isInteger(index) || index < 0 || index >= layout.slots.length ||
      !Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Invalid position movement.');
  const safeX = Math.max(.09, Math.min(.91, Math.round(x*1000)/1000));
  const safeY = Math.max(.12, Math.min(.88, Math.round(y*1000)/1000));
  return validateAtlasLayout({
    ...layout, slots:layout.slots.map((s,i)=>i===index?{...s,x:safeX,y:safeY}:s)
  });
}

export function chooseAtlasCard(
  remaining: readonly RitualCard[], chosen: readonly DrawnCard[],
  layoutInput: AtlasLayout, index: number
): {remaining:RitualCard[];selected:DrawnCard[]} {
  const layout = validateAtlasLayout(layoutInput);
  if (chosen.length >= layout.slots.length) throw new Error('Custom spread is complete.');
  if (!Number.isSafeInteger(index) || index < 0 || index >= remaining.length) {
    throw new Error('Choose an available face-down card.');
  }
  const picked = remaining[index];
  if (chosen.some(c=>c.card.id===picked.card.id)) throw new Error('Card already chosen.');
  return {
    remaining:remaining.filter((_,i)=>i!==index),
    selected:[...chosen,{card:picked.card,orientation:picked.orientation,
      position:layout.slots[chosen.length].label}]
  };
}

export function atlasReadingPacket(layoutInput: AtlasLayout, chosen:readonly DrawnCard[]) {
  const layout = validateAtlasLayout(layoutInput);
  const available = new Map(allCards.map(c=>[c.id,c]));
  if (chosen.length !== layout.slots.length ||
      new Set(chosen.map(c=>c.card.id)).size!==chosen.length ||
      chosen.some((c,i)=>c.position !== layout.slots[i].label ||
        !available.has(c.card.id) || c.card.name!==available.get(c.card.id)?.name ||
        (c.orientation!=='upright' && c.orientation!=='reversed'))) {
    throw new Error('Finish a valid custom spread before preparing a reading.');
  }
  const facts = {
    layout:{ name:layout.name, positions:layout.slots.map(s=>({
      position:s.label,role:s.meaning,x:s.x,y:s.y
    })) },
    cards:chosen.map((c,i)=>({
      position:layout.slots[i].label, role:layout.slots[i].meaning,
      name:c.card.name, orientation:c.orientation, arcana:c.card.arcana,
      keywords:(c.orientation==='upright'?c.card.upright_keywords:c.card.reversed_keywords).slice(0,3),
      cardSpecificMeaning:c.orientation==='upright'?c.card.short_upright_meaning:c.card.short_reversed_meaning,
      recordedElement:c.card.hermetic.element||null
    })),
    sourceNote:'Position labels and meanings were user-authored; card identities and descriptions come from the GAIA tarot deck. Symbolic reflection, not prediction.'
  };
  const packet = {modality:'tarot' as const, facts,
    allowedTerms:chosen.map(c=>c.card.name),requiredSections:[] as string[]};
  if (JSON.stringify(packet).length>5800)throw new Error('Custom spread exceeds the local Oracle context allowance.');
  return packet;
}
