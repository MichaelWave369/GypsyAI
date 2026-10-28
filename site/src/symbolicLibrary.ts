/**
 * GAIA Symbolic Library v0.7
 *
 * Editorial meanings belong to GAIA. Historical claims are recorded separately
 * and only for entries that have been checked against an identifiable work.
 * A historical source is evidence of a tradition's published interpretation,
 * NEVER empirical evidence about a reader or their future.
 *
 * All source links are curated static URLs. No runtime fetching, scraping,
 * third-party illustrations, tracking, or inherited copyright claims.
 */
import deck from '@/lib/tarot/deck.json';
import type { TarotCard } from '@/types';

export type LibrarySource = {
  id: string;
  title: string;
  authorOrInstitution: string;
  dateLabel: string;
  kind: 'historical-primary-text' | 'institutional-collection';
  url: string;
  scope: string;
  accessNote: string;
};

export const SYMBOLIC_SOURCES: readonly LibrarySource[] = [
  {
    id: 'waite-pictorial-key',
    title: 'The Pictorial Key to the Tarot',
    authorOrInstitution: 'Arthur Edward Waite; cards illustrated by Pamela Colman Smith',
    dateLabel: 'Originally issued 1910–1911',
    kind: 'historical-primary-text',
    url: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot',
    scope: 'A historical account of Rider–Waite–Smith card symbolism and divinatory meanings, not a universal tarot authority.',
    accessNote: 'Hosted public-domain text. Specific card sections are cited individually below.'
  },
  {
    id: 'jhu-pam-a',
    title: 'Rider–Waite–Smith “Pam-A” tarot deck, circa 1919',
    authorOrInstitution: 'Johns Hopkins University Libraries, Special Collections',
    dateLabel: 'Deck c. 1919; cataloged archival item',
    kind: 'institutional-collection',
    url: 'https://aspace.library.jhu.edu/repositories/3/archival_objects/330032',
    scope: 'Institutional documentation for an early 78-card Rider–Waite–Smith deck.',
    accessNote: 'Provenance and historical deck context only. Not evidence for any individual divinatory meaning.'
  },
  {
    id: 'loc-papus',
    title: 'The Tarot of the Bohemians (English edition)',
    authorOrInstitution: 'Papus; Library of Congress',
    dateLabel: 'English edition 1896',
    kind: 'institutional-collection',
    url: 'https://www.loc.gov/item/77355368/',
    scope: 'A different historical occult-tarot perspective in an institutional public-domain collection.',
    accessNote: 'Catalog reference for future comparison; card-by-card interpretations NOT reviewed for GAIA.'
  }
] as const;

export type HistoricalAnnotation = {
  cardId: string;
  sourceId: 'waite-pictorial-key';
  sectionTitle: string;
  sectionUrl: string;
  checkedMeaning: string;
  interpretationScope: 'card-symbolism' | 'divinatory-upright-reversed';
  readingNote: string;
};

/** Explicitly reviewed samples only. No automatic mapping to other 74 cards. */
export const REVIEWED_CARD_NOTES: readonly HistoricalAnnotation[] = [
  {
    cardId: 'major-7',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'VII. The Chariot',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/vii-the-chariot',
    checkedMeaning: 'Waite discusses a triumphant charioteer and the limits of outward or rational conquest. His symbolism is more complicated than a simple promise of success.',
    interpretationScope: 'card-symbolism',
    readingNote: 'This is Waite’s historical interpretation of the imagery, not proof that a person has overcome obstacles or will triumph.'
  },
  {
    cardId: 'major-13',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'XIII. Death',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xiii-death',
    checkedMeaning: 'Waite explores death imagery together with transformation, spiritual passage, renewal, and changes of consciousness.',
    interpretationScope: 'card-symbolism',
    readingNote: 'The historical discussion is complex and should not be used as a literal death prediction.'
  },
  {
    cardId: 'wands-5',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Five of Wands',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-wands',
    checkedMeaning: 'Waite depicts a simulated struggle between youths. He links the upright card to imitation and strenuous competition; the reversed meaning includes disputes and contradiction.',
    interpretationScope: 'divinatory-upright-reversed',
    readingNote: 'GAIA’s modern “creative tension” vocabulary is an editorial interpretation, not a direct quotation from Waite.'
  },
  {
    cardId: 'wands-8',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Eight of Wands',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/eight-of-wands',
    checkedMeaning: 'Waite describes wands in flight approaching a destination. His upright associations include activity and swiftness; reversed associations include dispute and discord.',
    interpretationScope: 'divinatory-upright-reversed',
    readingNote: 'GAIA’s “mixed signals” reversed theme is a modern editorial suggestion, not Waite’s recorded wording.'
  }
] as const;

