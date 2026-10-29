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

  it('counts only the sixteen explicitly checked historical card sections as reviewed', () => {
    const coverage = symbolicCoverage();
    expect(coverage).toEqual({
      total:78, editorial:78, historicalReviewed:16, historicalNotReviewed:62
    });
    const ids = REVIEWED_CARD_NOTES.map(n=>n.cardId);
    expect(new Set(ids)).toEqual(new Set([
      'major-0','major-1','major-2','major-3','major-7','major-8','major-9',
      'major-13','major-17','major-19','wands-ace','wands-5','wands-8',
      'cups-2','swords-3','pentacles-7'
    ]));
    expect(new Set(ids).size).toBe(16);
    expect(listSymbolicEntries().filter(e=>e.annotation)).toHaveLength(16);
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
    expect(searchSymbolicEntries('', 'reviewed')).toHaveLength(16);
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

  it('records the new twelve primary-text chapters with exact card-specific URLs and honest evidence scope',()=>{
    const added=[
      ['major-0','zero-the-fool','card-symbolism'],
      ['major-1','i-the-magician','card-symbolism'],
      ['major-2','ii-the-high-priestess','card-symbolism'],
      ['major-3','iii-the-empress','card-symbolism'],
      ['major-8','viii-strength-or-fortitude','card-symbolism'],
      ['major-9','ix-the-hermit','card-symbolism'],
      ['major-17','xvii-the-star','card-symbolism'],
      ['major-19','xix-the-sun','card-symbolism'],
      ['wands-ace','ace-of-wands','divinatory-upright-reversed'],
      ['cups-2','two-of-cups','card-symbolism'],
      ['swords-3','three-of-swords','divinatory-upright-reversed'],
      ['pentacles-7','seven-of-pentacles','divinatory-upright-reversed']
    ] as const;
    for (const [id,slug,scope] of added){
      const note=findSymbolicEntry(id)!.annotation!;
      expect(note).not.toBeNull();
      expect(note.sourceId).toBe('waite-pictorial-key');
      expect(note.sectionUrl).toBe('https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/'+slug);
      expect(note.interpretationScope).toBe(scope);
      expect(note.checkedMeaning.length).toBeGreaterThan(80);
      expect(note.readingNote.length).toBeGreaterThan(65);
      expect(note.checkedMeaning).not.toMatch(/verified prediction|empirical proof/);
    }
    expect(REVIEWED_CARD_NOTES.filter(n=>n.interpretationScope==='card-symbolism')).toHaveLength(10);
    expect(REVIEWED_CARD_NOTES.filter(n=>n.interpretationScope==='divinatory-upright-reversed')).toHaveLength(6);
  });

  it('preserves source disagreements rather than laundering edited keywords into Waite meanings',()=>{
    const star=findSymbolicEntry('major-17')!.annotation!;
    expect(star.checkedMeaning).toContain('incomplete');
    const hermit=findSymbolicEntry('major-9')!.annotation!;
    expect(hermit.readingNote).toContain('disputes');
    const pentacles=findSymbolicEntry('pentacles-7')!.annotation!;
    expect(pentacles.checkedMeaning).toContain('contradictory');
    const cups=findSymbolicEntry('cups-2')!.annotation!;
    expect(cups.readingNote).toContain('not a distinct reversed');
    const strength=findSymbolicEntry('major-8')!.annotation!;
    expect(strength.checkedMeaning).toContain('Strength and Justice');
    expect(findSymbolicEntry('swords-4')!.annotation).toBeNull();
  });

  it('does not attach institutional context to a card meaning by default', () => {
    const archivalIds = SYMBOLIC_SOURCES.filter(s=>s.kind==='institutional-collection').map(s=>s.id);
    expect(archivalIds).toEqual(['jhu-pam-a','loc-papus']);
    expect(REVIEWED_CARD_NOTES.every(n=>!archivalIds.includes(n.sourceId))).toBe(true);
    expect(findSymbolicEntry('major-15')?.annotation).toBeNull();
  });
});
