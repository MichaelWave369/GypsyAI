# GAIA Field Loom v2 · Source-Labeled Evidence Lenses

## Why

GAIA v0.4.0 established a person-controlled tarot ritual: secure browser
shuffle, user-selected face-down cards, reveal, confirmation, private note,
and an informational SVG connection map. v0.5 turns the map into an interactive
**source-labeled evidence inspector** without pretending symbolic relationships
are measured physical energies or certain predictions.

## Interactive behavior

The Field Loom appears only after an actual completed, revealed, confirmed
one- or three-card Ritual Draw. The **same fixed chosen cards** are used in
every lens; changing a lens never redraws or changes their orientations.

- **Spread roles:** Displays existing canonical position definitions for
  Past, Present, Future or Focus.
- **Themes:** Compares only exact keywords recorded in the deck for the
  chosen upright or reversed orientation. No word-vector similarities or
  invented thematic relationships.
- **Elements:** Shows only explicitly recorded card Hermetic element labels.
  Missing values are disclosed. Existing Hermetic metadata has not been
  independently audited.
- **Arcana:** Shows stored Major or Minor Arcana classification and a clearly
  labeled open-ended reflection prompt.

Cards and adjacent links are selected with keyboard-accessible HTML buttons.
The SVG is explanatory only and is not an inaccessible mouse-only control.
Every observation is labeled with its source class: **confirmed draw**,
**spread definition**, **GAIA tarot deck**, or **editorial reflection prompt**.

The graph does not call a model or any external endpoint, save notes, transmit
ancestry data, change randomization, or introduce new packages. GAIA's earlier
user-approved local Ollama staging and explicit Send boundary are unchanged.

## Provenance and limitations

- Deck labels are editorial software records, not objective assertions about
  an individual's circumstances.
- Links represent actual adjacent spread positions. Similar terms and matching
  elements are exact textual comparisons, not inferred influence, physical
  resonance, causality or a promise about the future.
- Missing historical correspondences cannot be manufactured. A later
  independent Hermetic catalog audit should identify unverified fields before
  any larger cross-tradition map is claimed.
- A one-card draw shows one card, no manufactured two-card link.
- No third-party dependency or copied art from the MIT-inspiration study was
  introduced. See [the earlier source survey](GAIA_MIT_INSPIRATION_RITUAL_V0_4.md).

## Acceptance

Run standard checks: \`pnpm lint\`, \`pnpm test\`,
\`pnpm build\`, \`pnpm pages:build\`.

Test manually on the Pages \`#ritual\` route after deployment:

1. Shuffle, choose a three-card spread, reveal and confirm.
2. Toggle the four lenses without card positions or orientations changing.
3. Select every card and both adjacent threads with mouse and keyboard.
4. Check provenance labels, one-card focus, and missing-element handling.
5. Verify neither the view nor its toggles send anything to Ollama.
6. Verify the existing optional private journal and deliberate model handoff
   remain unchanged.
7. Test on narrow mobile viewports and with reduced motion enabled.

**People Above Profit · Ledger Above Ego.**
