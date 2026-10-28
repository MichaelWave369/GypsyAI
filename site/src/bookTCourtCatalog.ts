/**
 * Source-indexed Book T court and Ace metadata for GAIA's four suits.
 * Source: Book T (The Equinox I:8, 1912), headings I–XX.
 *
 * These are PUBLICATION label mappings, not statements that the pictured
 * Rider–Waite–Smith court card is iconographically identical to Book T.
 * A "King" in Book T's printed deck labels is the charioted Prince, and
 * a "Knave" corresponds here to GAIA's Page; a mounted Knight maps to
 * the printed mounted King/Yod role. Court zodiac regions remain unaudited.
 */
import type { TarotCard } from '@/types';

type Suit = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
type Court = 'Page' | 'Knight' | 'Queen' | 'King';
type Role = 'ace' | Court;
type SourceFields = {
  hermetic_title: string;
  book_t_role: string;
  book_t_elemental_grade?: string;
  decan: string;
  planet_ruler: string;
};

const sourceTitles: Record<Suit, Record<Role, string>> = {
  Wands: {
    ace: 'Root of the Powers of Fire',
    Page: 'Princess of the Shining Flame; Rose of the Palace of Fire',
    Knight: 'Lord of the Flame and the Lightning',
    Queen: 'Queen of the Thrones of Flame',
    King: 'Prince of the Chariot of Fire'
  },
  Cups: {
    ace: 'Root of the Powers of Water',
    Page: 'Princess of the Waters; Lotus of the Palace of the Floods',
    Knight: 'Lord of the Waves and the Waters',
    Queen: 'Queen of the Thrones of the Waters',
    King: 'Prince of the Chariot of the Waters'
  },
  Swords: {
    ace: 'Root of the Powers of Air',
    Page: 'Princess of the Rushing Winds; Lotus of the Palace of Air',
    Knight: 'Lord of the Winds and the Breezes',
    Queen: 'Queen of the Thrones of Air',
    King: 'Prince of the Chariot of the Winds'
  },
  Pentacles: {
    ace: 'Root of the Powers of Earth',
    Page: 'Princess of the Echoing Hills; Rose of the Palace of Earth',
    Knight: 'Lord of the Wide and Fertile Land',
    Queen: 'Queen of the Thrones of Earth',
    King: 'Prince of the Chariot of Earth'
  }
};

const suitElement: Record<Suit,string> = {
  Wands: 'Fire', Cups: 'Water', Swords: 'Air', Pentacles: 'Earth'
};
const courtRole: Record<Court,{book_t_role:string;sub_element:string}> = {
  Page: {book_t_role:'Knave / Princess',sub_element:'Earth'},
  Knight: {book_t_role:'Knight / mounted King',sub_element:'Fire'},
  Queen: {book_t_role:'Queen',sub_element:'Water'},
  King: {book_t_role:'King / charioted Prince',sub_element:'Air'}
};
function validSuit(input:string|null):Suit{
  if(!input||!(input in sourceTitles))throw new Error('Invalid Book T suit');
  return input as Suit;
}
export function expectedBookTAceCourt(card:TarotCard):SourceFields{
  if(card.arcana!=='minor')throw new Error('Book T Ace/court record requires minor arcana');
  const suit=validSuit(card.suit);
  if(card.number===1 && card.court===null){
    return {hermetic_title:sourceTitles[suit].ace,book_t_role:'Ace / elemental root',
      decan:'none',planet_ruler:'n/a'};
  }
  if(card.number!==null||!card.court||!(card.court in courtRole)){
    throw new Error('Expected exactly an Ace or a recognized court card');
  }
  const role=card.court as Court;
  return {
    hermetic_title:sourceTitles[suit][role],
    book_t_role:courtRole[role].book_t_role,
    book_t_elemental_grade:courtRole[role].sub_element+' of '+suitElement[suit],
    decan:'not applicable (court spans multiple degrees)',
    planet_ruler:'not applicable (court role)'
  };
}
