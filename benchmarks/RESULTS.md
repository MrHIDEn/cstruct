# Benchmark results

Performance comparison of the `@mrhiden/cstruct` serialization paths against
two independent libraries: [`typed-cstruct`](https://www.npmjs.com/package/typed-cstruct)
and [`typed-struct`](https://www.npmjs.com/package/typed-struct), on identical
struct layouts.

* Last run: 2026-10-09, Node.js v24.21.0 (LTS Krypton), macOS (Apple Silicon). Interpreter path
  reuses reader/writer instances (no per-call construction).
* Reproduce: `npx ts-node --transpile-only benchmarks/dataview-bench.ts`
  (or `npm run bench:node` for the internal codegen benchmark).

## What is compared

| Label | What it is |
|---|---|
| **CStruct (Buffer)** | The classic interpreter path (`CStruct`/`CStructLE`/`CStructBE`). Reads/walks the parsed model at runtime, uses Node's `Buffer`. Node only. |
| **CStruct (codegen)** | Buffer-based `compileRead()`/`compileWrite()`/`compileMake()` — the model is compiled once into a dedicated function; no per-field model walking. Node only. The fastest path. |
| **CStructUint8Array (interpreter)** | Variant B interpreter (`src/uv/`). Same model logic, but runs on `DataView` over a plain `Uint8Array` — works in browsers, no `Buffer`. |
| **CStructUint8Array (codegen)** | Variant B with `compileRead()`/`compileWrite()`/`compileMake()` — the model is compiled once into a dedicated function; no per-field model walking. Also `Uint8Array`/browser-ready. |
| **typed-cstruct (tcs)** | [`typed-cstruct@0.11.0`](https://www.npmjs.com/package/typed-cstruct) — builder API (`new Struct().field(...)`), reads/writes through a `DataView`. Reference point. |
| **typed-struct (tstruct)** | [`typed-struct@2.7.3`](https://www.npmjs.com/package/typed-struct) — chained-class API (`new Struct('N').UInt8('a').compile()`); instances are live views over a `Buffer`. Reference point. |

Structures under test (same wire data for all libraries):

```c
// basic  — little endian
struct basic  { uint8_t a; int16_t b; float c; };

// array  — big endian
struct array  { uint8_t a; int16_t b[3]; };

// nested — big endian
struct nested { uint8_t a; struct { int16_t b; float c; } d; };
```

Methodology: each function is warmed up (150 ms, JIT), then measured for
700 ms (configurable via `BENCH_MS`), batched in 1000-op groups to reduce
clock overhead. Reported as operations per second and nanoseconds per
operation.

> **Notes on the reference libraries:**
>
> * Since v0.11.0 typed-cstruct inserts C-style field alignment (e.g. `basic`
>   occupies 8 bytes, not 7 as in its own README). Its buffers are therefore
>   built with its own `write()`; `cstruct` layouts stay unaligned, exactly
>   as defined by the model.
> * typed-struct's "read" means constructing a view instance and touching
>   every property; its "write" is plain property assignment into an existing
>   instance (no object-tree encoding), so it is not a 1:1 equivalent of
>   `cstruct`'s `write()` (which encodes a whole JS object).
> * typed-struct has no big-endian variant for typed-array fields
>   (`Int16Array` etc. are native-endian only), so it is benchmarked on the
>   basic (LE) and nested (BE) layouts only — the array (BE) group omits it.

## Why the interpreter was slow (and what changed)

### Root cause

The interpreter path (`read()` / `make()` / `write()`) constructed a fresh
reader/writer on **every call**. Each constructor rebuilt state that is
identical on every call:

- a `Map` of ~40 atom functions,
- ~66 predefined aliases via `addPredefinedAliases()` (each alias runs an
  `isProtectedType()` check — an `Array.includes` plus a regex test),
- two `TextDecoder` instances in `DvReader`,
- a fresh `_atomTypes = '...'.split(',')` array in `BaseBuffer`.

Measured with `__micro.ts` (Node v24, Apple Silicon):

| component | cost |
|---|---:|
| `new ReadBufferLE(buf)` / `new DvReader(bytes)` | ~4 300 ns |
| `readSchema(model)` — the actual field walk | ~280 ns |
| `3× reader.read(u8/i16/f)` — the actual atom reads | ~46 ns |
| full `uv.read(bytes)` | ~4 780 ns |

So ~90% of every read was reader **construction**, not reading. The reference
libraries (typed-cstruct, typed-struct) build their field layout once and then
do direct `DataView`/`Buffer` reads per call — hence ~900k–1M ops/s vs our
~210k.

### What was fixed

Readers/writers are now **reused per `CStruct`/`CStructUint8Array` instance**
instead of being reconstructed on every call:

- low-level readers/writers (`ReadBuffer`, `DvReader`, `WriteBuffer`,
  `DvWriter`) gained a `reset()` (rebind buffer/offset, clear accumulated
  chunks);
- the walker classes (`ReadLE`/`ReadBE`/`ReadUv`, `MakeLE`/`MakeBE`/`MakeUv`,
  `WriteLE`/`WriteBE`/`WriteUv`) gained reusable `read()`/`run()` methods;
- the `CStructLE`/`CStructBE`/`CStructUint8Array` classes hold one lazy
  reader/writer each.

The atom map, aliases and decoders are now built **once per instance**, not
once per call. Public API is unchanged.

### Results

| operation (basic `{ u8, i16, f }`, LE) | before | after | speedup |
|---|---:|---:|---:|
| read (Buffer) | 216 930 | 3 493 500 | ×16.1 |
| read (DataView) | 208 015 | 3 102 591 | ×14.9 |
| make (Buffer) | 197 944 | 2 511 758 | ×12.7 |
| write (Buffer) | 207 270 | 2 386 491 | ×11.5 |

The interpreter now reads at ~1.9–3.5M ops/s — about ×3.0–3.5 faster than
typed-cstruct's read (~1.0M) and typed-struct's read (~0.9M) on identical wire
layouts, and on par or faster than typed-cstruct's write. Full tables below.

## Results

### basic `{ u8, i16, f }` — little endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 3 533 423 | 283.0 | x1.00 |
| CStruct read (codegen) | 112 119 746 | 8.9 | x31.73 |
| CStruct read (DataView) | 3 125 479 | 320.0 | x0.88 |
| CStructUint8Array read (codegen) | 24 927 125 | 40.1 | x7.05 |
| CStruct make (Buffer) | 2 482 390 | 402.8 | x0.70 |
| CStruct make (codegen) | 31 090 409 | 32.2 | x8.80 |
| CStruct make (DataView) | 2 524 919 | 396.1 | x0.71 |
| CStructUint8Array make (codegen) | 7 156 043 | 139.7 | x2.03 |
| CStruct write (Buffer) | 2 364 881 | 422.9 | x0.67 |
| CStruct write (codegen) | 111 154 503 | 9.0 | x31.46 |
| CStruct write (DataView) | 2 445 889 | 408.8 | x0.69 |
| CStructUint8Array write (codegen) | 26 160 689 | 38.2 | x7.40 |
| typed-cstruct read | 1 002 707 | 997.3 | x0.28 |
| typed-cstruct write | 1 882 194 | 531.3 | x0.53 |
| typed-struct read | 882 572 | 1 133.1 | x0.25 |
| typed-struct write | 5 238 268 | 190.9 | x1.48 |

### array `{ u8, i16[3] }` — big endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 2 628 683 | 380.4 | x1.00 |
| CStruct read (codegen) | 51 533 050 | 19.4 | x19.60 |
| CStruct read (DataView) | 2 266 668 | 441.2 | x0.86 |
| CStructUint8Array read (codegen) | 18 013 646 | 55.5 | x6.85 |
| CStruct make (Buffer) | 2 034 263 | 491.6 | x0.77 |
| CStruct make (codegen) | 26 809 692 | 37.3 | x10.20 |
| CStruct make (DataView) | 1 990 152 | 502.5 | x0.76 |
| CStructUint8Array make (codegen) | 7 207 961 | 138.7 | x2.74 |
| typed-cstruct read | 655 910 | 1 524.6 | x0.25 |
| typed-cstruct write | 2 087 018 | 479.2 | x0.79 |

### nested `{ u8, { i16, f } }` — big endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 2 083 113 | 480.1 | x1.00 |
| CStruct read (codegen) | 63 390 180 | 15.8 | x30.43 |
| CStruct read (DataView) | 1 918 164 | 521.3 | x0.92 |
| CStructUint8Array read (codegen) | 20 054 524 | 49.9 | x9.63 |
| CStruct make (Buffer) | 1 666 730 | 600.0 | x0.80 |
| CStruct make (codegen) | 31 049 264 | 32.2 | x14.91 |
| CStruct make (DataView) | 1 797 469 | 556.3 | x0.86 |
| CStructUint8Array make (codegen) | 7 099 539 | 140.9 | x3.41 |
| typed-cstruct read | 686 651 | 1 456.3 | x0.33 |
| typed-cstruct write | 1 377 815 | 725.8 | x0.66 |
| typed-struct read | 570 814 | 1 751.9 | x0.27 |
| typed-struct write | 5 054 058 | 197.9 | x2.38 |

## Summary (same machine)

ops/s — higher is better. `—` = not measured in this script. typed-cstruct has
no separate `make` (its `write` encodes straight into a buffer); typed-struct
is omitted from the array (BE) group (no big-endian typed-array fields).

| Operation | CStruct (Buffer) | CStructUint8Array (DataView) | CStruct (codegen) | CStructUint8Array (codegen) | typed-cstruct | typed-struct |
|---|---:|---:|---:|---:|---:|---:|
| **basic `{ u8, i16, f }` (LE)** | | | | | | |
| read | 3 533 423 | 3 125 479 | **112 119 746** | 24 927 125 | 1 002 707 | 882 572 |
| make | 2 482 390 | 2 524 919 | **31 090 409** | 7 156 043 | — | — |
| write | 2 364 881 | 2 445 889 | **111 154 503** | 26 160 689 | 1 882 194 | 5 238 268 * |
| **array `{ u8, i16[3] }` (BE)** | | | | | | |
| read | 2 628 683 | 2 266 668 | **51 533 050** | 18 013 646 | 655 910 | n/a † |
| make | 2 034 263 | 1 990 152 | **26 809 692** | 7 207 961 | — | n/a † |
| **nested `{ u8, { i16, f } }` (BE)** | | | | | | |
| read | 2 083 113 | 1 918 164 | **63 390 180** | 20 054 524 | 686 651 | 570 814 |
| make | 1 666 730 | 1 797 469 | **31 049 264** | 7 099 539 | — | — |

\* typed-struct's write is plain property assignment into a live view —
it does not encode a JS object tree, so it is not equivalent to cstruct's
`write()`.

† typed-struct's typed-array fields (e.g. `Int16Array`) are native-endian
only — a big-endian `i16[3]` layout cannot be expressed.

## How to read this

* **Interpreter vs reference libraries:** after reusing reader/writer
  instances (the reader/writer atom maps and aliases are built once per
  `CStruct` instead of once per call), the interpreter reads at ~1.9–3.5M
  ops/s — about **x3.0–3.5 faster than typed-cstruct's read** and on par or
  faster than its write, on the same wire layouts. It still does strictly
  more work per call (dynamic fields, JSON/enum model features, model
  walking), so the codegen path below remains the fastest option.
* **Codegen is the headline:** the Buffer codegen `compileRead()` reaches
  **~50–112M ops/s (~9–19 ns per struct)** — about **x20–32 faster than the
  interpreter** and **x75–125 faster than both reference libraries' reads**.
  The DataView (browser) codegen reaches ~18–25M ops/s (~40–55 ns) — still
  x7–10 over the interpreter and ~x25–29 over the reference libraries.
  Neither reference library has a compilation path, so this gap is
  architectural. Node-only Buffer codegen outpaces the DataView codegen
  ~x2.5–4.5 because `Buffer.readUInt*`/`write*` are intrinsified in V8.
* **typed-struct's write is a different animal:** property sets into a
  live view (~5M ops/s) are cheap because no object is being encoded.
  For object-in / bytes-out encoding, `cstruct`'s compiled write is still
  ~x5 faster.
* **Wire-format note:** `cstruct` wire size is always derived from the
  model (e.g. 7 bytes for `basic`). typed-cstruct v0.11 pads to C
  alignment (8 bytes) — a wire-format change relative to its own
  documentation. typed-struct keeps the unaligned 7-byte layout.

All numbers are from a single machine/run — treat them as order-of-magnitude
guidance, not guarantees. Rerun the scripts yourself for current numbers.

## Related benchmarks in this folder

* `benchmarks/codegen-bench.ts` (`npm run bench:node`) — internal comparison:
  interpreter vs codegen paths on the Buffer implementation.
* `benchmarks/typed-cstruct-bench.ts` — conformance-focused benchmark using
  the struct layouts from the typed-cstruct README.
* `benchmarks/dataview-bench.ts` — the source of the numbers above
  (Buffer vs DataView vs typed-cstruct vs typed-struct).
