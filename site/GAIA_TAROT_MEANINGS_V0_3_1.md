# GAIA · Tarot Meaning Quality Pass v0.3.1

The first GAIA human tarot test produced an overly mechanical reading:
five of Wands upright, nine of Pentacles reversed and ten of Swords reversed
were interpreted using the same generic suit-wide keywords. The model did not
invent those keywords. They came from `src/lib/tarot/deck.json`, in which the
78 cards previously shared only four generic keyword sets.

## Corrective work

- All 78 named cards now have individually authored upright and reversed
  keyword triples, plus an original concise meaning for each orientation.
- The drawing engine and draw randomness are unchanged, as are stored card IDs,
  spreads, Hermetic metadata and public JSON shapes.
- The grounded reader packet includes each card's *own selected-orientation
  meaning*, its name, position, keywords and existing Hermetic data.
- The Constellation Reading and standalone Tarot Chamber show card-specific
  meanings locally before a model is connected.
- The Pages local Oracle removes the legacy provider's mandatory headings and
  uses proposed tarot/synthesis prompts that discourage copied disclaimers,
  packet-field narration and identical interpretations for different cards.
  The legacy Next.js provider retains its section contract. Uncertainty remains explicit but brief.
- New tests check that all 78 cards have unique individual themes, verify the
  exact three cards from the field test, and ensure source data reaches the
  deterministic packet.

## Attribution and scope

Meanings are *new editorial interpretations* informed by widely used tarot
symbolism and the traditional upright/reversed distinction. They are not
scientific, supernatural or psychological evidence. Multiple tarot schools may
read any particular card differently; the language uses invitations rather
than predictions. No licensed deck guidebook prose has been reproduced.

**Important limitation:** Existing Hermetic attribution fields and their
partially placeholder metadata have *not* been revalidated in this PR. The
new texts must not be understood as verification of those correspondences.
This is a content-quality and model guidance pass, not a full expert audit of
Golden Dawn, Thoth, astrology or Gene Keys materials.

## Verification

Run:

```bash
pnpm test
pnpm pages:build
pnpm build
```

Manual smoke test: draw three cards, confirm they have distinct meanings on
the offline Tarot screen, click Prepare local GAIA interpretation, review the
approved facts and prompt, then press Send to an explicitly connected local
Ollama model. Do not claim an actual model quality win until a new answer has
been inspected in the browser.

People Above Profit · Ledger Above Ego.
