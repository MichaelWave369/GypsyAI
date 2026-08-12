# Mothership Reader Contract v0.1

Status: **experimental integration contract**

This contract lets independent symbolic/computational readers exchange structured outputs without collapsing their epistemic boundaries.

## Wire schema

`parallax.mothership.reader-envelope.v0.1`

The JSON wire format uses **snake_case** across languages.

```json
{
  "schema": "parallax.mothership.reader-envelope.v0.1",
  "reader": {
    "id": "gypsy.astro",
    "name": "GypsyAI Astrology Reader",
    "version": "0.1.0",
    "implementation": "GypsyAI/src/lib/astro/engine.ts"
  },
  "input": {
    "kind": "birth_chart_coordinates",
    "payload": {}
  },
  "observations": [
    {
      "id": "astro.placements",
      "claim_class": "computed",
      "label": "Planetary placements",
      "value": {},
      "source": "...",
      "confidence": "deterministic"
    }
  ],
  "interpretations": [
    {
      "id": "astro.hermetic_keys",
      "framework": "GypsyAI Hermetic correspondence layer",
      "claim_class": "symbolic_interpretation",
      "summary": "...",
      "based_on": ["astro.placements"]
    }
  ],
  "provenance": [],
  "warnings": [],
  "claim_boundary": "...",
  "generated_at": "optional timestamp",
  "receipt_hash": "optional adapter receipt"
}
```

## Claim classes

- `computed` — deterministic calculation from declared inputs and algorithms.
- `source_observation` — explicit evidence recovered from a declared source/corpus.
- `symbolic_interpretation` — meaning assigned under a declared symbolic tradition/framework.
- `modeled_theoretical` — deterministic/model output that is not a real-world measurement.
- `experimental` — Parallax or adapter-level exploratory extension.

A Mothership consumer must **not promote** one class into another simply because multiple readers agree.

## Required separation

Readers should place directly inspectable outputs in `observations` and downstream meaning in `interpretations`.

Examples:

- astronomical longitude → `computed`
- Hermetic meaning assigned to that longitude → `symbolic_interpretation`
- lexical phrase match in a source text → `source_observation`
- CODEX motif interpretation → `symbolic_interpretation`
- TIEKAT modeled gravity variable → `modeled_theoretical`

## Provenance

Each reader should identify the code, dataset, source, library, and/or operator inputs needed to understand where an output came from.

## Receipts

`receipt_hash` is an adapter-generated identity for a stable payload. v0.1 does **not** yet require cross-language hash equivalence; the receiving Reader Bus should compute its own normalized import receipt after schema validation.

This avoids pretending JavaScript and Python numeric serialization are already a frozen canonical hash format.

## Amalgamation boundary

The Reader Bus may preserve, compare, group, and display reader outputs. It must not create a hidden numeric vote or declare truth from cross-reader agreement unless a separate, versioned amalgamation rule has been explicitly frozen.

Until Alan supplies the Mothership vote rule, cross-reader synthesis is descriptive and provenance-preserving only.
