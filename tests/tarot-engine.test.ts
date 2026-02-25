import { describe, it, expect } from 'vitest';
import { drawCards } from '@/lib/tarot/engine';

describe('tarot draw engine', () => {
  it('draws unique cards per spread', () => {
    const drawn = drawCards('celtic-cross', 'unique-seed');
    const ids = drawn.map((d) => d.card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is deterministic with same seed', () => {
    const a = drawCards('three-card', 'stable-seed').map((d) => `${d.card.id}-${d.orientation}`);
    const b = drawCards('three-card', 'stable-seed').map((d) => `${d.card.id}-${d.orientation}`);
    expect(a).toEqual(b);
  });
});
