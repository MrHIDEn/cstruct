# Formats benchmark results — vs `struct-compile`

Binary-vs-binary comparison of `@mrhiden/cstruct` (four variants) against
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
  | **cstruct (Buffer codegen)** | `CStructLE.compileMake/compileRead` — compiled once, emits `Buffer.read/write*LE` intrinsics |
  | **cstruct (DataView)** | `CStructUint8Array`, `Uint8Array`/`DataView`, interpreter |
  | **cstruct (codegen)** | `CStructUint8Array.compileRead/compileMake` — compiled once, direct `bytes[i]` indexing |
  | **sc fast (prealloc)** | `struct-compile` `compileFast().encode` into a caller-provided `Buffer` |
  | **sc fast (allocUnsafe)** | same, with `Buffer.allocUnsafe` inside the loop (allocation included) |
  | **sc class lazy** | `struct-compile` `compile()` — lazy getters, all fields touched |

## Why this is like-for-like

Both libraries take a fixed-size struct, compile it once into specialized
codecs, and produce the **identical wire layout** — the benchmark verifies
byte-for-byte identity and round-trips every decode path (cstruct Buffer /
DataView / both codegens, sc fast, sc class) against the source data:

```text
cstruct        19 bytes  0x0785ff40e201000000c03f77be9f1a2fdd5e40
struct-compile 19 bytes  0x0785ff40e201000000c03f77be9f1a2fdd5e40
```

## Results

| Path | Encode ops/s | Encode ns/op | Decode ops/s | Decode ns/op |
|---:|---:|---:|---:|---:|
| cstruct (Buffer, interpreted) | 7 334 527 | 136.3 | 10 999 506 | 90.9 |
| cstruct (Buffer codegen) | 21 943 503 | 45.6 | 36 380 426 | 27.5 |
| cstruct (DataView, interpreted) | 10 328 348 | 96.8 | 7 259 081 | 137.8 |
| cstruct (codegen, DataView) | **36 091 134** | 27.7 | 70 447 913 | 14.2 |
| sc fast encode (prealloc) | **56 753 505** | **17.6** | — | — |
| sc fast encode (allocUnsafe) | 24 090 464 | 41.5 | — | — |
| sc fast decode | — | — | **75 260 851** | **13.3** |
| sc class lazy (all fields) | — | — | 21 220 240 | 47.1 |

Higher ops/s is better; lower ns/op is better.

## How to read this

* **Decode — sc fast decode leads** (~75.3M). cstruct's DataView codegen is a
  near peer (~70.4M, ~1.07×, within run-to-run noise). cstruct's **Buffer
  codegen trails ~2×** (~36.4M) even though it emits the *same*
  `Buffer.read*LE` intrinsics as `struct-compile` — the difference is the
  emitted code shape, not the primitives: sc folds constant offsets
  (`o+1`, `o+11`) into a single returned object literal, while cstruct walks a
  mutable offset cursor with temp vars and returns a `{ struct, offset, size }`
  envelope (two allocations per call). This is a codegen-tuning opportunity,
  not an intrinsic-speed wall.
* **Encode — depends on allocation accounting.** Raw codec throughput
  (`prealloc`) favors `struct-compile` (~56.8M): `encode` writes into a
  caller-provided buffer, so no allocation happens in the hot loop. When
  allocation is included, `struct-compile` (~24.1M with `allocUnsafe`) is at
  parity with cstruct's Buffer codegen `make` (~21.9M), while cstruct's
  DataView codegen `make` (~36.1M) wins ~1.5× — it precomputes the size,
  allocates once, and writes via direct byte indexing.
* **Interpreter vs codegen on cstruct** — on this struct the DataView codegen
  decodes *faster* than the Buffer codegen (manual `bytes[i]` indexing beats
  `Buffer.read*` method calls), while for `struct-compile` the same Buffer
  intrinsics reach ~75M — again shape over primitives.
* **`sc class lazy`** (~21.2M with all fields touched) sits between the
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