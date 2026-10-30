---
name: Mi caro (Gomoku)
shortName: Mi caro
order: 1
status: prod
summary: A lightning-fast, minimalist web Gomoku engine powered by bitboard representation, alpha-beta pruning, and zero server roundtrips.
tags: [Game Theory, WebAssembly, Rust]
preview: gomoku
icon: sports_esports
metric: "<16ms/ply"
experiment:
  id: EXP-014
  title: Mi caro Bitboard WASM
  domain: "GOMOKU // MINIMAX"
  summary: Dual-threaded iterative deepening alpha-beta with Zobrist hash table.
  metric: "Eval: 16ms/ply"
---
