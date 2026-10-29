# GAIA v1.2 · Cross-Tradition Concordance

## Purpose

An original, offline-first **comparison desk**, not a fifth deck or a new
fortune-telling system. The same historical trump can have a different number
or name across different tarot lineages. More importantly, one historical
lineage’s interpretation may not apply to another.

The first release deliberately reviews **eight structural examples** from
GAIA’s **22 Major Arcana**: Fool, Chariot, Strength, Justice, Death,
Temperance, Judgement and World. The remaining **14** major-card comparisons
are *not yet part of the verified concordance*. The 56 Minor Arcana remain
outside this structural comparison until separate historical work is done.

## The four source-labeled lenses

1. **Tarot de Marseille**: the historical Conver-pattern cartouche and
   printed number. Marseille is a family of historical decks, not a single
   copyrighted modern recreation and not an original Golden Dawn manual.
2. **Rider–Waite–Smith**: GAIA’s familiar local deck identity and Waite’s
   numbering/labels, associated with Pamela Colman Smith’s original art.
3. **Golden Dawn**: historical letter, zodiacal/elemental attribution and
   Tree-of-Life path from GAIA’s separately audited *Book T* index. This
   is an attribution layer, not an extra drawn card. The deck traditions
   and specific early printed trump numbering can differ.
4. **Thoth**: Crowley and Lady Frieda Harris’s known deck labels, based
   on their twentieth-century collaboration. This is presented as
   a *historical title and numbering comparison*, not as a reproduction
   of either the 1944 *Book of Thoth* prose or the copyrighted paintings.

## Eight checked examples

| GAIA / RWS card | Marseille pattern | Thoth label | A key difference |
| --- | --- | --- | --- |
| Fool (0) | Le Mat (unnumbered) | The Fool (0) | Numbering differs |
| Chariot (VII) | Le Chariot (VII) | The Chariot (VII) | Familiar titles/numbers, different traditions |
| Strength (VIII) | La Force (XI) | Lust (XI) | VIII↔XI change and Thoth renaming |
| Justice (XI) | La Justice (VIII) | Adjustment (VIII) | XI↔VIII change and Thoth renaming |
| Death (XIII) | Untitled XIII | Death (XIII) | Historic Marseille printing convention |
| Temperance (XIV) | Tempérance (XIIII) | Art (XIV) | Additive Roman numerals and Thoth renaming |
| Judgement (XX) | Le Jugement (XX) | The Aeon (XX) | Thoth renaming |
| World (XXI) | Le Monde (XXI) | The Universe (XXI) | Thoth renaming |

These are **card-name and number correspondences only**. They do not prove
each deck’s imagery, divinatory interpretation or theological position
are the same. These distinctions must remain in future research.

## References and source categories

**Historical primary text**

- A. E. Waite, *The Pictorial Key to the Tarot* (1911):
  https://original.sacred-texts.com/tarot/pkt/index.htm
- *Book T / Liber LXXVIII*, published in *The Equinox* I:8 (1912):
  https://hermeticcloud.com/library/liber-lxxviii/

**Institutional archival/exhibition evidence**

- Massachusetts Institute of Technology, *French Playing Cards:
  The Tarot Deck*:
  https://frenchplayingcards.mit.edu/tarot/tarot-deck
- The Grolier Club’s exhibition catalog record for Crowley’s
  *The Book of Thoth* (1944):
  https://grolierclub.omeka.net/items/show/2203

**Academic scholarship**

- Deja Whitehouse, *The Lady and the Beast*, chapter nine
  (Oxford University Press, 2024), a historical study of
  Crowley and Harris’s collaboration:
  https://academic.oup.com/book/58979/chapter-abstract/494473299

**Secondary card-title and edition-specific references**

- Historic Marseille Conver-pattern card titles and numerals,
  separated from its modern editorial commentary:
  https://marselia.app/blog/major-arcana-marseille-tarot
- Thoth deck’s specific title/number catalog:
  https://www.divinityatlas.com/tarot-decks/thoth

These source categories are intentionally kept distinct; a modern
reference that tabulates an edition is not presented as a 1760 original
engraving or as independent validation of divination.

## Implementation

- Original local data module \`crossTradition.ts\` provides eight
  card-specific, source-tagged, multi-tradition case studies.
- Original \`ConcordancePanel.tsx\` gives an interactive searchable
  four-column comparison with obvious divergence markers and
  per-tradition reference links.
- A typed Reference Desk lets visitors distinguish historical primary
  texts, institutional exhibits, peer-reviewed/academic historical
  studies and secondary sources. Links only navigate when clicked.
- The Concordance is a distinct top-level GitHub Pages route and
  Reading Room entrance. It can link straight back to the true GAIA
  Symbolic Library record for each card without redrawing it.
- No new model call, externally downloaded text, user upload, third-party
  art, source code, PDF, package, memory key, server or network fetch.
- The 78-card deck, its 4 Waite historical *interpretation* reviews,
  78-card original editorial meanings, 1912 Book T attribution audits,
  36 pip/court diagrams, Tarot/Ritual Draw, Spread Atlas, Field Loom,
  Scholar Mode opt-in and Ollama consent all remain unchanged.

## Future research

- Independently expand the **other fourteen trumps**, with source
  citation review before showing each new comparison.
- Create a **court-rank concordance** that accurately distinguishes
  Marseille’s familiar Kings/Queens/Knights/Valets from the Golden
  Dawn's Princes/Princesses and Crowley’s Thoth rank changes.
- Evaluate exact differences between Marseille Type I and Type II
  before using one version as a universal representative.
- Add **tradition-specific *historical interpretation*** only after
  independently reviewing actual source wording, noting when it
  conflicts with GAIA’s modern editorial meanings.
- Only then consider an *opt-in* source-packet integration into
  Scholar Mode. Never auto-inject unevaluated outside literature,
  or weaken the local-model approval gate.

## CI / manual acceptance

\`\`\`bash
pnpm lint
pnpm test
pnpm build
pnpm pages:build
\`\`\`

1. On \`#concordance\`, compare Strength, Justice, Death, Temperance
   and Judgement; verify numbering and names.
2. Confirm all eight examples link to real, existing local card records.
3. Verify no image from the Harris Thoth deck is bundled or streamed.
4. Click the typed source links; inspect the cited historical vs modern
   nature of each reference.
5. Search for an unreviewed Major card: it should **not** appear as if
   it had a validated four-tradition record.
6. Test narrow-screen layout, keyboard navigation and offline
   interactive browsing. No model request should be sent.

**People Above Profit · Ledger Above Ego.**
