# Mitaito Lab

**Curiosity without boundaries. Rigor without orthodoxy.**

Mitaito Lab is an independent research lab probing game theory, dynamic
simulations, computational media and emergent systems. Code is the primary
hypothesis: we build small, sharp, interactive tools and learn from how they
behave.

> "Software is not merely an instrument; it is an experimental medium."

Some of what we build is open for dissection and forkable play. Some stays
private while it matures. Either way, the work is better with other people in
it.

## Products

| Product                                                    | Status     | What it is                                                                                                                  |
| ---------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| [Mi caro (Gomoku)](content/products/mi-caro.md)            | Production | A fast, minimalist web Gomoku engine built on bitboards and alpha-beta pruning, with zero server roundtrips.                |
| [Resonance Canvas](content/products/resonance-canvas.md)   | Production | A tactile granular audio synthesizer and spectral visualizer built on WebAudio AudioWorklet and microtonal scale modulators. |
| [Axiom Force Topology](content/products/axiom-force-topology.md) | Production | A Barnes-Hut force-directed graph renderer handling 50k nodes with spatial octrees and real-time kinetic perturbation.      |
| [Lenia Continuous Substrates](content/products/lenia-continuous-substrates.md) | Production | Smooth mathematical life forms emerging from continuous kernel convolutions, computed in parallel on WebGPU.                |
| [Nexus Agentic Sandbox](content/products/nexus-agentic-sandbox.md) | Beta       | A multi-agent consensus playground exploring adversarial deliberation protocols, context degradation and synthetic debate.  |
| [Mnemonic CRDT Matrix](content/products/mnemonic-crdt-matrix.md) | Alpha      | A peer-to-peer, local-first collaborative semantic notebook over WebRTC data channels, with no central persistence.        |

Release history for each product is in [`content/changelog/`](content/changelog).

## Research tracks

1. **Algorithmic game theory and discrete solvers.** Bitboard representations,
   MCTS tree topologies and evaluation heuristics across bounded zero-sum
   spaces like Gomoku, hex and cellular automata.
2. **Kinetic interfaces and latency ergonomics.** Measuring decision fatigue
   under varied frame rates and tactile feedback loops, and building
   ultra-low-overhead web renderers and micro-state managers.
3. **Emergent synthesis and generative artifacts.** Autonomous spatial agents
   in constrained topology fields, and wave function collapse applied to
   dynamic semantic maps and procedural architecture.

## Get involved

We welcome partners, bug reports and ideas, all through GitHub issues:

- [Report a bug](https://github.com/mitaito/mi-lab/issues/new?template=bug_report.yml):
  something broken or confusing.
- [Suggest a feature](https://github.com/mitaito/mi-lab/issues/new?template=feature_request.yml):
  an idea, and the problem it would solve.
- [Partner with us](https://github.com/mitaito/mi-lab/issues/new?template=partnership.yml):
  research, integration, co-development or early access.

Issues are public, so please keep confidential details out. For partnerships,
we will reply in the issue to agree a private way to continue.

## About this repository

This repository is the lab's website: a landing page, product directory and
changelog, written as Markdown under [`content/`](content) and prerendered into
a fast static site.

- To run, change or build it, see the [development guide](docs/development.md).
- To deploy it to Kubernetes, see the [deployment guide](docs/deployment.md).

## License

The code and content in this repository are released under the
[MIT License](LICENSE). Some of the lab's products are developed privately and
are not covered by it.
