# GAIA v1.7 · Complete Waite Major Arcana Interpretation Source Ledger

## Scope and evidence

GAIA v1.6 (PR #94) maintained **78/78 structurally compared tarot identities** and
**16/78 independently reviewed historical interpretation notes** from A. E. Waite's
*The Pictorial Key to the Tarot* (1910–1911). The v1.7 addition reads the **twelve
previously unreviewed Major Arcana symbolism chapters**. It increases historical
interpretation-source coverage to **28/78**, comprising **22/22 Major Arcana** and
**6/56 Minor Arcana**, with **50 Minor Arcana still awaiting review**.

All twelve new notes are explicitly `card-symbolism` only. They summarize what
Waite says about the imagery and its symbolic interpretation. **None claims an
independently reviewed upright/reversed divinatory list** from these particular
chapters. The existing five annotations which did review both orientations remain
unchanged. The type counts are now **23 imagery/symbolism** and **5 explicit
upright/reversed historical lists**, including the six earlier Minor notes.

The work is **original concise paraphrase**, not copied copyrighted deck art,
scientific support for divination, a universal tarot consensus, or source validation
of GAIA's independent modern meanings. The historical source itself is a
public-domain book; the archive's present-day interface is not copied or embedded.

## Primary-text sections opened and reviewed

| GAIA Major | Waite section, directly opened | Distinction preserved |
|---|---|---|
| Emperor (IV) | [IV. The Emperor](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/iv-the-emperor) | Rams, globe, sceptre, executive and intellectual authority; not a generic marriage card |
| Hierophant (V) | [V. The Hierophant](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/v-the-hierophant) | Crossed keys and visible institutional religion rather than High Priestess-style hidden teaching |
| Lovers (VI) | [VI. The Lovers](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/vi-the-lovers) | Paradise imagery and human love; differs from an older marriage / vice-versus-virtue scene |
| Wheel (X) | [X. Wheel of Fortune](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/x-wheel-of-fortune) | Sphinx as equilibrium and cycle of life; Waite rejects simplistic chance and fatalism |
| Justice (XI) | [XI. Justice](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xi-justice) | Moral justice for deeds is distinct from divine spiritual election |
| Hanged Man (XII) | [XII. The Hanged Man](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xii-the-hanged-man) | Face is entranced, not suffering; living wood and suspended life, not an instruction to sacrifice |
| Temperance (XIV) | [XIV. Temperance](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xiv-temperance) | Land/water, poured essences and esoteric harmony, not a medical or immortality claim |
| Devil (XV) | [XV. The Devil](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xv-the-devil) | Material bondage; even the goat figure is described as bound |
| Tower (XVI) | [XVI. The Tower](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xvi-the-tower) | Ruin of false doctrine and misinterpretation, not simply a forecast of falling buildings |
| Moon (XVIII) | [XVIII. The Moon](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xviii-the-moon) | Reflected light, animal fears and path into the unknown, not a medical diagnosis |
| Judgement (XX) | [XX. The Last Judgement](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xx-the-last-judgement) | Inward summons and symbolic transformation, not an apocalypse prediction |
| World (XXI) | [XXI. The World](https://sacred-texts.com/book/the-pictorial-key-to-the-tarot/xxi-the-world) | Cosmic and spiritual completion; Waite rejects a simplistic identification with an initiated Magus |

Those links point to the **symbolism chapters**, not the book's separate
general divinatory keyword table. A future scholarly addition that covers
that separate table must label its own section and scope, rather than silently
promote these imagery notes to verified reversals.

## Updated behavior

- The full 78-card editorial deck is unchanged; 28 historical notes exist in a
  separate, source-linked registry.
- `#library` and the dynamic Ritual Draw counter now display 28 reviewed /
  50 unreviewed. Every Major has a Waite note; only six Minors do.
- Default-off **Scholar Mode** recognizes the twelve new Major IDs, shows links
  only on the actual selected cards, and identifies unreviewed Minors as such.
- The chosen cards, their positions and orientations remain the same. A scholar
  packet is staged only after existing confirmation, and localhost Ollama is
  contacted only after the user inspects and explicitly Sends that packet.
- The existing 5,800-character limit remains. Oversized source packets are
  refused rather than silently stripped of citations. Private journal data
  remains outside the model packet.
- No new runtime fetch, API, storage layer, dependency, art, shuffle or deck
  editorial change. Structural Golden Dawn / Marseille / Thoth coverage remains
  a **different research category**.

## Automated validation

```sh
pnpm lint
pnpm test
pnpm build
pnpm pages:build
```

Tests assert:

1. Exactly 28 distinct reviewed canonical IDs and the exact 12 new chapter URLs.
2. All 22 Major Arcana have a source annotation; only six Minors do.
3. The new twelve notes have symbolism-only scope. Five older entries continue
   to be the only `divinatory-upright-reversed` notes.
4. Sources attach only after opt-in staging; a sample Devil/Tower/4 Cups spread
   has two cited historical notes and one correctly unreviewed Minor.
5. Original GAIA card meanings, non-historical packets, and the consent
   character ceiling remain unaffected.

## Human acceptance after deployment

1. Open `#library` and inspect all twelve new notes and their *specific* links;
   check especially the Wheel, Hanged Man, Justice and Tower distinctions.
2. Open `#ritual`, confirm a spread with the Devil, the Tower and 4 of Cups.
   Turn Scholar Mode on; verify only the first two gain Waite references.
3. Toggle Scholar Mode off: the staged reading must have **no historical
   source field**. Inspect local Oracle's exact approved packet prior to Send.
4. Try a multi-Major five-card spread: if sources exceed the size bound, the
   interface must refuse staging, never truncate references.
5. Test keyboard selection, narrow phone layout, and the source links in
   deployed GitHub Pages; CI success alone does **not** certify browser UX.

**No automatic merge. People Above Profit · Ledger Above Ego.**
