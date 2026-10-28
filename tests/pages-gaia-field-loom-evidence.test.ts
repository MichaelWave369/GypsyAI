import { describe, expect, it } from 'vitest';
import { drawCards } from '@/lib/tarot/engine';
import { getPositionMeanings } from '@/lib/tarot/positions';
import { buildFieldLoom, SOURCE_LABELS } from '../site/src/fieldLoomEvidence';
import type { LoomLens } from '../site/src/fieldLoomEvidence';

describe('GAIA Field Loom v2 evidence contract', () => {
  const drawn = drawCards('three-card', 'field-loom-confirmed-seed');

  it('only presents existing drawn cards, orientations, and canonical spread roles', () => {
    const model = buildFieldLoom(drawn, 'positions');
    expect(model.nodes).toHaveLength(3);
    expect(model.links).toHaveLength(2);
    expect(model.nodes.map(n => n.card)).toEqual(drawn.map(d => d.card.name));
    expect(model.nodes.map(n => n.orientation)).toEqual(drawn.map(d => d.orientation));
    expect(model.nodes.map(n => n.positionMeaning)).toEqual(
      getPositionMeanings('three-card').map(p => p.meaning));
    expect(model.links[0].observations[0].text).toContain('Past → Present');
    expect(model.links[1].observations[0].text).toContain('Present → Future');
    expect(model.nodes.every(n => n.sources.every(s => !!SOURCE_LABELS[s.source]))).toBe(true);
  });

  it('separates deck labels, actual choices, position rules, and editorial prompts', () => {
    const model = buildFieldLoom(drawn, 'positions');
    expect(model.nodes[0].sources.map(s => s.source)).toContain('confirmed-draw');
    expect(model.nodes[0].sources.map(s => s.source)).toContain('spread-definition');
    expect(model.nodes[0].sources.map(s => s.source)).toContain('deck-data');
    expect(model.links[0].observations.find(s => s.source === 'editorial-question')).toBeDefined();
    expect(model.links[0].observations.find(s => s.source === 'editorial-question')?.text).toContain('?');
  });

  it('compares only exact stored orientation keywords', () => {
    const model = buildFieldLoom(drawn, 'keywords');
    expect(model.links[0].observations.map(o => o.source)).toEqual(
      ['spread-definition','deck-data','deck-data','deck-data']);
    expect(model.nodes[0].keywords).toEqual(
      drawn[0].orientation === 'upright'
        ? drawn[0].card.upright_keywords : drawn[0].card.reversed_keywords);
    const observations = model.links[0].observations.map(o => o.text).join(' ');
    expect(observations).toContain(model.nodes[0].card);
    expect(observations).toMatch(/Exact matching keyword|No exact keyword labels overlap/);
  });

  it('never infers an element if either card lacks a recorded element', () => {
    const model = buildFieldLoom(drawn, 'elements');
    for (const link of model.links) {
      const a = model.nodes.find(n=>n.id===link.fromId)!;
      const b = model.nodes.find(n=>n.id===link.toId)!;
      expect(link.observations.every(o=>o.source !== 'editorial-question')).toBe(true);
      const text = link.observations.map(o=>o.text).join(' ');
      if (!a.element || !b.element) {
        expect(text).toContain('no element comparison is made');
      } else {
        expect(text).toContain('The recorded element labels');
      }
    }
  });

  it('uses a separate arcana lens, never treating it as a calculation', () => {
    const model = buildFieldLoom(drawn, 'arcana');
    expect(model.nodes.map(x=>x.arcana)).toEqual(drawn.map(d=>d.card.arcana));
    expect(model.links[0].observations[1].text).toContain('recorded as');
  });

  it('supports one-card readings without manufacturing a pairwise connection', () => {
    const one = buildFieldLoom(drawCards('single', 'focus-only'), 'positions');
    expect(one.nodes).toHaveLength(1);
    expect(one.links).toEqual([]);
    expect(one.nodes[0].position).toBe('Focus');
  });

  it('fails closed for incomplete, unsupported, or fabricated spreads', () => {
    expect(()=>buildFieldLoom([], 'positions')).toThrow('complete confirmed');
    expect(()=>buildFieldLoom(drawn.slice(0,2), 'positions')).toThrow('complete confirmed');
    expect(()=>buildFieldLoom([drawn[0],drawn[0],drawn[0]], 'positions')).toThrow();
    expect(()=>buildFieldLoom(drawn, 'mystic-energy' as LoomLens)).toThrow('supported');
    expect(()=>buildFieldLoom([{...drawn[0],position:'Universe'}], 'positions')).toThrow('positions');
  });
});