export type LibraryEntry = {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: string | null;
  editorial: {
    uprightKeywords: string[];
    reversedKeywords: string[];
    uprightMeaning: string;
    reversedMeaning: string;
    attribution: 'GAIA original editorial writing';
  };
  recordedHermetic: Record<string, unknown>;
  annotation: HistoricalAnnotation | null;
  annotationStatus: 'reviewed-source-note' | 'not-yet-reviewed';
};

const CARDS = deck as TarotCard[];
const reviewMap = new Map(REVIEWED_CARD_NOTES.map(note => [note.cardId,note]));
const safeCard = (card: TarotCard): LibraryEntry => {
  const annotation = reviewMap.get(card.id) || null;
  return {
    id: card.id,
    name: card.name,
    arcana: card.arcana,
    suit: card.suit,
    editorial: {
      uprightKeywords: [...card.upright_keywords],
      reversedKeywords: [...card.reversed_keywords],
      uprightMeaning: card.short_upright_meaning,
      reversedMeaning: card.short_reversed_meaning,
      attribution: 'GAIA original editorial writing'
    },
    recordedHermetic: { ...card.hermetic },
    annotation,
    annotationStatus: annotation ? 'reviewed-source-note' : 'not-yet-reviewed'
  };
};

const ENTRIES = CARDS.map(safeCard);
export function listSymbolicEntries(): LibraryEntry[] {
  return ENTRIES.map(entry => ({
    ...entry, editorial: {
      ...entry.editorial,
      uprightKeywords: [...entry.editorial.uprightKeywords],
      reversedKeywords: [...entry.editorial.reversedKeywords]
    }, recordedHermetic: { ...entry.recordedHermetic }
  }));
}

export function findSymbolicEntry(id: string): LibraryEntry | null {
  const found = ENTRIES.find(e => e.id === id);
  return found ? safeCard(CARDS.find(c=>c.id === found.id)!) : null;
}

export type SymbolicFilter = 'all' | 'major' | 'minor' | 'reviewed';
export function searchSymbolicEntries(search: string, filter: SymbolicFilter = 'all'): LibraryEntry[] {
  if (!['all','major','minor','reviewed'].includes(filter)) throw new Error('Unsupported library filter.');
  const query = search.trim().toLowerCase().slice(0,100);
  return listSymbolicEntries().filter(entry => {
    if (filter === 'reviewed' && !entry.annotation) return false;
    if (filter === 'major' && entry.arcana !== 'major') return false;
    if (filter === 'minor' && entry.arcana !== 'minor') return false;
    return !query || [
      entry.name,
      entry.suit || '',
      ...entry.editorial.uprightKeywords,
      ...entry.editorial.reversedKeywords
    ].some(part => part.toLowerCase().includes(query));
  });
}

export function getSourceForAnnotation(annotation: HistoricalAnnotation): LibrarySource {
  const source = SYMBOLIC_SOURCES.find(s => s.id === annotation.sourceId);
  if (!source || source.kind !== 'historical-primary-text') throw new Error('Historical annotation lacks a primary source.');
  return source;
}

export function symbolicCoverage() {
  return { total: ENTRIES.length,
    editorial: ENTRIES.filter(e=>e.editorial.uprightMeaning && e.editorial.reversedMeaning).length,
    historicalReviewed: REVIEWED_CARD_NOTES.length,
    historicalNotReviewed: ENTRIES.length-REVIEWED_CARD_NOTES.length
  };
}
