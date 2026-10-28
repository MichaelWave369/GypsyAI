# GAIA v1.1 · Court Spheres Atlas · Historically Sourced

## Motivation

In v1.0, GAIA replaced twenty generic Ace/court titles with specific
historical Book T titles and ranks, but its source audit appropriately
withheld claims about court zodiac regions. The **primary historical text**
actually specifies a sign-crossing 30° band for each of the twelve mounted
Knights, Queens and charioted Kings/Princes. It assigns the **four
Princesses/Knaves** to celestial polar quadrants instead.

This update builds a human-inspectable mapping of **exactly the court spheres
documented by Book T** and links each span to the already verified numbered
pip decans. It does not create a birth-card predictor.

## Primary textual evidence

*Liber LXXVIII / Book T*, as published in *The Equinox* I:8 (1912),
especially **The Spheres of Influence of the Court Cards of the Tarot Pack**
and court descriptions V–XX:

https://hermeticcloud.com/library/liber-lxxviii/

Reviewed examples:

- **Knight of Wands**, 20° Scorpio → 20° Sagittarius; numbered pips
  7 Cups, 8 Wands, 9 Wands.
- **Queen of Wands**, 20° Pisces → 20° Aries; 10 Cups, 2 Wands,
  3 Wands.
- **King of Wands**, historical *charioted Prince*, 20° Cancer →
  20° Leo; 4 Cups, 5 Wands, 6 Wands.
- **Knight of Pentacles**, 20° Leo → 20° Virgo; 7 Wands,
  8 Pentacles, 9 Pentacles.
- **King of Pentacles**, historical *charioted Prince*,
  20° Aries → 20° Taurus; 4 Wands, 5 Pentacles, 6 Pentacles.
- **Page of Pentacles**, historical *Princess / Knave*: a celestial
  quadrant around the ecliptic's northern pole; **no exact
  30-degree zodiac range** supplied by the reviewed passage.

A historical 30° span uses the last decan of the first sign and
the first two decans of the next sign. Thus its first numbered pip
may belong to a **different suit** than the court card.

The Book T role conventions (mounted Knight/King, Queen,
charioted Prince/King and Princess/Knave) remain identified separately
from GAIA's actual drawn card names. The fact that the printed source
uses \`King of Wands\` as a charioted Prince **does not establish that
all modern decks have an identical pictorial court mapping**.

## Added functionality

- \`site/src/courtSpheres.ts\` contains a **deterministic historical
  reconstruction** of twelve individually documented sign-to-sign
  ranges, plus four explicit Princess quadrant cases.
- Exactly **36** numbered pips are associated with the twelve regions,
  with no repeats or omissions. Their identities come directly from
  the real v0.9 corrected deck, not newly invented astronomical facts.
- A court card's Symbolic Library record displays a **Court Spheres
  Atlas** with its historical role, exact written band, three linked
  real numbered cards (click to inspect them), or the properly
  bounded Princess quadrant description.
- No zodiac geometry, decans, or single-pip associations are
  fabricated for the four Princesses/Pages.
- The v1.0 audit now distinguishes **Book T court region source coverage**
  from the still-unresolved task of comparative cross-edition and
  Rider–Waite–Smith artwork concordance.

## Constraints

- This is a **Golden Dawn tradition-specific symbolic diagram**, not
  evidence of human personality, birth fate, electromagnetic influences
  or scientific causation.
- No input of birthdates or geolocation; no ancestry data access.
- The twelve spans are *historical statements*, not astronomical
  computations about the user's current sky.
- No third-party card images, copyrighted modern art, external
  source downloads, model calls, local-storage changes, package
  dependency or network access.
- GAIA's original unique upright/reversed editorial card meanings,
  random selection, Spread Atlas, Field Loom, and opt-in Scholar
  Mode are unchanged.
- A historical region is not a verified *interpretation*:
  the Symbolic Library's four reviewed Waite notes remain separately
  counted from these Book T correspondence records.

## Test plan

\`\`\`bash
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

Manual smoke checks after merge:
1. Open \`#library\`, then **Knight of Wands**. Confirm Scorpio
   20° → Sagittarius 20°, with 7 Cups, 8 Wands, 9 Wands.
2. Click **Eight of Wands** in the strip and check its real card record,
   including the already audited Mercury in Sagittarius decan.
3. Open **Queen of Wands**, **King of Pentacles** and **Knight
   of Pentacles**; check their historical ranges and cross-suit first pip.
4. Open every **Page**. Confirm all four explicitly lack a
   thirty-degree zodiac range.
5. Confirm prior 36 pip data and Golden Dawn titles still pass
   existing audit tests; card shuffle, journal privacy and local
   model consent are unchanged.
6. Test keyboard, small-screen responsive layout and offline
   Symbolic Library operation.

## Future research boundary

A next **Cross-Tradition Concordance** could compare the RWS, Marseille,
Golden Dawn and Thoth differences with named references, without
silently treating their court cards as identical or inventing a
scientifically measurable shared "resonance."

**People Above Profit · Ledger Above Ego.**
