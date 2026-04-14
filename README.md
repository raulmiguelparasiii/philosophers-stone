# Philosopher’s Stone

Philosopher’s Stone is a public, auditable framework for modeling worldview structure, philosophical maturity, and epistemic stability.

It is built around the **Epistemic Octahedron**, a surface-based geometric model with three semantic axes:

- **Empathy ↔ Practicality**
- **Wisdom ↔ Knowledge**
- **Negative ↔ Positive Epistemic Stability**

The project combines:
1. a formal theory of the graph,
2. a constrained AI extraction contract,
3. a deterministic profiler that aggregates evidence into semantic values,
4. a geometric visualizer that preserves the octahedral surface rule.

## Why this exists

Public discourse is full of noise, manipulation, contradiction evasion, and shallow disagreement about what counts as “good reasoning.” Most systems either stay vague and moralistic or become opaque black boxes.

Philosopher’s Stone takes a different route: explicit theory, explicit extraction structure, deterministic scoring, and inspectable geometry.

The long-term goal is to help build public infrastructure for truth-seeking, self-correction, and higher-quality discourse in the age of AI.

## Current status

This repository contains an early but working prototype with:

- a theory paper defining the Epistemic Octahedron,
- a companion system paper defining the architecture and validation path,
- a structured interpreter contract for AI-assisted evidence extraction,
- a deterministic profiler for semantic aggregation and projection,
- a browser-based workspace and visualizer.

This is **not yet a validated instrument**. It is a serious candidate research program moving toward benchmark construction, extractor evaluation, profiler stress-testing, and public validation.

## Core architecture

The current pipeline is intentionally split into layers:

1. **User text input**
2. **Structured AI extraction under a fixed JSON contract**
3. **Deterministic profiling and semantic aggregation**
4. **Projection to the Epistemic Octahedron**
5. **Interactive visualization**

This separation matters. The AI does not directly decide the final plot. It extracts structured evidence. The profiler owns the final aggregation and coordinates.

## What is novel here

- A surface-based octahedral model of worldview development
- A strict separation between probabilistic extraction and deterministic scoring
- A gate-based approach to epistemic stability
- A versionable, inspectable path toward benchmarking and validation
- A public-facing attempt to model philosophical maturity without collapsing into either relativism or opaque authority

## Papers

- [Toward an Objective Model of Philosophical Maturity](./papers/epistemic_octahedron_paper.pdf)
- [Philosopher’s Stone: Architecture, Scientific Potential, and Validation Program](./papers/philosophers_stone_system_paper.pdf)

## Prototype

Open the prototype locally or through GitHub Pages.

Main components:
- `index.html` for the workspace
- `visualizer.html` for the octahedron visualizer
- `src/contracts.js` for the extraction contract
- `src/profiler.js` for deterministic semantic aggregation and projection

## Near-term roadmap

- Freeze a stable public ontology
- Build an adjudicated benchmark dataset
- Evaluate extractor models against the contract
- Stress-test the profiler under weight and rule perturbations
- Publish a cleaner public instrument specification

## Notes

This repository is a public-facing project snapshot. It is meant to show the current theory, architecture, and prototype clearly. Some implementation details and future research directions are still in active development.
