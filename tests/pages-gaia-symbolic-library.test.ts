import { describe, expect, it } from 'vitest';
import deck from '@/lib/tarot/deck.json';
import {
  SYMBOLIC_SOURCES, REVIEWED_CARD_NOTES, findSymbolicEntry, getSourceForAnnotation,
  listSymbolicEntries, searchSymbolicEntries, symbolicCoverage
} from '../site/src/symbolicLibrary';

describe('GAIA Symbolic Library historical provenance', () => {
  it('shows all 78 canonical cards with separately attributed original upright and reversed meanings', () => {
    const entries = listSymbolicEntries();
    expect(entries).toHaveLength(78);
    expect(entries.map(e=>e.id)).toEqual(deck.map(c=>c.id));
    expect(new Set(entries.map(e=>e.id)).size).toBe(78);
    expect(entries.every(e=>e.editorial.attribution === 'GAIA original editorial writing')).toBe(true);
    expect(entries.every(e=>e.editorial.uprightMeaning.length>25 && e.editorial.reversedMeaning.length>25)).toBe(true);
    for (const card of deck) {
      const entry = findSymbolicEntry(card.id);
      expect(entry).not.toBeNull();
      expect(entry!.editorial.uprightMeaning).toBe(card.short_upright_meaning);
      expect(entry!.editorial.reversedMeaning).toBe(card.short_reversed_meaning);
    }
  });

  it('marks only the four explicitly checked historical card sections as reviewed', () => {
    const coverage = symbolicCoverage();
    expect(coverage).toEqual({
      total:78, editorial:78, historicalReviewed:4, historicalNotReviewed:74
    });
    const ids = REVIEWED_CARD_NOTES.map(n=>n.cardId);
    expect(ids).toEqual(['major-7','major-13','wands-5','wands-8']);
    expect(new Set(ids).size).toBe(4);
    expect(listSymbolicEntries().filter(e=>e.annotation)).toHaveLength(4);
    expect(findSymbolicEntry('wands-9')?.annotationStatus).toBe('not-yet-reviewed');
  });

  it('pins every reviewed card to a registered primary-source section, not an archive catalog', () => {
    expect(SYMBOLIC_SOURCES.some(s=>s.kind==='institutional-collection')).toBe(true);
    for (const annotation of REVIEWED_CARD_NOTES) {
      const card = findSymbolicEntry(annotation.cardId);
      expect(card).not.toBeNull();
      const source = getSourceForAnnotation(annotation);
      expect(source.kind).toBe('historical-primary-text');
      expect(annotation.sectionUrl.startsWith('https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/')).toBe(true);
      expect(annotation.checkedMeaning.length).toBeGreaterThan(60);
      expect(annotation.readingNote.length).toBeGreaterThan(40);
      expect(annotation.interpretationScope).toMatch(/card-symbolism|divinatory-upright-reversed/);
    }
    expect(findSymbolicEntry('major-7')?.annotation?.interpretationScope).toBe('card-symbolism');
    expect(findSymbolicEntry('wands-8')?.annotation?.interpretationScope).toBe('divinatory-upright-reversed');
  });

  it('does not promote inherited Hermetic paths or empty minor decans into verified history', () => {
    const chariot = findSymbolicEntry('major-7')!;
    expect(chariot.recordedHermetic).toHaveProperty('path');
    expect(chariot.annotation?.checkedMeaning).not.toContain('Cheth');
    const wands = findSymbolicEntry('wands-8')!;
    expect(wands.recordedHermetic).toHaveProperty('decan');
    expect(wands.annotation?.checkedMeaning).not.toContain('Hod');
  });

  it('searches by card and orientation keywords with explicit historical filter', () => {
    expect(searchSymbolicEntries('chariot').map(c=>c.id)).toEqual(['major-7']);
    expect(searchSymbolicEntries('recovery').some(c=>c.name==='10 of Swords')).toBe(true);
    expect(searchSymbolicEntries('', 'major')).toHaveLength(22);
    expect(searchSymbolicEntries('', 'minor')).toHaveLength(56);
    expect(searchSymbolicEntries('', 'reviewed')).toHaveLength(4);
    expect(searchSymbolicEntries('invalid-query-never-exists')).toEqual([]);
    expect(() => searchSymbolicEntries('', 'secret' as 'all')).toThrow('Unsupported');
  });

  it('protects against accidental edits to canonical keyword arrays from returned entries', () => {
    const copy = listSymbolicEntries();
    copy[0].editorial.uprightKeywords.push('fabricated');
    copy[0].recordedHermetic['fake'] = true;
    const fresh = findSymbolicEntry(copy[0].id)!;
    expect(fresh.editorial.uprightKeywords).not.toContain('fabricated');
    expect(fresh.recordedHermetic).not.toHaveProperty('fake');
  });

  it('does not attach institutional context to a card meaning by default', () => {
    const archivalIds = SYMBOLIC_SOURCES.filter(s=>s.kind==='institutional-collection').map(s=>s.id);
    expect(archivalIds).toEqual(['jhu-pam-a','loc-papus']);
    expect(REVIEWED_CARD_NOTES.every(n=>!archivalIds.includes(n.sourceId))).toBe(true);
    expect(findSymbolicEntry('major-0')?.annotation).toBeNull();
  });
});
