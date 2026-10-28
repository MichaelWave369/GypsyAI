# GAIA v0.4.0 · MIT Inspiration Study + Ritual Draw Table

## Goal

An original **user-directed, local-first symbolic exploration experience**
that joins GAIA's existing 78-card authored meanings and TIEKAT-approved
localhost Oracle with a truthful interactive ritual. This document records
outside inspiration separately from implementation facts. We do not claim
GAIA's interface or tarot philosophy is unprecedented.

## Open-source research (checked October 28, 2026)

| Repository | Relevant architecture / technique | License evidence | GAIA adaptation |
| --- | --- | --- | --- |
| [anois/tarot](https://github.com/anois/tarot) | Browser 3D manual shuffle/draw, card reveal, normalized spread-coordinate editor, local history, reading modes | MIT LICENSE file; assets/fonts have separate provenance | Original no-asset face-down deck now; consider original WebXR table and normalized spread editor later |
| [fzlzjerry/tarot-mcp](https://github.com/fzlzjerry/tarot-mcp) | User-controlled shuffle/cut, selected cards held on confirmation, position-aware handoff, visible tool-state distinctions | MIT LICENSE file | Original fixed-after-shuffle selection, explicit confirm, no silent replacement and staged local Oracle handoff |
| [rbrutherford3/Tarot](https://github.com/rbrutherford3/Tarot) | Person's drag gesture affects shuffle; offline card interaction | MIT LICENSE file | Take the agency principle, but prefer unbiased secure browser randomness, not claimed human gesture entropy |
| [rvrutan/tarot](https://github.com/rvrutan/tarot) | Reading personality, focus presets, visual reveal and sound | MIT LICENSE file; Kaggle dataset and media need separate review | Future optional voiced reading styles and soundscape; original assets only |
| [xyflow/xyflow](https://github.com/xyflow/xyflow) | Graph nodes, custom edges, zoom, minimap | MIT LICENSE file and project docs | First version uses lightweight original SVG Field Loom; evaluate React Flow once graph data and performance are proven |
| [do-me/SemanticFinder](https://github.com/do-me/SemanticFinder) | Browser-only embeddings with optional WebGPU/Wasm | MIT LICENSE file; downloaded model licenses remain separate | Future opt-in semantic search of private journals, local-only embedding models |
| [yjs/yjs](https://github.com/yjs/yjs) | Network-agnostic offline-first CRDT shared state and sync | MIT LICENSE file | Future *explicit* collaborative or multi-device sessions, with consent and secure channels; not activated now |
| [motiondivision/motion](https://github.com/motiondivision/motion) | Declarative animations and accessible interactions | GitHub repository MIT SPDX | Optional motion polish; not a substitute for reduced-motion support |

**Copyright note:** A repository's MIT *source license* does not
automatically license bundled card art, writing, datasets, fonts, trademarks
or external model weights as MIT. No third-party source files, art, fonts or
models were copied in this version. This implementation is independently
authored from general interface patterns. If we directly reuse third-party
MIT code later, preserve its copyright and license notices.

## Implemented in v0.4.0

- A new **Ritual Draw** top-level Pages route and Reading Room entrance.
- Choose one-card or Past/Present/Future layouts using existing position
  definitions and the original card data from GAIA.
- User-initiated **cryptographic-source Fisher–Yates shuffle**. Each card's
  upright/reversed orientation is assigned before the user picks. 32-bit
  draws use rejection sampling for unbiased range selection.
- **Cut** a full deck between positions 1 and 77 before the first choice.
- Browse 12 face-down cards at a time. Browsing changes only the visible
  fan; **choosing** one removes it from the remaining deck. Every selected
  card is locked to its spread position. No duplicates or quiet redraws.
- Independently reveal each card, with GAIA's original name, orientation,
  previously authored meaning, keywords and recorded element when present.
- Confirm and lock the finished spread before it may be handed to Oracle.
- **Field Loom**, a lightweight SVG map of chosen card/position order with
  evidence-labeled adjacent links. It does not infer unseen energetic
  correspondences or create new divination data.
- Optional volatile journal note; stored in React state only, not saved in
  persistent memory and not attached to model context. It may be explicitly
  exported alongside cards and user focus to a private JSON file.
  Leaving the Ritual Draw route clears the note; a handoff prompts before
  discarding an unsaved note.
- **No remote requests** from this chamber. The existing reviewed
  \`permittedPacket\` and \`reflect\` stage a bounded source-grounded packet,
  then the user separately chooses and submits a local Ollama request.
- No React 19 / TypeScript 6 upgrade and no new package dependency. The
  historic GitHub Pages path and storage keys remain untouched.

## Privacy and interpretation boundaries

- Ancestry and living-person records are never imported into the Ritual Draw.
- The optional focus is sent only if the user proceeds through the Oracle
  handoff and presses Send. A private journal note is **never** attached.
- Exported JSON includes the optional focus and journal text. The download
  is user-requested, so treat it as potentially sensitive.
- Secure random drawing is a software shuffle, not a physical or
  supernatural measurement. The user's card choice is real as a UI action.
- Field Loom links describe **position ordering** and, if both records
  have an element label, what those fields say. The older inherited Hermetic
  labels are not independently verified in this PR.
- The Oracle is interpretive; cards do not predict the future, diagnose
  health or establish an empirical fact about someone.

## Design roadmap after this first slice

1. **Manual spread atlas:** An original draggable layout editor with
   normalized coordinates, validation, JSON export/import and no arbitrary
   executable expressions. Review multi-card packet size before expanding.
2. **Field Loom v2:** Add provenance-tagged symbolic links between Tarot,
   calculated astronomy and approximate Gene Keys. Distinguish observed
   computations, editorial interpretations and personal reflections.
   Never invent causality or a physically measured "resonance."
3. **Reflective continuity:** Opt-in encrypted journal with explicit export,
   delete, versioned import and source receipts. Consider browser-side
   semantic indexing only after model licenses, performance and deletion
   semantics are reviewed.
4. **Presentation:** Original card backs/illustrations, tasteful 3D or XR
   room, optional audio, and a no-motion accessible mode. No unlicensed
   deck scans or external trackers.
5. **Local comparison studio:** Same cards, selectable reading styles and
   optional model comparison with user rating; no fabricated quality scores.

## Acceptance checks

Run \`pnpm lint\`, \`pnpm test\`, \`pnpm build\`, \`pnpm pages:build\`.
Then manually test \`#ritual\` on mobile, keyboard, and desktop:

- Shuffle, cut, browse a face-down fan across pages, select and reveal.
- Confirm fixed positions and card orientations across multiple view actions.
- Try invalid cut indices, duplicate or post-completion choices.
- Confirm that an incomplete or unconfirmed reading cannot stage an Oracle call.
- Export a note; check it stays out of the Oracle packet.
- Confirm that none of the ritual steps call a model or remote service.
- Navigate to Oracle only through explicit staging, review the suggested
  prompt, then click Send to local Ollama.
- Verify one-card and three-card behavior as well as reduced-motion CSS.

**People Above Profit · Ledger Above Ego.**
