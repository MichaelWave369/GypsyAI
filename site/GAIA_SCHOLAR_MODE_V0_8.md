# GAIA v0.8 · Historical Scholar Mode

## Goal

The v0.7 Symbolic Library has a source-aware 78-card catalog, but only four
historical notes have actually been reviewed against identifiable chapters of
A. E. Waite's *The Pictorial Key to the Tarot*. In v0.8, a user can **explicitly
choose** to include those checked notes in a single local Ollama tarot reading.

GAIA's creative, original editorial interpretations stay the default. Scholar
Mode is an optional *historical comparison*, not a replacement reader or a
claim to demonstrate supernatural divination.

## User flow

1. Open Ritual Draw (standard one/three-card mode, or use a one-to-five-card
   custom layout from Spread Atlas).
2. Use the existing secure shuffle, cut, select, reveal and confirm workflow.
3. The completed spread now shows a **Historical Scholar Mode** switch,
   default **OFF**. If ON, each of the genuinely selected cards shows:
   a reviewed historical note and link if one exists, or a clear status
   that historical comparison has not yet been reviewed.
4. The person presses **Prepare sourced Scholar reading** and approves the
   existing GAIA Oracle packet staging, then separately presses **Send** to
   local Ollama. No source is fetched from the Internet and no model is
   contacted merely by viewing a note or turning on Scholar Mode.
5. The Oracle's **Inspect exact approved context** disclosure now shows the
   full JSON string that passed GAIA's existing consent gate. You can check
   each chosen card, annotation, absent source, and any other context locally
   before pressing Send or removing the attachment.
6. The model's editable prompt tells it to distinguish editorial content from
   the named historical author's work, cite only the included reviewed notes,
   and avoid supplying non-existent references. The final interpretation is
   still a model output: users can open the cited chapter and check it.

If Scholar Mode is OFF, the original reading packet and suggested prompt stay
the same as before. Switching modes never changes any drawn card identity,
orientation, private note or journal content.

## Provenance rules

- The four currently reviewed cards are **The Chariot, Death, Five of Wands,
  and Eight of Wands**. The other 74 do not receive fictional Waite citations.
- Historical card *symbolism* notes for The Chariot and Death do not imply
  a validated *reversed divinatory meaning*. The source scope is transmitted
  separately to the local model. Five and Eight of Wands have documented
  upright/reversed content in their particular cited chapters.
- “Reviewed” means that the statement is traceable to an identified historical
  section and editorially checked for faithfulness, not that divination
  has empirical backing or that the entire 78-card deck has been audited.
- The notes are short original summaries; no third-party card illustrations,
  commercial guide prose, new dependencies or model weights are included.
- The existing deck's Hermetic paths, decans and attribution fields are **not
  newly verified** in this version. Nothing in Scholar Mode upgrades their
  epistemic status.

## Privacy, stability, and payload bounds

- A deterministic in-browser function builds the scholar overlay only from
  actual local deck card IDs and previously recorded annotations.
- It verifies that the selected cards, orientations and spread positions
  match the pre-existing deterministic tarot packet before adding history.
- Historical annotations join the reading only after a direct opt-in.
- The overlay is limited to 5,800 JSON characters and may omit redundant
  allowed-term hints to stay below GAIA's existing 6,000-character consent
  boundary. It **never** slices a JSON object, fabricates a source or silently
  drops a reviewed historical note. An oversized packet is rejected with a
  clear actionable error.
- Private Ritual Draw journal notes remain outside the model packet. The
  ancestry, chart and Gene Keys flows are not changed.
- No memory storage, telemetry, network access, remote inference or
  implicit model calls are introduced. External source links open only
  when the person chooses them.
- Only the GitHub Pages Tarot/Ritual path is modified. Legacy Next provider
  remains untouched.

## Verification

CI: \`pnpm lint\`, \`pnpm test\`, \`pnpm build\`, \`pnpm pages:build\`.

Manual post-merge smoke test:
- Draw and confirm a spread with The Chariot, Death, Five of Wands, or Eight
  of Wands, if drawn; verify the correct external links and source scope.
- With another card, verify the "historical comparison pending" wording and
  **no** invented source URL.
- Toggle Scholar Mode OFF and ON without changing the cards.
- Select a custom five-card Spread Atlas reading and check packet-size
  handling, including the optional error if too many reviewed notes do not fit.
- Prepare a sourced reading and verify the **staged** Oracle packet and editable
  invitation carry only real matched source notes. Confirm a separate
  **Send** is still required.
- Confirm private journal text does not appear in that packet.
- Test mouse, keyboard, small screens and local-only Ollama behavior.

**People Above Profit · Ledger Above Ego.**
