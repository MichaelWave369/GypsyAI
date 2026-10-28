# GAIA v0.6 · Spread Atlas: Own Your Ritual

This version turns the previously proposed Spread Atlas into an original,
working browser-only layout editor *and* a manual Ritual Draw integration.

## What ships

- A new **Spread Atlas** chamber, accessible from main navigation and Reading Room.
- Three original starter designs: **Crossroads** (5), **369 Reflection** (3)
  and **Two Perspectives** (2).
- Create one to five named position/meaning slots with normalized coordinates.
- Drag card slots on an SVG board or adjust each position through labeled numeric
  inputs; both paths share the same validation.
- Add and remove slots without arbitrary code, imported HTML or dependencies.
- Strict, versioned JSON import/export, with finite coordinate boundaries,
  uniqueness, no overlaps, bounded text and bounded file size. Nothing is
  uploaded or saved automatically.
- **Use this layout in Ritual Draw:** keeps the person's custom layout in
  transient app state, then uses the existing crypto shuffle, cut, manual
  face-down selection, reveal and confirmation behavior. Positions follow
  the user's numbered slots rather than any unsupported legacy spread key.
- Source-grounded **custom tarot packet** with real card identities,
  orientations, original GAIA meanings and each position's *user-authored*
  meaning. Canonical card details are re-read from the bundled 78-card deck.
  It is bounded to 5,800 JSON characters before reaching the existing
  opt-in local Oracle staging, which itself imposes a 6,000-character limit.
- Four existing Field Loom lenses now support custom 1–5-card layouts. The
  role text is explicitly labeled **user-authored**, not verified tradition.
- Optional private journal notes stay in memory in the Ritual Draw chamber,
  never silently enter the reading packet. Explicit JSON export remains.

## Constraints, compatibility and provenance

- Older one- and three-card Ritual Draw modes are preserved. The original
  standalone Tarot, astrology, Gene Keys and ancestry modules are unchanged.
- JSON is strict data: title, numbered position IDs, names, role descriptions
  and x/y coordinates. No executable properties or endpoints.
- All model calls still require user-approved staging and a separate explicit
  **Send** to localhost Ollama. No cloud provider, account, telemetry, storage
  key or dependency was added.
- User-authored position meanings are **personal prompts**, not validated
  Golden Dawn correspondences or physical measurements.
- Layout coordinates determine only presentation, not statistical shuffle or
  card-selection probabilities. Nearby positions are forbidden to keep
  labels and controls from overlapping.
- This implementation was independently authored. The source inspirations
  and their MIT license verification remain documented in
  [GAIA MIT inspiration study](GAIA_MIT_INSPIRATION_RITUAL_V0_4.md).
  We did not copy third-party code, deck scans, fonts or model weights.

## Acceptance

GitHub CI runs lint, tests and both legacy + GitHub Pages builds.

On the deployed #atlas route, manually test:

1. Load all three starter layouts, rename a position and role, and drag one
   without overlapping. Confirm numeric accessibility alternatives.
2. Export JSON, re-import the exact saved layout, and reject malformed JSON,
   extra fields, duplicate names, overlapping coordinates and more than five
   positions. No data should be transmitted.
3. Use a valid two-, three- and five-card layout in Ritual Draw. Shuffle,
   cut, select, reveal and confirm the exact count of cards.
4. Toggle Field Loom's four lenses. Verify all positions and source labels
   correspond exactly to the custom layout and selected cards.
5. Prepare a local interpretation. Verify the reviewed Oracle packet includes
   the correct user-defined roles and real cards but **not** the private note.
6. Test on a narrow mobile screen, pointer-based drag, keyboard numeric
   controls and reduced-motion preferences.

**People Above Profit · Ledger Above Ego.**
