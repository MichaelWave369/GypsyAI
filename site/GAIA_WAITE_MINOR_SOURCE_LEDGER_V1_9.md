# GAIA v1.9 · Historical Waite Minor Arcana Source Ledger III

## Source coverage and scope

GAIA v1.8 (PR #96) concluded with **40/78** historically source-reviewed card
interpretations: all 22 Major Arcana and 18 of the 56 Minor Arcana.
The independent four-tradition structural index already covers **78/78** cards.

This v1.9 tranche adds **12 newly checked chapters** from Arthur Edward
Waite's *The Pictorial Key to the Tarot* (1910–1911), **three numbered pip cards
per suit**. It proposes the following counts:

- **52/78** source-reviewed historical card interpretations.
- **22/22 Major** and **30/56 Minor** reviewed; **26/78 pending**.
- **23** source notes scoped to card symbolism or upright-only context.
- **29** source notes scoped to documented upright **and** reversed associations.
- **78/78 original editorial GAIA card meanings** unchanged.

This ledger records direct card-specific links to historical published writing.
Reading a source documents that author's view, **not** divination's empirical
validity, professional advice or universal agreement across tarot traditions.

## Twelve directly checked historical chapters

| Suit | Exact source section | Nuance that GAIA must preserve |
|---|---|---|
| Wands | [Six of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/six-of-wands) | Victory or consequential news; reversed anxiety, disloyalty and delay |
| Wands | [Seven of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/seven-of-wands) | High-ground courage, debate and trade rivalry; reversed confusion and indecision |
| Wands | [Ten of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ten-of-wands) | Oppressive success as well as burden and false appearance; reversed complications |
| Cups | [Six of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/six-of-cups) | Memories of the past contrasted with alternative new surroundings; reversed future renewal |
| Cups | [Seven of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/seven-of-cups) | Fleeting fantasy or visionary attainment; reversed intention and initiative |
| Cups | [Eight of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/eight-of-cups) | Withdrawal and declining importance versus opposed joyful traditions; reversed celebration |
| Swords | [Six of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/six-of-swords) | Water journey and messenger; reversed disclosure or one tradition's love proposal |
| Swords | [Seven of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/seven-of-swords) | Plans, confidence and quarrels in conflict; reversed counsel or slander |
| Swords | [Eight of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/eight-of-swords) | Temporary, not hopeless, restraint; reversed difficulty and unforeseen trouble |
| Pentacles | [Four of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/four-of-pentacles) | Keeping property, gifts or inheritance; reversed obstruction and delay |
| Pentacles | [Five of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/five-of-pentacles) | Poverty versus irreconcilable love/affinity meanings; reversed disorder |
| Pentacles | [Six of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/six-of-pentacles) | Charity and gifts versus attention/watching; reversed envy and greed |

These are original short paraphrases, not copied tarot card art or reproduced
chapters. Each section was opened and its individual card text and reversed
section consulted. The website's live interface remains external and is never
embedded or fetched by GAIA at runtime.

### Historical disagreements to keep visible

**Ten of Wands**: Waite explicitly calls his inherited meanings hard to
reconcile: oppression can be the weight of successful fortune itself, alongside
trickery. His conditional lawsuit illustration should **not** become legal advice.

**Six of Cups**: An upright memory-of-childhood tradition appears beside an
alternative account of new relations, new knowledge and a new environment.
The reversed list instead faces the future and renewal.

**Eight of Cups**: Although Waite prefers the decline/abandonment theme, he
records contradictory upright readings involving joy, mildness and honor;
reversed refers to happiness and celebration, not automatic grief.

**Seven of Swords**: Waite explicitly flags conflicting upright meanings
from attempts and confidence to quarreling or a failed plan. The reversed
list mixes counsel and instruction with slander; it is not simply a "thief" card.

**Eight of Swords**: Waite states the depicted bondage is temporary.
References to disease, accident or fate are period divinatory language,
not a clinical diagnosis or forecast of imminent danger.

**Five of Pentacles**: Waite states that the poverty and love/affinity
traditions are incompatible. GAIA must display both without pretending
to resolve them or predict personal poverty.

## Implementation, boundaries and consent

- Twelve `HistoricalAnnotation` records with exact URLs, canonical IDs,
  checked scope, source-specific meaning and limitations.
- These twelve specific Minor chapters each include a published reversed
  association, so use `divinatory-upright-reversed`; leave existing
  image-only and upright-only notes in their original scope.
- Symbolic Library and Ritual Draw coverage counters derive automatically
  from the reviewed registry. Research-panel count descriptions are updated.
- The original deck JSON, original upright/reversed editorial text, shuffling,
  spread positions/orientations, four-tradition indexes, art and private
  journal remain unchanged.
- Historical links open only when clicked; no new network calls, storage
  providers or runtime dependencies.
- Scholar Mode remains off until selected. Its data enters a bounded staging
  packet only after existing spread confirmation; the person must inspect
  that JSON and explicitly Send to their approved local Ollama endpoint.
  The existing **5,800-character ceiling fails closed** rather than dropping
  references or carrying a private journal.

## Regression and human acceptance

CI (run at repository root):

```sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
```

Automated tests assert 52 unique reviewed canonical IDs, all 12 exact new
source URLs, source kind, 23/29 scope split, 22/30 Major/Minor split, and
unaltered 78/78 original editorial meanings. They also check disagreement
caveats and an opt-in mixed three-card Scholar packet where **Six of Cups**
and **Five of Pentacles** receive source citations but **Four of Cups**
remains unreviewed.

Manual QA after merge:
1. Open `#library` and verify **52 reviewed / 26 pending**.
2. Follow every added section link and check the actual source wording;
   review especially Ten of Wands, Six of Cups, Eight of Cups,
   Seven of Swords and Five of Pentacles.
3. In `#ritual`, confirm a spread with Six of Cups, Five of Pentacles
   and Four of Cups; turn Scholar Mode on and inspect exactly two citations.
4. Turn Scholar Mode off and check the ordinary staged packet contains no
   history field. Do not send to a local model without explicit consent.
5. Check keyboard, mobile layout and five-card packet size failures
   in the deployed Pages experience.

**No automatic merge. People Above Profit · Ledger Above Ego.**
