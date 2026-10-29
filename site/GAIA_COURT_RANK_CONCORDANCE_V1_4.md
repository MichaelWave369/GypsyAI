# GAIA v1.4 · Court Rank Concordance
## Historical label comparison, not imaginary equivalence

GAIA's v1.3 Concordance indexes all **22 Major Arcana** across Marseille,
Rider–Waite–Smith, Golden Dawn and Thoth. This release adds a separate
**16-court-card comparison** across the same traditions, while exposing
a genuine, longstanding disagreement about King/Knight alignments.

This is a structured lookup of *names, suits, source roles and elemental
grades*. It is not 16 independently verified divinatory readings, a new
deck, or a completed comparison of all 56 Minor Arcana.

## Why there must be two comparison choices

The historical *Book T* printed in *The Equinox* I:8 (1912) calls its
**mounted fiery rank "Knight"**, and its **charioted airy Prince "King"**.
Thoth uses **Knight / Queen / Prince / Princess**, with mounted Knight
and charioted Prince. Rider–Waite–Smith uses familiar **King / Queen /
Knight / Page** printed titles.

A **source-printed or picture/vehicle alignment** keeps the literal
1912 printed associations:

| GAIA / Waite–Smith | 1912 Book T printed rank | Thoth | Grade |
| --- | --- | --- | --- |
| Page | Knave / Princess | Princess | Earth of suit |
| Knight | Knight / mounted King | Knight | Fire of suit |
| Queen | Queen | Queen | Water of suit |
| King | King / charioted Prince | Prince | Air of suit |

A competing **rank-hierarchy** approach pairs the Waite King with
Thoth's upper Knight and the Waite Knight with Thoth's Prince. Then
King is Fire of suit, Knight Air of suit, with Page and Queen unchanged.
That is **an interpretive modern crosswalk**, not the literal printed
1912 Book T Knight/King source. Both approaches have historical or
pedagogical reasons; neither settles pictorial or interpretive
equivalence between commercial deck editions.

Crucially, changing this comparison does **not** rename a selected
GAIA card, change its orientation or mutate the stored Hermetic
field. The older Book T printed-role metadata remains as previously
audited in v1.0; the alternative is displayed as a transparent
comparison only.

## Historical sources, with their actual roles

- **Primary source**: *Book T / Liber LXXVIII*, published in
  *The Equinox* I:8 (1912), individual court descriptions and
  "Sixteen Court, or Royal Cards":
  https://hermeticcloud.com/library/liber-lxxviii/
- **Primary source**: A. E. Waite, *The Pictorial Key to the Tarot*
  (1911), the court-card names in the Rider–Waite–Smith system:
  https://sacred-texts.com/book/the-pictorial-key-to-the-tarot
- **Primary source**: Crowley, *The Book of Thoth* (1944),
  "The Court Cards" (Knight, Queen, Prince, Princess), presented
  as text only, without copying copyrighted Harris art:
  https://hermetic.com/crowley/book-of-thoth/court-cards
- **Modern secondary**: Marseille rank/suit labels
  (Roy, Reyne, Cavalier, Valet; Bâtons, Coupes, Épées, Deniers):
  https://www.learntarot.com/mxdesc.htm
- **Modern secondary**: nuanced debate about Waite/Book T/Thoth
  courts and the two rank comparison conventions:
  https://thefinalstar.com/library/courts/

The current *Book T* "King/Prince" naming and modern Waite King
identities are not automatically identical as iconography, and an
old tarot deck did not inherit the later Golden Dawn element schema
merely by using the same suit picture.

## Software changes

- New deterministic \`courtRankConcordance.ts\` with 16 actual
  GAIA court card IDs and two comparison alignments (32 view results,
  not 32 different cards).
- Source-indexed four-tradition labels. Thoth's **Disks** name is
  kept distinct from GAIA's **Pentacles** and Marseille **Deniers**.
- Canonical local deck card IDs are maintained and all expected
  Book T fields are checked before display; a mismatch fails closed.
- New original \`CourtRankPanel\` browser chamber, keyboard-accessible
  method, suit and rank controls, four-column comparison and typed
  research references.
- New main navigation and Reading Room doorway.
- No runtime network fetching, model calls, third-party art, remote
  storage, dependencies, user profile collection or alterations
  to deck meanings, secure draw or local-Ollama consent.
- The **40** remaining Minor Arcana (four Aces, thirty-six numbered
  pips) still lack a *complete four-tradition* structural concordance.
- Four historical Waite card-*meaning* reviews remain a separate
  research audit. Exact card-name comparisons cannot stand in for them.

## Verification

\`\`\`bash
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

Manual after successful merge/deployment:

1. Open \`#courts\`; confirm sixteen cards across four suits, and
   switch both alignment methods while watching GAIA card name stay fixed.
2. For Wands, literal method: **Knight → Thoth Knight / Fire of Fire**
   and **King → Thoth Prince / Air of Fire**. Hierarchy:
   **Knight → Thoth Prince / Air of Fire**, **King → Thoth
   Knight / Fire of Fire**.
3. Verify Queens and Pages are unchanged between the two methods.
4. Check **Pentacles → Marseille Deniers → Thoth Disks**.
5. Follow every source link. The secondary comparison should not
   masquerade as a first-hand text from the Golden Dawn.
6. Test mobile and keyboard controls. Selecting comparison cards
   must never draw a new card or send a request to Ollama.
7. The original major \`#concordance\` should still list all 22
   trumps, with no behavioral regression.

**People Above Profit · Ledger Above Ego.**
