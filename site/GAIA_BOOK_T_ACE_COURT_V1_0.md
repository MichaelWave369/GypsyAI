# GAIA v1.0 · Book T Ace + Court Source Ledger

## Why

v0.9 corrected the Golden Dawn **22 trump** and **36 numbered pip** attribution
tables. The remaining 20 Minor Arcana cards still carried placeholder
\`hermetic_title\` values: four generic “Root of the powers” Aces and 16
generic “Court of Fire/Water/Air/Earth” court cards. Courts also had the
unsupported decan and planetary placeholders “variable.”

The historical *Book T* source (published in *The Equinox* I:8, 1912)
explicitly lists **titles for all 20** and explains the different role
vocabulary and nested elemental grades of the 16 court cards.

## Exactly what changed

- Four Aces have their specific **Root of the Powers of Fire, Water, Air
  or Earth** Book T title. They retain their existing **Kether** association
  and have **no numbered pip decan or ruling planet**.
- The 16 courts have individually identifiable Book T titles, instead of
  repeating generic elemental names.
- Each court receives its **source's role terminology** and nested
  elemental grade: **Fire of [suit], Water of [suit], Air of [suit] or
  Earth of [suit]** for Knight, Queen, King and Page respectively,
  following the Book T court categories.
- The former meaningless “variable” decan/planetary-ruler placeholders
  are replaced by **not applicable**. Court cards cover broad zodiac
  regions or special polar quadrants in the source, not one numbered
  pip-card ten-degree decan.
- Existing GAIA card IDs, familiar Page/Knight/Queen/King names, rendered
  images, shuffle, card selection, upright/reversed editorial writing,
  Oracle consent, data storage and routes are unchanged.

## Critical historical naming distinction

The **1912 text's printed labels** do not map unambiguously to a modern
Rider–Waite–Smith deck's court *artwork*, or to every tradition's ranks.
The Book T headings call its **Knave a Princess** and its **King a charioted
Prince**; its **Knight corresponds to the mounted King/Yod** rank.

For safety, GAIA does **not** rename the actual drawn card. The selected
card continues to be \`King of Cups\` or \`Page of Swords\`, while the
historical Book T term appears separately as \`book_t_role\`. The historical
title and grade are attributed specifically to **Book T's published
label/role system**, not presented as proof of picture-by-picture
equivalence between deck editions.

## Primary source

*Book T*, *The Equinox*, volume I, number VIII, pp. 145–172. The source
mirror containing the actual **Titles of the Symbols**, **Of the Aces**,
**Four Court Roles**, and **Individual Court Descriptions**:

https://hermeticcloud.com/library/liber-lxxviii/

The edition metadata and other attribution fields remain documented in:

https://hermetic.com/crowley/equinox/i/viii/eqi08016

The public-domain historical text is **evidence of a published occult
tradition**, not empirical evidence for divination or any physical force.

## Audit coverage: keep two kinds of certainty separate

- **58 cards** already have checked trump or 2–10 pip correspondence
  triples (22 majors + 36 numbered pips).
- **20 additional Ace/court cards** now have source-indexed titles/roles.
  Ace Kether/root and 16 nested court elemental grades are documented.
- The **20 Ace/court cards remain pending full specialist review** of
  edition-specific art/symbolism, plus precise court zodiac regions
  and historical rank/person associations. Checking a title is not
  the same as finishing a complete independent card audit.
- The older Symbolic Library's **4 of 78 historically reviewed
  interpretation notes** stay a separate research program. Historical
  Book T title coverage does *not* automatically generate reading prose
  or Waite citations for the other 74 cards.
- Generic \`sephirah: "Court current"\` remains an inherited placeholder
  for the 16 courts and is **not source-verified** by this change.

The card-specific audit disclosure names every checked field and its
reference and lists the unreviewed follow-up tasks. Neither an LLM nor
a remote website updates these records on its own.

## Verification

CI:
\`\`\`bash
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

Manual post-deploy audit:
1. In GAIA Symbolic Library, open \`Ace of Wands\` and the other three
   Aces. Confirm they have distinct “Root” titles and Kether, with
   no invented single decan.
2. Open \`Page of Swords\`, \`Knight of Wands\`, \`Queen of Cups\`,
   \`King of Pentacles\`: check Book T source title, rank, nested
   grade, and clear note that court zodiac boundaries remain pending.
3. Check a standard 2–10 pip and a Major Arcana card to ensure
   v0.9's audited correspondences remain unchanged.
4. Confirm existing tarot drawing and Scholar Mode continue to work,
   with no extra API requests and no new consent behavior.
5. Review the linked source passages, including the difference between
   historically printed names and modern card names.

**People Above Profit · Ledger Above Ego.**
