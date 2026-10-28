# GAIA · Gypsy Artificial Intelligence Ally
## Reading Room v0.3.0

**Status:** New GitHub Pages front-end and local reading experience. The GitHub
repository, Pages pathname `/GypsyAI/`, localStorage keys, prior releases,
exports and original Next.js implementation remain named GypsyAI to preserve
existing URLs and data migration history. GAIA is the public-facing ally name.

### A genuine local reading, not generated theater

- **Tarot:** Uses the existing real deck, randomized card draws, spread positions,
  orientations, keywords and Hermetic associations. The offline screen now includes
  card-specific reflective questions. The model NEVER invents which cards appeared.
- **Astrology:** Uses the existing astronomical engine with UTC date and time,
  coordinates, zodiac mode, placements, aspects, Ascendant and Midheaven. Current
  calculation boundaries and approximations still apply. Local civil time must be
  converted to UTC before entering it.
- **Gene Keys:** Uses the original activation-sequence engine and locally stored
  key summaries. This is an approximate symbolic mapping, not an official Gene
  Keys profile, a DNA measurement or a diagnostic result.
- **Ancestry:** Optional user-imported GEDCOM records remain in local browser
  IndexedDB with living-person redaction. The Oracle can receive only an approved
  anonymized aggregate counts packet; lineage identities are not shared.
- **GAIA Local Oracle:** User explicitly detects a model on a local loopback
  Ollama endpoint; a real model response is requested ONLY when Send is pressed.
  TIEKAT deterministic context, reflection modes, consent, opt-in note memory and
  optional modeled Council planning remain transparent. Council is not multiple
  provider executions.
- **Ally Sanctuary:** Dedicated ephemeral conversation with an optional manually
  typed pilot profile requiring per-request approval. No automatic imports or
  persistent profile memory.
- **Constellation Reading (new):** A combined three-card tarot draw, calculated
  chart and activation sequence on one offline browser page. The compact, labeled
  source packet excludes ancestry and the user's optional reflection focus; the
  focus is added to a visible, editable prompt in the Oracle only when the user
  chooses the handoff.

### User journey

1. Open `https://michaelwave369.github.io/GypsyAI/#readings`.
2. Choose a standalone chamber, or enter birth date/time in **UTC** and explicit
   latitude/longitude for the Constellation Reading.
3. Click **Create my constellation**. All reader computations and previews run
   in browser memory; no model, GitHub service or external API is contacted.
4. Review the real card names, calculated placements and approximate key mappings.
5. Optionally click **Prepare local GAIA interpretation**. This stages the
   source-grounded packet and preloads a suggested prompt in the Local Oracle.
   It clears previous Oracle chat context before the new reading.
6. Review/edit the question, explicitly detect and select your LOCAL Ollama
   model if needed, and press **Send to my local model**. Only then is the
   selected data sent to loopback Ollama. If Ollama is unavailable, the deterministic
   reading still exists and an explicit error replaces any fake reply.

The attached reading packet is used for **one successful** model request and
then detached; the user-visible chat can still contain personal information
until it is cleared. The combined result itself remains in component memory and
is cleared when leaving/reloading the Reading Room. Existing opt-in settings and
ancestry browser persistence retain their documented behavior.

### Scope and truthfulness

GAIA readings are reflective and symbolic, not medical, legal, financial,
scientific or supernatural verdicts. Calculated astronomical placements must
not be confused with empirical predictions, nor Gene Keys with laboratory
genetics. Local model answers may be mistaken and should cite the actual
attached reader source, not invent a reading.

**No automatic cloud inference, no new remote endpoint, no personal profile
migration, no stealth lineage sharing, no schema mutation and no destruction
of the historical GypsyAI project.**

### Validation

- `pnpm test` includes `tests/pages-gaia-reading-room.test.ts`.
- `pnpm pages:build` builds the browser route and reading room.
- `pnpm build` preserves the existing legacy Next.js compatibility build.
- Manual: review `#readings`, create a constellation, confirm a model is not
  contacted until explicit Oracle Send, test offline and invalid inputs,
  verify native tarot/astro/key chamber handoff and reading-mode selection.
- Manual privacy: ancestry remains blocked by default; an approved integrated
  packet must contain no genealogy data.

**ENTER THE FIELD · People Above Profit · Ledger Above Ego.**
