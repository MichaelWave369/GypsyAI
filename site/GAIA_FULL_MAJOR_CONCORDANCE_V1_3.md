# GAIA v1.3 · All 22 Major Arcana structural concordance

## Scope: complete titles, incomplete interpretation scholarship

This update extends GAIA's original v1.2 eight-card **structural**
Concordance to **all 22 Major Arcana** across four distinct views:
Marseille, Rider–Waite–Smith, Golden Dawn and Crowley/Harris Thoth.

**“22 of 22” means only that the historical card titles and ordinals
are indexed, with an independently existing Golden Dawn field audit.**
It does **NOT** mean each card's original divinatory interpretation,
symbolic imagery, modern editorial meaning, or multiple editions has
undergone independent source review. The separately reviewed Waite
interpretation notes remain **four cards**, unchanged.

The 56 Minor Arcana still lack an analogous four-tradition title/rank
concordance. Court Spheres / Book T audits are their own research stream.

## Historical observations preserved

- **Le Mat** has no originally engraved trump number in the Conver
  model; the surviving BnF exemplar may include a later handwritten
  XXII. GAIA's Rider–Waite–Smith Fool uses **0**.
- **Le Pape / La Papesse**, **Le Bateleur** and **L'Amoureux**
  retain historically distinct French labels and the Lovers singular
  rather than being falsely passed off as identical to the modern titles.
- **The Emperor**, **Hermit**, **Temperance**, and **Sun** in the
  Conver tradition use additive numerals **IIII, VIIII, XIIII, XVIIII**.
  These represent engraved conventions, not an alternative calculation.
- Marseille **Justice VIII** and **La Force XI** differ in sequence from
  RWS **Strength VIII** and **Justice XI**.
- Marseille trump **XIII** has a number but no printed name in the
  selected Conver pattern. It is not a literal death prediction.
- **The Tower** is represented by **La Maison Dieu** in this
  Marseille pattern.
- Thoth uses **The Magus, The Priestess, Fortune, Lust XI,
  Adjustment VIII, Art, The Aeon and The Universe**.
- Under Thoth's distinct system, **The Emperor is assigned Tzaddi and
  The Star is assigned Heh**. The separately audited Golden Dawn
  column retains **Emperor Heh and Star Tzaddi**. Their shared
  English names and zodiacal signs do not erase this difference.
- Cross-tradition comparisons of the same numbered or named card
  are editorial crosswalks, not proof of identical historical artwork,
  hidden influences, or empirically verified divination.

## Source ledger and exact provenance caveats

**Public institutional catalogue (existence, attribution and dating
of preserved Conver-pattern material):**

- Bibliothèque nationale de France, catalogue:
  https://catalogue.bnf.fr/ark:/12148/cb43706229t
- BnF authority record for Nicolas Conver:
  https://catalogue.bnf.fr/ark:/12148/cb16721159s

The BnF catalog describes a Conver-pattern card collection carrying
an **engraved 1760 model date**, while the surviving copy belongs
to the **early nineteenth century, c. 1809–1833**. The model date
and the surviving exemplar date must not be collapsed into one.

**Card-by-card Conver cartouches, transcribed from a modern
secondary comparison of the BnF example:**

- https://marselia.app/blog/major-arcana-marseille-tarot

GAIA shows an extra **printed-cartouche transcription** field
for every Major card, including spellings like \`LAMOVREVX\` and
\`LA·MAISON·DIEV\`. These are **secondary transcriptions** and have
not all been independently checked against every individual BnF
plate by the GAIA team. The BnF link documents the physical
collection, not automatically the exact accuracy of a modern
transcription. There is no remote fetching or scraping in the app.

**Thoth deck titles, numbering and the Emperor/Star exception:**

- https://marselia.app/tarot-decks/thoth
- https://www.divinityatlas.com/tarot-decks/thoth
- https://academic.oup.com/book/58979/chapter-abstract/494473299

These are a full modern deck index, another secondary title
catalogue, and scholarly historical context respectively. None
should be cited as the original painted deck or Crowley's complete
1944 *Book of Thoth*. Harris's modern commercial card artwork is
**not bundled, downloaded or embedded**.

**RWS and Golden Dawn historical texts**, unchanged from v1.2:

- A. E. Waite, *The Pictorial Key to the Tarot*:
  https://original.sacred-texts.com/tarot/pkt/index.htm
- Golden Dawn *Book T*, published in *The Equinox* I:8:
  https://hermeticcloud.com/library/liber-lxxviii/

## What changes in the app

- \`site/src/crossTradition.ts\`: 14 additional individually described
  comparisons, all **22 indexed**; all entries sorted by GAIA's
  actual card IDs.
- **Conver cartouche** field present on every Marseille-facing
  card, explicitly labeled as a modern transcription.
- \`ConcordancePanel\` now searches **22 of 22 Major Arcana**,
  with a scrollable responsive picker and four typed source perspectives.
- **No new model calls, storage, network fetches, dependencies, art
  assets, user inputs or source text downloads.**
- Existing tarot meanings, secure shuffle, manually chosen spreads,
  source-labeled Field Loom, Symbolic Library and local Ollama
  approval boundaries are untouched.

## Tests and acceptance

CI: \`pnpm lint\`, \`pnpm test\`, \`pnpm build\`,
\`pnpm pages:build\`.

After successful merge/deploy, open \`#concordance\`:

1. Search Magician, High Priestess, Emperor, Hermit, Wheel, Tower,
   Star, Moon, Sun and the original eight cases.
2. Confirm all 22 compare in ascending canonical order.
3. Check Conver's additive numerals (IIII, VIIII, XIIII, XVIIII)
   and the untitled XIII without inventing a Death cartouche.
4. Check Emperor Thoth note says **Tzaddi** while Golden Dawn
   says **Heh**; for Star, the reverse.
5. Inspect typed source links. Ensure a modern cartouche
   transcription is not labeled an original BnF first-hand
   photographic inspection.
6. Confirm no Minor Arcana falsely appears as four-tradition
   complete and the Waite interpretation coverage remains 4/78.
7. Keyboard, small-screen, offline browsing; no background
   network traffic beyond user-clicked external references.

**People Above Profit · Ledger Above Ego.**
