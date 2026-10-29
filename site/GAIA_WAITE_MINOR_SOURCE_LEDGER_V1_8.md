# GAIA v1.8 · Waite Minor Arcana Primary-Source Review II

## Why

PR #95 completed historical primary-text interpretation notes for **all 22 Major Arcana**,
with another six Minor notes, for **28/78** source-reviewed cards overall.
GAIA already has a separate **78/78 four-tradition structural index**.
This tranche source-reviews **12 previously unreviewed Waite Minor Arcana chapters**,
balanced across Wands, Cups, Swords and Pentacles, with links to actual card sections.

After v1.8:
- **40/78** historical interpretive records reviewed, **38/78** pending.
- **22/22 Major** and **18/56 Minor** covered.
- **23 imagery/symbolism-only notes**, **17 Waite card entries with explicit upright/reversed lists**.
- All **78/78 original modern GAIA meanings** remain independent and unchanged.

## Twelve exact Waite sections

| Suit | Primary-text section opened and read | Material nuance |
|---|---|---|
| Wands | [Two of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-wands) | Conflicting upright grandeur vs sorrow; reversed surprise and disturbance |
| Wands | [Three of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/three-of-wands) | Commerce and cooperation; reversed cessation of adversity |
| Wands | [Four of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/four-of-wands) | Domestic peace; reversed meaning remains favorable |
| Cups | [Ace of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-cups) | Christian Eucharistic imagery; upright fulfillment, reversed instability |
| Cups | [Three of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/three-of-cups) | Celebration and fulfillment; reversed completion and possible excess |
| Cups | [Five of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-cups) | Three spilled cups, two intact; loss with something remaining, family-linked reversals |
| Swords | [Ace of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-swords) | Conquest and extreme force; reversed contradictory destructive/childbirth variants |
| Swords | [Two of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-swords) | Qualified upright harmony; reversed deception and disloyalty |
| Swords | [Five of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-swords) | Defeat and dishonor; reversed retains them and adds funeral imagery |
| Pentacles | [Ace of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-pentacles) | Material comfort; reversed still admits riches with darker wealth consequences |
| Pentacles | [Two of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-pentacles) | Dancing and looped coins; varied messages and trouble, reversed forced gaiety/writing |
| Pentacles | [Three of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/three-of-pentacles) | Skilled trade versus status/renown; reversed mediocrity and weakness |

Primary text: Arthur Edward Waite, *The Pictorial Key to the Tarot* (1910–1911),
[collection landing page](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot). Direct links are
human-readable archive transcriptions, not a license to import modern card art.
All summaries are original paraphrases of the individual Waite card sections.

### Important source interpretation caveats

1. **Two of Wands:** Waite presents mutually incompatible upright meanings,
   grandeur against loss and sadness. GAIA preserves the disagreement.
2. **Four of Wands:** reversed **does not invert** the favorable meaning.
   Do not rewrite it as generic blocked joy.
3. **Ace of Swords:** reversed readings include disastrous consequences
   **and** an alternative tradition of conception/childbirth. This is a historical
   claim, not a reproductive prediction.
4. **Five of Cups:** Waite's mourning imagery still leaves two cups intact;
   he reports diverse upright associations including inheritance and bitter marriage.
5. **Two of Swords:** upright affection and concord carry Waite's explicit
   qualification that Swords are generally an adverse suit.
6. **Ace of Pentacles:** both orientations can signify riches; the reversed
   entry is not synonymous with poverty.
7. **Three of Pentacles:** Waite mixes occupational skill with class-based
   status, which is historically revealing but not a measure of human worth.

Historical documentation means *what a named writer published*, not empirical
validation of divination or a medical, legal, financial, reproductive or
relationship forecast. This review does not verify Marseille/Golden Dawn/Thoth
interpretive equivalence or collapse GAIA's independently authored modern meanings.

## Implementation and consent

- Add twelve source-linked `HistoricalAnnotation` registry entries, all with
  `divinatory-upright-reversed` scope **because all twelve sections actually
  list a reversed association**. No sources are assigned to still-unreviewed cards.
- The existing Symbolic Library, Ritual Draw counters, and source-typed Scholar
  Mode use the same registry, so they update automatically. Cross-tradition
  structural research remains a separate scope.
- The current canonical card identities, orientation, spread positions, shuffle
  and original editorial text are unchanged. Scholar Mode stays default-off.
- No runtime external text fetch or third-party art; all links open only on click.
  No additional packages or model providers.
- Source-enriched packets are staged only after existing confirmation. The
  private journal is not attached, the user inspects exact JSON before explicit
  local Ollama Send, and the **5,800-character** bound still fails closed.

## Validation and QA

```sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
```

Automated acceptance checks:
- The registry's forty IDs match the canonical 78-card deck with no duplicates.
- The twelve new source URLs are exact and tied to the right canonical IDs.
- All twelve new annotations have authentic upright/reversed section scope.
- The existing twenty-three imagery-only records remain imagery-only.
- Mixed Wands/Cups/other spreads only attach sourced notes for reviewed cards,
  preserve an unreviewed card as pending, and respect the original send boundary.

Manual post-merge checks:
1. Visit `#library`: confirm **40 reviewed / 38 pending**.
2. Open each of the twelve historical links and compare the archive text.
3. Specifically inspect Four of Wands reversed, Two of Wands upright
   contradictions and Ace of Swords reversed uncertainty.
4. Confirm a three-card `#ritual` spread with Four of Wands, Ace of Cups
   and Four of Cups; Scholar Mode should cite only the first two.
5. Inspect the exact staged packet, then decline or explicitly Send to the
   configured local model. Confirm normal mode never includes Scholar metadata.
6. Validate mobile and keyboard affordances on deployed GitHub Pages.

**Do not auto-merge. People Above Profit · Ledger Above Ego.**
