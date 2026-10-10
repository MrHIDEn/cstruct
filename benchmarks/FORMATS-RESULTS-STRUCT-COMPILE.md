# Formats benchmark results — vs `struct-compile`

Binary-vs-binary comparison of `@mrhiden/cstruct` (three variants) against
[`struct-compile`](https://www.npmjs.com/package/struct-compile) — a library
that compiles C-style struct declarations into `Buffer` codecs
(`compileFast` → plain `{ size, decode, encode, ... }` functions, `compile` →
a class with lazy per-field getters).

* Last run: 2026-10-10, Node.js v24.21.0, macOS (Apple Silicon).
* Reproduce: `npm run bench:formats:struct-compile`
  (`ts-node --transpile-only benchmarks/formats-bench-struct-compile.ts`).
* Struct under test (fixed size, all fields always present) — the same one as
  in [`FORMATS-RESULTS.md`](FORMATS-RESULTS.md):
  ```c
  struct Sensor { uint8_t a; int16_t b; uint32_t c; float d; double e; };
  // data = { a: 7, b: -123, c: 123456, d: 1.5, e: 123.456 }
  ```

  | Variant | What it is |
  |---|---|
  | **cstruct (Buffer)** | Node `Buffer` path, interpreter (walks the model at runtime) |
  | **cstruct (DataView)** | `CStructUint8Array`, `Uint8Array`/`DataView`, interpreter |
  | **cstruct (codegen)** | `CStructUint8Array.compileRead/compileMake` — model compiled once |
  | **sc fast (prealloc)** | `struct-compile` `compileFast().encode` into a caller-provided `Buffer` |
  | **sc fast (allocUnsafe)** | same, with `Buffer.allocUnsafe` inside the loop (allocation included) |
  | **sc class lazy** | `struct-compile` `compile()` — lazy getters, all fields touched |

## Why this is like-for-like

Both libraries take a fixed-size struct, compile it once into specialized
codecs with constant offsets, and produce the **identical wire layout** — the
benchmark verifies byte-for-byte identity and round-trips all three decode
paths against the source data:

```text
cstruct        19 bytes  0x0785ff40e201000000c03f77be9f1a2fdd5e40
struct-compile 19 bytes  0x0785ff40e201000000c03f77be9f1a2fdd5e40
```

## Results

| Path | Encode ops/s | Encode ns/op | Decode ops/s | Decode ns/op |
|---:|---:|---:|---:|---:|
| cstruct (Buffer, interpreted) | 7 082 193 | 141.2 | 11 084 605 | 90.2 |
| cstruct (DataView, interpreted) | 10 178 450 | 98.2 | 7 462 696 | 134.0 |
| cstruct (codegen) | **35 585 675** | 28.1 | 64 815 232 | 15.4 |
| sc fast encode (prealloc) | **57 733 368** | **17.3** | — | — |
| sc fast encode (allocUnsafe) | 23 144 272 | 43.2 | — | — |
| sc fast decode | — | — | **74 137 579** | **13.5** |
| sc class lazy (all fields) | — | — | 20 545 240 | 48.7 |

Higher ops/s is better; lower ns/op is better.

## How to read this

* **Decode — sc fast decode leads narrowly** (~74.1M vs cstruct codegen
  ~64.8M, ~1.14×). Both emit direct constant-offset `Buffer` reads into
  monomorphic object literals; the margin is within run-to-run noise, treat
  them as peers.
* **Encode — depends on allocation accounting.** Raw codec throughput
  (`prealloc`) favors `struct-compile` (~57.7M, ~1.62× cstruct codegen):
  `encode` writes into a caller-provided buffer, so no allocation happens in
  the hot loop. When allocation is included like cstruct's `make` does
  (`allocUnsafe` inside the loop), `struct-compile` drops to ~23.1M and
  **cstruct codegen (~35.6M) wins ~1.54×** — `compileMake` precomputes the
  size and writes straight into a single buffer. Pick the framing that matches
  your call pattern: if you reuse a scratch buffer, both libraries are in the
  same league; if you allocate per call, cstruct codegen is faster.
* **Interpreters** — cstruct's Buffer interpreter encodes at ~7.1M and decodes
  at ~11.1M; `sc class lazy` (~20.5M with all fields touched) sits between the
  interpreters and the compiled paths, but it is a different use case (random
  field access over a backing buffer, `Object.defineProperty` getters).
* **Wire** — identical 19-byte packed little-endian layout, so results are
  comparable byte-for-byte.

## Caveats

* `struct-compile` is **Node-only** (requires the `Buffer` API — no browsers,
  no Deno), GPL-3.0 licensed, and its fast mode supports neither arrays nor
  bit fields (class mode only). cstruct's `CStructUint8Array` path runs in
  browsers, Deno, Bun and Node on `Uint8Array`/`DataView`.
* `sc class lazy` returns getters over the backing buffer (mutations write
  in place); `decode`/cstruct paths return plain objects.
* For **JSON** and **protobuf** numbers on the same struct see
  [`FORMATS-RESULTS.md`](FORMATS-RESULTS.md) — cstruct codegen encoded at
  ~36.7M and decoded at ~68.3M there, i.e. in the same league as
  `struct-compile` fast mode.