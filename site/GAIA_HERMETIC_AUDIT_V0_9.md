# GAIA v0.9 · Hermetic Correspondence Audit

## Why this audit was needed

The earlier GAIA tarot deck included automatically generated, broadly labeled
"Hermetic" fields which were not historically validated. Our direct comparison
with *Book T* (published in *The Equinox*, vol. I, no. 8, 1912) and a documented
Golden Dawn Tree-of-Life path table exposed actual incorrect values.

Before this patch:
- The **Four through Seven of the Major Arcana** (Emperor, Hierophant,
  Lovers, Chariot) had the wrong Tree-of-Life endpoints, even though their
  assigned letters and zodiac signs were already correct.
- **33 of 36** minor pip cards (2–10) had incorrect or blank
  zodiac-decan and/or planetary-ruler data. Only three of the initial 36
  combinations matched the verified Golden Dawn mapping. For example, the
  Two of Wands had been falsely labeled Mercury in Sagittarius instead of
  Mars in Aries; the Eight of Wands had no specific decan at all.
- All **36** numbered pips used generic titles ("Chokmah of Fire",
  "Hod of Fire", and so on) in the \`hermetic_title\` field instead of
  the corresponding documented *Book T* titles.

## Precisely corrected fields

This update modifies the **existing bundled deck JSON**, rather than silently
laying a newly corrected table over wrong records. It keeps card IDs, card
names, orientation-specific original editorial meanings, random selection and
all spread logic intact.

- **36 minor pips (2–10)**: historically correct ten-degree zodiac-decans,
  Chaldean planetary rulers and “Lord of...” Book T titles. Decimal degree
  labels \`0–9°\`, \`10–19°\` and \`20–29°\` designate the 10-degree bands
  by whole-degree convention; the upper boundary is respectively
  10°, 20° and 30° in continuous coordinates.
- **22 Major Arcana**: checked each Hebrew-letter attribution, elemental or
  astrological attribution and connecting path against the traditional
  Golden Dawn table. Four endpoints were actually changed:
  Emperor **2→6**, Hierophant **2→4**, Lovers **3→6**,
  Chariot **3→5**.
- The new \`hermeticAudit.ts\` independently computes all 36 minor decans
  using zodiac signs by element and the Chaldean seven-planet sequence,
  and verifies all 22 major path/letter/trump triples. A mismatch throws an
  error rather than silently treating false correspondence as a source fact.

## References and historical limitations

**Primary publication:**
[A Description of the Cards of the Tarot (Golden Dawn Book T),
*The Equinox*, vol. I, no. 8, 1912, pp. 143–210]
(https://hermetic.com/crowley/equinox/i/viii/eqi08016).

**Tree-path reconstruction:** [Golden Dawn 22-path tabulation and its
historical framing](https://lunarcana.app/en/guide/qabalah). The path endpoints
are from the Golden Dawn/Kircher Hermetic Tree, **not** from the Jewish
\`Sefer Yetzirah\` alone. Book T documents the trump letters and attributions,
while the comparative reconstruction helps resolve path endpoints.

**Independent explanatory cross-check:** [36 decans, rulers and documented
titles](https://tarot.ac/astrology/egyptian/tarot). It reproduces the
traditional scheme. It is secondary analysis, not a replacement for Book T.

**Important distinction:** the Golden Dawn mapped tarot to Qabalah as an
esoteric *19th-century synthesis*. It is not historically appropriate to
claim these are universal, ancient Egyptian, or automatically authoritative
correspondences. Traditions differ and some editions swap card numbers for
Strength and Justice. GAIA retains Rider–Waite–Smith numbering (VIII Strength,
XI Justice) and keeps their corresponding letters and paths.

**Not fully audited:**
- All **16 courts**: their zodiac spans, rank mappings and elemental
  sub-attributions require separate edition-aware historical study.
- All **four Aces**: their special Kether/element assignments appear in Book T,
  but a full data-model check of the Ace metadata has not been completed
  here. They should not be presented as 36 numbered decans.
- **22 generic major \`magical_title\` and \`sephirothic_context\` fields**:
  still inherited placeholders, NOT Book T's published poetic titles.
  The checked Major fields are Hebrew letter, attribution and path only.
- Broader use in readings: historical alignment does not establish that
  tarot predicts events or that the planets exert the claimed effects.
  Source provenance explains a system's internal conventions, not
  empirical causality.

## UX and transparent coverage

The Symbolic Library now contains a per-card **Hermetic correspondence audit**
disclosure. It identifies which individual fields match the checked Golden
Dawn tables, links the sources and lists the unreviewed remainder.
**58 card records** have at least one checked class of correspondences
(22 Majors + 36 numbered pips); **20** court/Ace records still have
specialist-review status. Even within the 58 checked records, other
fields may remain unreviewed.

This 58/20 mapping coverage is **separate** from GAIA v0.7's historical
*interpretive text* coverage of **4/74**. A verifiable planet assignment
does not mean its upright or reversed meanings have been historically
reviewed in the Symbolic Library.

No third-party images, books, source code, account telemetry, model
weights, remote source loading or new dependencies were added.
Everything in the audit display is stored locally with the application;
following external source links requires an intentional click.

## Verification

\`\`\`sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

After deploy:
1. In \`#library\`, inspect The Emperor, Hierophant, Lovers, Chariot.
   Check the corrected paths.
2. Inspect the Two, Five and Eight of Wands, Ten of Swords and
   Nine of Pentacles. Compare printed decan, ruler, historical title.
3. Inspect a court and an Ace. Confirm the UI labels specialist review
   pending instead of fabricating a 10-degree zodiac decan.
4. Confirm changing the Hermetic source metadata did not change card
   shuffle, upright/reversed meanings, Spread Atlas layouts or the
   explicit local Oracle consent boundary.
5. Open the audit references and check that original/secondary citations
   are clearly distinguished.

**People Above Profit · Ledger Above Ego.**
