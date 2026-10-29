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

/** Individual checked sections only. Unreviewed entries receive no historical note. */
export const REVIEWED_CARD_NOTES: readonly HistoricalAnnotation[] = [
  {
    cardId: 'major-0',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Zero. The Fool',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/zero-the-fool',
    checkedMeaning: 'Waite pictures a finely dressed traveler pausing at a precipice, accompanied by a dog and carrying a rose and travel bag. He describes the figure as a spirit seeking experience, not merely a foolish person acting without thought.',
    interpretationScope: 'card-symbolism',
    readingNote: 'Waite\'s image interpretation does not verify a positive upright or reversed outcome. GAIA\'s newer advice about first steps is independently authored.'
  },
  {
    cardId: 'major-1',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'I. The Magician',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/i-the-magician',
    checkedMeaning: 'Waite depicts one hand raised and one pointing to earth, with symbols of all four tarot suits on the table. For him these gestures and tools express spiritual gifts and the communication of power from above to below.',
    interpretationScope: 'card-symbolism',
    readingNote: 'The historical chapter presents Waite\'s Christian-esoteric symbolism; it does not prove supernatural powers or specifically establish a reversed card meaning.'
  },
  {
    cardId: 'major-2',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'II. The High Priestess',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ii-the-high-priestess',
    checkedMeaning: 'Waite describes the High Priestess between two temple pillars, holding a partly veiled Tora scroll, with moon imagery and pomegranate-patterned veil. He links her to concealed teaching, reflected light and Shekinah.',
    interpretationScope: 'card-symbolism',
    readingNote: 'This reflects Waite\'s particular religious and Kabbalistic framework, not a universal historical consensus or empirical evidence of intuition.'
  },
  {
    cardId: 'major-3',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'III. The Empress',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/iii-the-empress',
    checkedMeaning: 'Waite describes an enthroned woman with twelve stars, a Venus-marked shield, ripening grain and water. He relates her to earthly paradise and fecundity, while distinguishing her function from the High Priestess.',
    interpretationScope: 'card-symbolism',
    readingNote: 'Waite\'s fecundity imagery is historical source symbolism, not a prediction of pregnancy, fertility or personal circumstances.'
  },
  {
    cardId: 'major-8',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'VIII. Strength, or Fortitude',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/viii-strength-or-fortitude',
    checkedMeaning: 'Waite shows a woman calmly handling a lion with a garland of flowers. He discusses spiritual fortitude and the liberation of the higher nature from passions, and explicitly notes his switch of Strength and Justice\'s customary numbers.',
    interpretationScope: 'card-symbolism',
    readingNote: 'This source explains Waite\'s inner symbolism and trump numbering, not an independently reviewed reversed divinatory meaning or a measured force.'
  },
  {
    cardId: 'major-9',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'IX. The Hermit',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ix-the-hermit',
    checkedMeaning: 'Waite\'s Hermit raises a star-lit lantern from a height. Contrary to interpretations centered on isolation or private secrecy, Waite frames the lantern as a beacon associated with attainment and illumination.',
    interpretationScope: 'card-symbolism',
    readingNote: 'The chapter should not be paraphrased as Waite endorsing complete withdrawal; he explicitly disputes that narrow isolation reading.'
  },
  {
    cardId: 'major-17',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'XVII. The Star',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xvii-the-star',
    checkedMeaning: 'Waite describes a kneeling figure pouring water upon land and into water beneath a large eight-rayed star and seven smaller stars. He connects the scene to unveiled truth and spiritual gifts; he treats simple \'hope\' as an incomplete account.',
    interpretationScope: 'card-symbolism',
    readingNote: 'GAIA\'s modern language of renewal may be useful editorial reflection, but Waite\'s commentary is more specifically mystical and not proof of future reassurance.'
  },
  {
    cardId: 'major-19',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'XIX. The Sun',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xix-the-sun',
    checkedMeaning: 'Waite portrays a child riding a white horse beneath the sun, leaving a walled garden. He interprets the image as a movement from worldly light to spiritual consciousness, emphasizing simplicity and restored innocence.',
    interpretationScope: 'card-symbolism',
    readingNote: 'This historical account is spiritual allegory, not an objective prediction of prosperity, health or a guaranteed favorable event.'
  },
  {
    cardId: 'wands-ace',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Ace of Wands',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-wands',
    checkedMeaning: 'Waite shows a hand emerging from a cloud holding a wand. His upright list relates the card to creation, enterprise and origins; his reversed list includes decline, ruin and a qualified kind of clouded joy.',
    interpretationScope: 'divinatory-upright-reversed',
    readingNote: 'Waite\'s reversed vocabulary differs markedly from GAIA\'s modern suggestion to protect an early spark; do not attribute the newer wording to Waite.'
  },
  {
    cardId: 'cups-2',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Two of Cups',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-cups',
    checkedMeaning: 'Waite depicts two figures exchanging cups beneath a winged caduceus and lion\'s head. He links the card\'s divinatory associations to affection, affinity, friendship, union and sympathy, but this section does not separately list a reversed meaning.',
    interpretationScope: 'card-symbolism',
    readingNote: 'Waite supplies upright associations here, not a distinct reversed list. GAIA\'s reversed communication guidance remains its own editorial reflection.'
  },
  {
    cardId: 'swords-3',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Three of Swords',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/three-of-swords',
    checkedMeaning: 'Waite\'s Three of Swords shows swords piercing a heart against storm clouds. He associates the upright card with absence, separation and division, and gives reversed terms including confusion and mental estrangement.',
    interpretationScope: 'divinatory-upright-reversed',
    readingNote: 'These are Waite\'s period-specific divinatory terms, not a diagnosis of mental illness or evidence that a relationship will fail.'
  },
  {
    cardId: 'pentacles-7',
    sourceId: 'waite-pictorial-key',
    sectionTitle: 'Seven of Pentacles',
    sectionUrl: 'https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/seven-of-pentacles',
    checkedMeaning: 'Waite pictures a person leaning on a staff while examining seven pentacles among foliage. He explicitly calls the inherited upright meanings contradictory: money and business in some accounts, quarrels or innocence in others; reversed he notes anxiety over lending money.',
    interpretationScope: 'divinatory-upright-reversed',
    readingNote: 'The source itself records contradictory upright interpretations. GAIA must not present a single settled Waite prediction or treat this as financial advice.'
  },
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
  },
  {
    cardId: "major-4",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "IV. The Emperor",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/iv-the-emperor",
    checkedMeaning: "Waite depicts a crowned ruler on a throne adorned with rams, holding a globe and an ankh-shaped sceptre. He distinguishes worldly executive authority from higher intellectual kingship and expressly warns that the Emperor and Empress do not simply represent marriage.",
    interpretationScope: 'card-symbolism',
    readingNote: "This is Waite's symbolic account of authority and thought, not evidence that any individual will gain power, marry, or exercise control."
  },
  {
    cardId: "major-5",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "V. The Hierophant",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/v-the-hierophant",
    checkedMeaning: "Waite describes a triple-crowned religious figure between pillars, with crossed keys and two kneeling ministers. He connects the card to visible institutional religion and orthodox teaching, explicitly distinguishing it from the High Priestess and from the ruler of occult doctrine.",
    interpretationScope: 'card-symbolism',
    readingNote: "The source represents Waite's view of outward religious institutions, not a claim that any one doctrine is objectively true or that the card commands obedience."
  },
  {
    cardId: "major-6",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "VI. The Lovers",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/vi-the-lovers",
    checkedMeaning: "Waite places two unclothed human figures beneath a winged being, with the Tree of Life behind the man and the tree of knowledge behind the woman. He frames this new design as innocent human love and a theological covenant, replacing older marriage and vice-versus-virtue images.",
    interpretationScope: 'card-symbolism',
    readingNote: "This imagery does not establish a romantic prediction or measure compatibility; Waite's religious account is distinct from GAIA's editorial relationship advice."
  },
  {
    cardId: "major-10",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "X. Wheel of Fortune",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/x-wheel-of-fortune",
    checkedMeaning: "Waite describes a moving wheel with the four living creatures, a Sphinx representing balance and symbolic lettering inspired in part by Eliphas Levi. For him the turning image reflects flux in life and the universe while rejecting simple chance or fatalism.",
    interpretationScope: 'card-symbolism',
    readingNote: "The chapter's criticism of chance is part of Waite's esoteric philosophy, not empirical proof of providence or a forecast of changing fortune."
  },
  {
    cardId: "major-11",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XI. Justice",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xi-justice",
    checkedMeaning: "Waite locates Justice between pillars and distinguishes moral justice, which addresses deeds, from the more mysterious spiritual election he associates with a separate order of Providence. He specifically contrasts these pillars with those of the High Priestess.",
    interpretationScope: 'card-symbolism',
    readingNote: "Waite's discussion is moral and theological symbolism, not a prediction of a court ruling, legal outcome, or deserved reward."
  },
  {
    cardId: "major-12",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XII. The Hanged Man",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xii-the-hanged-man",
    checkedMeaning: "Waite describes a living tree, an inverted suspended figure, and a halo; the face expresses entrancement rather than suffering. He rejects easy labels such as martyrdom or mere prudence and links the image to a veiled relation between the Divine and the universe.",
    interpretationScope: 'card-symbolism',
    readingNote: "Do not rewrite Waite's suspended-life symbolism into a literal demand for sacrifice, self-harm, suffering, or a guaranteed spiritual awakening."
  },
  {
    cardId: "major-14",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XIV. Temperance",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xiv-temperance",
    checkedMeaning: "Waite's winged, neither-male-nor-female figure pours between chalices with one foot on land and one in water. His account connects this to the harmony of psychic and material aspects and a mystical idea of eternal life, not merely everyday moderation.",
    interpretationScope: 'card-symbolism',
    readingNote: "This is a specifically esoteric description, not a claim of physical immortality, medical benefit, or a universally agreed meaning of balance."
  },
  {
    cardId: "major-15",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XV. The Devil",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xv-the-devil",
    checkedMeaning: "Waite portrays a winged goat-like figure with an inverted torch above two chained, humanlike figures. He interprets their condition in terms of material bondage and the fallen human state, while noting the dominant figure is itself bound rather than free.",
    interpretationScope: 'card-symbolism',
    readingNote: "This is period religious symbolism, not evidence of demons, curses, literal possession, or an unavoidable fate for the reader."
  },
  {
    cardId: "major-16",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XVI. The Tower",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xvi-the-tower",
    checkedMeaning: "Waite disputes simple explanations of the Tower as pride or Adam's fall. He emphasizes the destruction of a false house of doctrine, where mistaken teaching and interpretation collapse, rather than treating the image solely as a falling physical building.",
    interpretationScope: 'card-symbolism',
    readingNote: "Do not translate Waite's contested intellectual and religious symbolism into a prediction of injury, disaster, or imminent personal ruin."
  },
  {
    cardId: "major-18",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XVIII. The Moon",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xviii-the-moon",
    checkedMeaning: "Waite describes a road passing between towers, a dog and wolf, an emerging water creature, and the moon's reflected light. He presents the scene as imaginative and instinctual fear at the edge of the unknown, with the mind observing unrest below.",
    interpretationScope: 'card-symbolism',
    readingNote: "This is a historical allegory of imagination and reflected light, not clinical evidence of anxiety, a diagnosis, or proof of hidden threats."
  },
  {
    cardId: "major-20",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XX. The Last Judgement",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xx-the-last-judgement",
    checkedMeaning: "Waite shows a trumpet-bearing angel above people rising from tombs. He treats their shared response as an inward call toward spiritual transformation, beyond a purely literal picture of final judgment and bodily resurrection.",
    interpretationScope: 'card-symbolism',
    readingNote: "The source is an explicitly Christian-esoteric interpretation, not a prediction of apocalypse, resurrection, or a supernatural event in a person's life."
  },
  {
    cardId: "major-21",
    sourceId: 'waite-pictorial-key',
    sectionTitle: "XXI. The World",
    sectionUrl: "https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xxi-the-world",
    checkedMeaning: "Waite reads the final trump as cosmic completion and the soul's vision of a self-knowing universe, while also rejecting explanations that identify the figure simply with an initiated Magus or the Absolute. He preserves multiple levels of meaning.",
    interpretationScope: 'card-symbolism',
    readingNote: "His concept of perfection is metaphysical symbolism, not a guarantee that an individual's work, relationship, or circumstances will reach completion."
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
