# GAIA v1.6 · Historical Interpretation Ledger Expansion

## Why this change is different from structural indexing

GAIA v1.5 now structurally indexes the identities of all 78 cards across
Marseille, Rider–Waite–Smith, Golden Dawn and Thoth. That is **not**
the same as reading, comparing and attributing actual historical prose.

This v1.6 expands the existing **Waite primary-text interpretive review
from 4 to 16 cards**. Each card is linked directly to its corresponding
section of A. E. Waite's public-domain *The Pictorial Key to the Tarot*
(first published 1910–1911), hosted by the Internet Sacred Text Archive.

Each new note is an **original short paraphrase** of the corresponding
historical source, not a quotation and not a claim of supernatural
effectiveness. Original GAIA modern editorial upright/reversed card
meanings remain fully intact and separately attributed.

## Twelve sections checked and added

| Canonical card | Historical primary-text section | Checked scope |
|---|---|---|
| Fool | [Zero. The Fool](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/zero-the-fool) | Imagery and spiritual traveler |
| Magician | [I. The Magician](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/i-the-magician) | Image and spiritual symbolism |
| High Priestess | [II. The High Priestess](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ii-the-high-priestess) | Tora, pillars and reflected light |
| Empress | [III. The Empress](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/iii-the-empress) | Earthly fertility symbolism, not pregnancy prediction |
| Strength | [VIII. Strength, or Fortitude](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/viii-strength-or-fortitude) | Spiritual strength and Waite's VIII/XI numbering choice |
| Hermit | [IX. The Hermit](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ix-the-hermit) | Star-lit lantern as beacon, NOT praise of occult isolation |
| Star | [XVII. The Star](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xvii-the-star) | Waters of life and unveiled truth; “hope” alone is incomplete |
| Sun | [XIX. The Sun](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xix-the-sun) | Child/horse imagery and spiritual consciousness |
| Ace of Wands | [Ace of Wands](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/ace-of-wands) | Published upright **and reversed** meanings |
| Two of Cups | [Two of Cups](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/two-of-cups) | Image and upright associations; **no separate reversed list in this section** |
| Three of Swords | [Three of Swords](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/three-of-swords) | Published upright **and reversed** meanings |
| Seven of Pentacles | [Seven of Pentacles](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/seven-of-pentacles) | Explicitly contradictory upright variants, and a reversed concern about money lending |

The initial four verified entries still exist, unchanged:
**Chariot, Death, Five of Wands and Eight of Wands**.

Counts after update:
- Original modern GAIA editorial interpretations: **78 of 78**.
- Historically reviewed interpretive notes: **16 of 78**.
- Historical interpretive notes not yet checked: **62 of 78**.
- Eight new Major plus four new Minor notes. Total historical notes:
  eleven imagery/symbolism entries (including Two of Cups' upright associations
  but no separate reversed reading), five with explicit upright/reversed source lists.

### Why the source's uncertainty matters

Waite's Star chapter says that merely calling it “hope” misses his
larger esoteric symbolism. He expressly rejects the equation of his
Hermit with secretive occult isolation. And for Seven of Pentacles,
**Waite himself records contradictions** among divinatory traditions.
GAIA keeps these disagreements visible rather than laundering the
historical text into a single modern keyword or fixed prediction.

“Reviewed” means the paraphrase is traceable to a specific page from
a published primary source. It does **not** establish divination as
empirical science, verify unrelated Golden Dawn decans, authenticate
Tarot de Marseille imagery, or turn Waite's original reading into
medical, financial or fertility advice.

## Scholar Mode integration and privacy

The v0.8 Scholar Mode source lookup already reads its data from the
Symbolic Library's same audited registry. This release increases that
lookup corpus without introducing new remote access:

- Scholar Mode stays **OFF by default**.
- Confirmed 1–5 card spreads gain a historical source annotation
  only when the actual selected card has one of the 16 checked notes.
  Other selected cards remain explicitly unreviewed.
- The person's original deck/card positions and orientation are
  checked before adding source text. Private journal fields remain
  outside the packet.
- The model is invoked **only on the user's existing approval and
  explicit Send** to the local Ollama endpoint. Links to historical
  pages are only opened when clicked. No automatic web lookup.
- A 5,800-character staging limit remains enforced. If a larger
  set of selected source notes cannot fit, Scholar Mode displays a
  rejection rather than trimming citations or sending invalid JSON.
- The Oracle still shows the *exact approved JSON* for inspection
  prior to Send. Original editorial interpretations, local draw
  randomization, historical concordances, and privacy boundaries
  have not changed.

## Validation

CI:
\`\`\`bash
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

After a successful merge and Pages deployment:

1. Visit \`#library\`; the historical coverage display should say
   **16 reviewed / 62 awaiting historical comparison**.
2. Open Fool, Magician, High Priestess, Empress, Strength, Hermit,
   Star, Sun, Ace of Wands, Two of Cups, Three of Swords,
   Seven of Pentacles. Click each direct section link and
   compare the original primary text.
3. Verify **Strength** and **Hermit** historical notes preserve
   Waite's actual theological and esoteric distinctions.
4. Verify the Two of Cups has **no independently reviewed reversed
   definition**, while Ace of Wands and Three of Swords distinguish
   upright and reversed source content.
5. Verify Seven of Pentacles describes the **source's contradictory
   interpretations** rather than presenting one confident answer.
6. Open an unreviewed card such as the Devil; it must still say
   the historical interpretation has not been checked.
7. Confirm Ritual Draw displays the new count and that opt-in
   Scholar Mode previews citations **only** for source-reviewed
   cards, even alongside unreviewed cards in the same spread.
8. Inspect the staged local Oracle packet. No source note,
   journal detail, or other user input should transfer before
   explicit Send.

**People Above Profit · Ledger Above Ego.**
