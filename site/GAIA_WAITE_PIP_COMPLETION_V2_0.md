# GAIA v2.0 · Complete Ace and Numbered-Pip Historical Interpretation Review

## Why this milestone is distinct

After merged GAIA v1.9 (PR #97), the original 78-card GAIA deck and
four-tradition **structural** concordance cover all 78 cards, but source-reviewed
Waite historical **interpretation** annotations cover 52/78 (22 Major and
30 Minor). Exactly ten Aces/numbered pips remain; sixteen court interpretations
are an independent research gap.

This v2.0 milestone completes the ten remaining pip sections of Arthur
Edward Waite's public-domain *The Pictorial Key to the Tarot* (1910–1911).
**Source-reviewed interpretation coverage is now 62/78**:
- 22/22 Major Arcana historical symbolism/source reviews
- 40/40 Aces and numbered pips historical source reviews
- 0/16 court *interpretations* reviewed, explicitly pending
- Overall source scopes: 23 `card-symbolism` and 39
  `divinatory-upright-reversed` historical sections.

**Important:** The earlier GAIA court *structural crosswalk* (all 16 ranks,
suits and references) remains independently indexed and should never
be equated with published court *meaning* reviews.

## Ten individually checked original Waite sections

| Suit | Direct primary-source chapter | Documented nuance |
|---|---|---|
| Wands | [Nine of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/nine-of-wands) | Opposition, resolve and delay; reversed obstacles and adversity |
| Cups | [Four of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/four-of-cups) | Discontent and blended pleasure; reversed novelty, teaching and new relations |
| Cups | [Nine of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/nine-of-cups) | Satisfaction; reversed truth and loyalty mixed with mistakes and imperfection |
| Cups | [Ten of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ten-of-cups) | Family and social contentment; reversed indignation and hostility |
| Swords | [Four of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/four-of-swords) | Retreat and tomb symbolism; reversed careful administration, thrift and precaution |
| Swords | [Nine of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/nine-of-swords) | Grief and despair; reversed suspicion, doubt and fear; period medical terms |
| Swords | [Ten of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ten-of-swords) | Not specifically violent death; reversed temporary advantage or authority |
| Pentacles | [Eight of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/eight-of-pentacles) | Craftsmanship and work; reversed ambition thwarted or skill misused |
| Pentacles | [Nine of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/nine-of-pentacles) | Prudence and successful stewardship; reversed deceptive or failed undertakings |
| Pentacles | [Ten of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ten-of-pentacles) | Family wealth and archives; reversed loss and gambling, sometimes gifts or pension |

Each direct link identifies an original Waite chapter and each registry entry
holds a short original paraphrase of the source's image, upright divinatory
terms, reversed terms and scope limitations. No historical art or modern
reader-site copy is embedded. User navigation to a source requires a click.

## Why the fidelity checks matter

- **Four of Cups:** Waite's discontent illustration also includes mixed
  pleasure; its reversed reading explicitly includes novelty, teaching and
  new human relationships, not just a generic opposite of boredom.
- **Nine of Cups:** the reversed words include truth, liberty and loyalty,
  yet Waite warns other published readings supply mistakes/imperfections.
  Therefore "reversed = disappointment" is not a faithful simplification.
- **Four of Swords:** the tomb effigy is imagery, not a death forecast;
  the reversed list concerns prudence, careful management and economy.
- **Nine of Swords:** published terms include death and miscarriage,
  which must be labeled historical, never as medical diagnoses or forecasts.
- **Ten of Swords:** Waite explicitly specifies that the card is **not
  particularly a violent-death card**. Its favorable reversed terms are
  transient, not guaranteed prosperity or personal power.
- **Eight of Pentacles:** upright craft can be skillful and legitimate;
  reversed may also represent possession of skill redirected to clever
  manipulation. This is not a moral judgment about a real person.
- **Ten of Pentacles:** reversed mixes loss, chance and theft with an
  *alternative* list involving a gift, dowry or pension. It is not
  uniformly negative and is not financial advice.

Historical interpretation documents a particular writer's published
traditional associations; it does **not** scientifically validate tarot,
diagnose health, predict violence, confirm ancestry or certify financial outcomes.

## Implementation and privacy

- Exactly ten new `HistoricalAnnotation` entries, matching exact canonical
  pip IDs, each with the direct chapter URL and a documented reversed list.
- No change to GAIA's 78 original editorial upright/reversed meanings,
  RNG, card identity, spread orientation, historical structural concordance,
  art, stored private journal, origin permissions, dependencies, or model provider.
- Symbolic Library and Ritual Draw counters are registry-derived and now
  display **62 reviewed / 16 pending**; research-panel copy is updated.
- Default-off Historical Scholar Mode stages an optional source bundle only
  for actually selected cards after confirmation. The user must inspect
  the exact JSON and explicitly Send to approved local Ollama; there is no
  automatic server request. The existing 5,800-character stage limit
  fails closed instead of stripping citations.
- A court selected in a mixed spread remains explicitly **unreviewed** and
  cannot acquire a fabricated Waite interpretation citation.

## Required CI and human acceptance

```sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
```

Automated tests:
1. Exactly 62 unique reviewed canonical IDs, 62/16 coverage, 22 Major,
   40 Aces/pips and all sixteen court records explicitly unreviewed.
2. Ten exact primary text chapter URLs and honest `divinatory-upright-reversed`
   scope; prior 23 symbolism notes remain limited to their original scope.
3. Waite's violent-death exclusion on Ten of Swords, conflicted reversed
   Nine of Cups, and mixed reversed Ten of Pentacles must be retained.
4. Mixed Ten of Swords / Four of Cups / Page of Wands preview has exactly
   two source-linked cards, with Page of Wands explicitly pending.
5. Original-mode packets remain source-free. Staging enforces consent, exact
   card positions and size ceiling without removing references.

Manual QA after merge:
1. Open `#library`; confirm **62 reviewed, 16 pending**.
2. Inspect all ten links and particularly the Ten of Swords source caveat.
3. Use `#ritual` with newly reviewed cards and an unreviewed court. Confirm
   only actual reviewed cards show historical source notes.
4. Inspect staged JSON before explicit local Send, and test a mixed
   five-card spread that exceeds the ceiling to confirm fail-closed behavior.
5. Verify keyboard, phone and source-opening behavior on deployed GitHub Pages.

**No automatic merge. People Above Profit · Ledger Above Ego.**
