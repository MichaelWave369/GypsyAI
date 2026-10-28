import { describe, expect, it } from 'vitest';
import { shuffledRitualDeck } from '../site/src/ritualDraw';
import {
  ATLAS_TEMPLATES, validateAtlasLayout, serializeAtlasLayout, parseAtlasJSON,
  moveAtlasSlot, chooseAtlasCard, atlasReadingPacket
} from '../site/src/spreadAtlas';
import { buildFieldLoom } from '../site/src/fieldLoomEvidence';
import type { AtlasLayout } from '../site/src/spreadAtlas';

const custom = ATLAS_TEMPLATES[0];
const deterministic = () => shuffledRitualDeck(max => max - 1);

describe('GAIA Spread Atlas v0.6', () => {
  it('provides three original layouts with valid normalized, non-overlapping positions', () => {
    expect(ATLAS_TEMPLATES).toHaveLength(3);
    for (const layout of ATLAS_TEMPLATES) {
      expect(validateAtlasLayout(layout)).toEqual(layout);
      expect(layout.slots.length).toBeGreaterThanOrEqual(1);
      expect(layout.slots.length).toBeLessThanOrEqual(5);
      expect(new Set(layout.slots.map(x=>x.label.toLowerCase())).size).toBe(layout.slots.length);
    }
  });

  it('roundtrips layouts without code execution or uncontrolled schema expansion', () => {
    const json = serializeAtlasLayout(custom);
    expect(parseAtlasJSON(json)).toEqual(custom);
    expect(() => parseAtlasJSON('{bad json')).toThrow();
    expect(() => parseAtlasJSON('x'.repeat(8001))).toThrow('too large');
    expect(() => validateAtlasLayout({...custom, networkEndpoint:'https://example.com'})).toThrow();
    expect(() => validateAtlasLayout({...custom,slots:[
      {...custom.slots[0],meaning:'<script>alert(1)</script>'}
    ]})).toThrow();
    expect(() => validateAtlasLayout({...custom,slots:[
      {...custom.slots[0],label:'One'},
      {...custom.slots[1],label:'one'}
    ]})).toThrow('unique');
  });

  it('rejects invalid positions and blocks layout collisions during movement', () => {
    expect(() => validateAtlasLayout({...custom,slots:[
      {...custom.slots[0],x:1.5},...custom.slots.slice(1)]})).toThrow();
    expect(() => moveAtlasSlot(custom,0,custom.slots[1].x,custom.slots[1].y)).toThrow('overlapping');
    const moved=moveAtlasSlot(custom,0,0.12,0.12);
    expect(moved.slots[0].x).toBe(.12);
    expect(moved.slots[0].y).toBe(.12);
    expect(custom.slots[0].x).toBe(.29);
    expect(()=>moveAtlasSlot(custom,-1,.2,.3)).toThrow();
  });

  it('uses real picked cards in every custom position with no replacement', () => {
    let state = {remaining:deterministic(),selected:[] as ReturnType<typeof chooseAtlasCard>['selected']};
    const drawnIds: string[] = [];
    for (let i=0;i<custom.slots.length;i++) {
      state=chooseAtlasCard(state.remaining,state.selected,custom,i+4);
      drawnIds.push(state.selected[i].card.id);
      expect(state.selected[i].position).toBe(custom.slots[i].label);
    }
    expect(new Set(drawnIds).size).toBe(custom.slots.length);
    expect(state.remaining).toHaveLength(78-custom.slots.length);
    expect(()=>chooseAtlasCard(state.remaining,state.selected,custom,0)).toThrow('complete');
    const packet=atlasReadingPacket(custom,state.selected);
    expect(packet.modality).toBe('tarot');
    expect(packet.facts.cards).toHaveLength(5);
    expect(packet.facts.layout).toHaveProperty('name','Crossroads');
    expect(JSON.stringify(packet).length).toBeLessThan(5800);
    expect(packet.requiredSections).toEqual([]);
  });

  it('Field Loom recognizes custom slot roles and labels them as user-authored', () => {
    const layout:AtlasLayout = ATLAS_TEMPLATES[2]; // Two Perspectives
    let state={remaining:deterministic(),selected:[] as ReturnType<typeof chooseAtlasCard>['selected']};
    for(let i=0;i<layout.slots.length;i++){
      state=chooseAtlasCard(state.remaining,state.selected,layout,0);
    }
    for(const lens of ['positions','keywords','elements','arcana'] as const){
      const graph=buildFieldLoom(state.selected,lens,layout);
      expect(graph.nodes).toHaveLength(2);
      expect(graph.links).toHaveLength(1);
      expect(graph.nodes[0].positionMeaning).toBe(layout.slots[0].meaning);
      expect(graph.nodes[0].sources.find(x=>x.source==='spread-definition')?.text)
        .toContain('user-authored');
      expect(graph.nodes[1].card).toBe(state.selected[1].card.name);
      expect(graph.links[0].observations[0].text).toContain('Inside → Outside');
    }
    expect(()=>buildFieldLoom(state.selected,'positions')).toThrow('complete confirmed');
  });

  it('fails closed if custom labels, selected count, or card identity do not match', () => {
    const layout=ATLAS_TEMPLATES[2];
    const first=chooseAtlasCard(deterministic(),[],layout,8);
    expect(()=>atlasReadingPacket(layout,first.selected)).toThrow('Finish a valid');
    const second=chooseAtlasCard(first.remaining,first.selected,layout,10);
    expect(()=>atlasReadingPacket(layout,[
      {...second.selected[0],position:'Pretend'},second.selected[1]
    ])).toThrow('Finish a valid');
    expect(()=>atlasReadingPacket(layout,[
      second.selected[0],{...second.selected[0],position:layout.slots[1].label}
    ])).toThrow('Finish a valid');
  });
});
