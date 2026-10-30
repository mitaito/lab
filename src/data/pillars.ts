export interface Pillar {
  track: string;
  icon: string;
  title: string;
  description: string;
  experiments: string;
  stack: string;
}

export const PILLARS: readonly Pillar[] = [
  {
    track: "TRACK 01",
    icon: "games",
    title: "Algorithmic Game Theory & Discrete Solvers",
    description:
      "Bitboard representations, MCTS tree topologies, and evaluation heuristics across bounded zero-sum spaces like Gomoku, hexagonal hex, and cellular automata.",
    experiments: "07 Experiments",
    stack: "Rust • WASM • TS",
  },
  {
    track: "TRACK 02",
    icon: "speed",
    title: "Kinetic Interfaces & Latency Ergonomics",
    description:
      "Measuring user decision fatigue under varied frame-rates and tactile feedback loops. Developing ultra-low overhead web renderers and micro-state managers.",
    experiments: "04 Experiments",
    stack: "WebGL • WebAudio • Canvas",
  },
  {
    track: "TRACK 03",
    icon: "hub",
    title: "Emergent Synthesis & Generative Artifacts",
    description:
      "Autonomous spatial agents interacting in constrained topology fields. Wave function collapse models applied to dynamic semantic maps and procedural architecture.",
    experiments: "07 Experiments",
    stack: "GLSL • GraphBLAS • WFC",
  },
];
