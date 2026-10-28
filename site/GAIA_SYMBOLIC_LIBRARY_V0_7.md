# GAIA v0.7 · Symbolic Library · Sources Before Certainty

## Purpose

The original 78-card GAIA deck gained distinct upright and reversed editorial
interpretations in v0.3.1. The user-controlled Ritual Draw, interactive Field
Loom and Spread Atlas followed. This release adds a **read-only, offline
Symbolic Library** where readers can distinguish:

1. **GAIA editorial writing:** The original card-specific words already in
   \`src/lib/tarot/deck.json\`.
2. **Historical primary-source commentary:** A sourced paraphrase from a
   clearly identified chapter, and only after human source checking.
3. **Unreviewed historical annotations:** An explicit absence. No borrowed
   authority, automatic paraphrase or invented footnote.
4. **Inherited Hermetic fields:** Still present in the deck for backwards
   compatibility; visible but **not independently audited**.
5. **Institutional context:** Library or archival documentation about the
   provenance of historical decks or related works, never silently treated
   as evidence for an individual card's meaning.

This release does not assert that tarot predicts future events or describes
measurable influences on people.

## Evidence reviewed for this first release

**Four** reviewed card notes, directly associated with historical sections of
A. E. Waite, *The Pictorial Key to the Tarot*, originally published circa
1910–1911, from the public-domain text:

- **The Chariot**, imagery and symbolism, not an audited reversed
  interpretation:
  https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/vii-the-chariot
- **Death**, imagery and transformation symbolism, not a death prediction
  or audited reversed interpretation:
  https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xiii-death
- **Five of Wands**, Waite's illustration and upright/reversed divinatory
  vocabulary:
  https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-wands
- **Eight of Wands**, motion illustration and upright/reversed vocabulary:
  https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/eight-of-wands

**Context only**, not proof of meanings:

- Johns Hopkins University, archival record of a “Pam-A” Rider–Waite–Smith
  deck circa 1919:
  https://aspace.library.jhu.edu/repositories/3/archival_objects/330032
- Library of Congress, catalog record for Papus,
  *The Tarot of the Bohemians*, 1896 English edition:
  https://www.loc.gov/item/77355368/

All historical observations in the code are **original short paraphrases**,
not scraped website text or copyrighted contemporary deck-guide prose.
The book's public-domain status does not grant permission to reuse later
recolored/updated commercial deck artwork, edition typography or marks.
No external card scans, fonts, models, or dependencies are packaged here.

The fact that an historical writer *said* something establishes that it
belongs to that writer's framework. It does **not** independently validate
the empirical truth of divination, ancestry, astrology or occult physics.

## Implemented

- New **Symbolic Library** route and Reading Room doorway.
- All **78** local editorial card records available through a searchable
  catalog, filterable by Major Arcana (22), Minor Arcana (56) and four reviewed
  historical notes.
- Toggle upright and reversed editorial interpretations without changing
  or redrawing cards.
- Clearly annotated historical comparison for four cards with a permanent,
  card-specific link to the cited source section.
- The other **74** entries show an explicit *historical comparison pending*
  message. Future expansion must review the text before declaring completion.
- The original Hermetic fields can be viewed in a separate disclosure section
  labeled unverified, never conflated with the sourced material.
- Source desk explaining the difference between primary text and
  institutional context.
- Standalone Tarot Chamber's card results link directly into the matching
  Library record. Tarot's previously selected cards remain in the App state.
- No automatic Ollama call, network fetch, memory import, ancestry access,
  localStorage writing or profile data. External source links open only
  when the user explicitly clicks.
- No changes to draw randomness, existing mathematical calculations,
  legacy Next provider, consent boundaries or private ritual journal.

## Not yet done

- 74 remaining card-by-card historical reviews.
- A complete critical audit of inherited Hebrew-letter, Tree-of-Life
  path, decan, planet, constellation and Sephirothic correspondences.
- Comparison against additional independently sourced traditions
  (Marseille, Etteilla, Golden Dawn, etc.). Do not suggest agreement
  where historical systems differ.
- Evidence-linked automatic AI interpretations. This stage is
  **manual research UX**; a future opt-in packet may include reviewed
  source records, but must keep source quotes/paraphrases separated
  from the currently drawn card data and pass the consent gate.

## Acceptance

Run: \`pnpm lint\`, \`pnpm test\`, \`pnpm build\`, \`pnpm pages:build\`.

Manual browser checks:
- Open \`#library\`. Search “Chariot”, “recovery”, and “Eight”.
- Filters show 22 major, 56 minor, four reviewed, 78 total.
- Compare The Chariot's two editorial orientations. The historical
  commentary does not pretend to be a verified reversed meaning.
- Click Death, Five of Wands, Eight of Wands and check specific section URLs.
- Open any other card and confirm it says no historical note is reviewed.
- Expand recorded Hermetic fields and confirm the auditing warning.
- Navigate Tarot → Explore card sources → Library. No automatic
  call to local Ollama or any external provider.
- Check keyboard navigation, small screens and offline catalog browsing.

**People Above Profit · Ledger Above Ego.**
