# Benchmark results

Performance comparison of the `@mrhiden/cstruct` serialization paths against
two independent libraries: [`typed-cstruct`](https://www.npmjs.com/package/typed-cstruct)
and [`typed-struct`](https://www.npmjs.com/package/typed-struct), on identical
struct layouts.

* Last run: 2026-10-09, Node.js v26.4.0, macOS (Apple Silicon), commit `7e2d9a2`.
* Reproduce: `npx ts-node --transpile-only benchmarks/dataview-bench.ts`
  (or `npm run bench` for the internal codegen benchmark).

## What is compared

| Label | What it is |
|---|---|
| **CStruct (Buffer)** | The classic interpreter path (`CStruct`/`CStructLE`/`CStructBE`). Reads/walks the parsed model at runtime, uses Node's `Buffer`. Node only. |
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

## Results

### basic `{ u8, i16, f }` — little endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 216 930 | 4 609.8 | x1.00 |
| CStruct read (DataView) | 208 015 | 4 807.3 | x0.96 |
| CStructUint8Array read (codegen) | **24 917 946** | **40.1** | **x114.9** |
| CStruct make (Buffer) | 197 944 | 5 051.9 | x0.91 |
| CStruct make (DataView) | 989 137 | 1 011.0 | x4.56 |
| CStructUint8Array make (codegen) | 7 587 068 | 131.8 | x35.0 |
| CStruct write (Buffer) | 207 270 | 4 824.6 | x0.96 |
| CStruct write (DataView) | 969 010 | 1 032.0 | x4.47 |
| CStructUint8Array write (codegen) | **26 475 901** | 37.8 | **x122.1** |
| typed-cstruct read | 1 005 731 | 994.3 | x4.64 |
| typed-cstruct write | 1 921 918 | 520.3 | x8.86 |
| typed-struct read | 894 551 | 1 117.9 | x4.12 |
| typed-struct write | 5 189 149 | 192.7 | x23.9 |

### array `{ u8, i16[3] }` — big endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 163 716 | 6 108.1 | x1.00 |
| CStruct read (DataView) | 207 646 | 4 815.9 | x1.27 |
| CStructUint8Array read (codegen) | **18 279 938** | 54.7 | **x111.7** |
| CStruct make (Buffer) | 165 968 | 6 025.3 | x1.01 |
| CStruct make (DataView) | 891 474 | 1 121.7 | x5.45 |
| CStructUint8Array make (codegen) | 7 472 491 | 133.8 | x45.6 |
| typed-cstruct read | 682 848 | 1 464.5 | x4.17 |
| typed-cstruct write | 2 130 770 | 469.3 | x13.0 |

### nested `{ u8, { i16, f } }` — big endian

| Path | ops/s | ns/op | vs Buffer read |
|---|---:|---:|---:|
| CStruct read (Buffer) | 170 328 | 5 871.0 | x1.00 |
| CStruct read (DataView) | 204 827 | 4 882.2 | x1.20 |
| CStructUint8Array read (codegen) | **20 447 819** | 48.9 | **x120.1** |
| CStruct make (Buffer) | 165 231 | 6 052.1 | x0.97 |
| CStruct make (DataView) | 824 632 | 1 212.7 | x4.84 |
| CStructUint8Array make (codegen) | 7 464 306 | 134.0 | x43.8 |
| typed-cstruct read | 691 146 | 1 446.9 | x4.06 |
| typed-cstruct write | 1 400 694 | 713.9 | x8.22 |
| typed-struct read | 579 263 | 1 726.3 | x3.40 |
| typed-struct write | 5 078 478 | 196.9 | x29.8 |

## Summary (DataView variant, same machine)

ops/s — higher is better. `—` = the library has no equivalent operation
(typed-cstruct has no separate `make`; its `write` encodes straight into a
buffer). typed-struct is omitted from the array (BE) group (no big-endian
typed-array fields).

| Operation | CStruct (Buffer) | CStructUint8Array (DataView) | DataView codegen | typed-cstruct | typed-struct |
|---|---:|---:|---:|---:|---:|
| **basic `{ u8, i16, f }` (LE)** | | | | | |
| read | 216 930 | 208 015 | **24 917 946** | 1 005 731 | 894 551 |
| make | 197 944 | 989 137 | **7 587 068** | — | — |
| write | 207 270 | 969 010 | **26 475 901** | 1 921 918 | 5 189 149 * |
| **array `{ u8, i16[3] }` (BE)** | | | | | |
| read | 163 716 | 207 646 | **18 279 938** | 682 848 | n/a † |
| make | 165 968 | 891 474 | **7 472 491** | — | n/a † |
| write | 165 968 | 891 474 | 7 472 491 | 2 130 770 | n/a † |
| **nested `{ u8, { i16, f } }` (BE)** | | | | | |
| read | 170 328 | 204 827 | **20 447 819** | 691 146 | 579 263 |
| make | 165 231 | 824 632 | **7 464 306** | — | — |
| write | 165 231 | 824 632 | 7 464 306 | 1 400 694 | 5 078 478 * |

\* typed-struct's write is plain property assignment into a live view —
it does not encode a JS object tree, so it is not equivalent to cstruct's
`write()`.

† typed-struct's typed-array fields (e.g. `Int16Array`) are native-endian
only — a big-endian `i16[3]` layout cannot be expressed.

## How to read this

* **Interpreter vs interpreter:** the DataView variant is on par or faster
  than the Buffer one (up to ~x1.3 on read, ~x5 on make/write — fewer
  allocations). Both reference libraries are faster still on raw reads
  (~x3.4–4.6 vs our interpreter) — they do less work per call, but they
  also do less overall (fixed-size layouts only, no dynamic fields, no
  JSON/enum model features, no codegen).
* **Codegen is the headline:** `compileRead()` is ~x110–120 faster than the
  Buffer interpreter and ~x25–29 faster than both reference libraries'
  reads (~40–55 ns per struct). `compileWrite()` reaches ~26M ops/s.
  Neither reference library has a compilation path, so this gap is
  architectural.
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

* `benchmarks/codegen-bench.ts` (`npm run bench`) — internal comparison:
  interpreter vs codegen paths on the Buffer implementation.
* `benchmarks/typed-cstruct-bench.ts` — conformance-focused benchmark using
  the struct layouts from the typed-cstruct README.
* `benchmarks/dataview-bench.ts` — the source of the numbers above
  (Buffer vs DataView vs typed-cstruct vs typed-struct).
