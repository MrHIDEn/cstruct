# Performance benchmarks (Node.js)

Micro-benchmarks comparing the **interpreter** path (`read` / `write` / `make`) with the **codegen** path (`compileRead` / `compileWrite` / `compileMake`), for both implementations:

* **Buffer** (`CStructLE`) — Node.js/Bun only,
* **Uint8Array/DataView** (`CStructUint8Array`) — browser-ready variant B.

Run locally:

```bash
npm run bench:node
```

Bun (separate results): [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md) — `npm run bench:bun`

Deno (separate results): [`doc/BENCHMARKS-DENO.md`](BENCHMARKS-DENO.md) — `npm run bench:deno`

**Node vs Bun vs Deno comparison:** [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)

Optional longer run:

```bash
BENCH_MS=2000 npm run bench:node
```

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts)

## Environment

| Item | Value |
|------|-------|
| Machine | MacBook **M4 Pro** |
| OS | macOS 26.6.2 |
| Node.js | v24.21.0 (LTS Krypton, via nvm) |
| Library | `@mrhiden/cstruct` 1.7.3 |
| Endian | Little-endian (`CStructLE` / `CStructUint8Array` default LE) |
| Bench duration | ~700 ms per case (default `BENCH_MS`) |

Results are **indicative only**. Absolute numbers vary by CPU load, Node version, and model shape. Relative speedups between interpreter and codegen on the same machine are more meaningful than cross-machine comparisons.

Since 1.7.3 the interpreter reuses reader/writer instances (atom maps, aliases
and text decoders are built once per `CStruct` instance, not per call) — the
interpreter is ~x5–13 faster than in 1.7.1, so codegen speedups below are
correspondingly smaller than in older docs.

## Methodology

Benchmarks are split into **separate sections** so costs are not mixed:

| Section | What is measured |
|---------|------------------|
| **Hot path** | Pre-compiled `readFn()` / `writeFn()` / `makeFn()` vs interpreter `read()` / `write()` / `make()`. `compile*` is called **once before** the timed loop — compilation cost is **not** included. |
| **Codegen compilation** | `cStruct.compileRead()` (and siblings) called **every iteration** — cost of `generate*Body` + `new Function`. |
| **Cold start** | Full one-shot setup: create instance + `compileRead()` once. |
| **Construction** | `new CStructLE(...)` only — no codegen. |

- Uses Node.js `perf_hooks` (`performance.now()`).
- **Warmup** (~150 ms) before each measurement (JIT).
- Operations are batched in groups of 1000 to reduce timer overhead.
- Correctness is covered separately by `tests/codegen.test.ts` (parity with the interpreter).

## Static model (hot path)

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }` — fixed size, single `allocUnsafe` in `compileMake`.

Compares **end methods only** — `readFn(buf, 0)` vs `cStruct.read(buf)`:

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 1.54M ops/s (650 ns/op) | 22.6M ops/s (44 ns/op) | **~15×** |
| **read** | 1.87M ops/s (534 ns/op) | 41.2M ops/s (24 ns/op) | **~22×** |
| **write** | 1.49M ops/s (671 ns/op) | 55.9M ops/s (18 ns/op) | **~38×** |

## Dynamic model (hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }` — variable length; `compileMake` computes size first, then single `allocUnsafe` (no `concat`).

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 876k ops/s (1.14 µs/op) | 10.5M ops/s (96 ns/op) | **~12×** |
| **read** | 1.23M ops/s (814 ns/op) | 9.1M ops/s (110 ns/op) | **~7.4×** |

Dynamic fields add loops and concatenation, so gains are smaller than for fully static models — but codegen remains significantly faster.

## Variant B — Uint8Array/DataView (static, hot path)

Same model as above, `CStructUint8Array` (browser-ready, no `Buffer`):

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 1.58M ops/s (633 ns/op) | 7.5M ops/s (133 ns/op) | **~4.8×** |
| **read** | 1.96M ops/s (510 ns/op) | 23.8M ops/s (42 ns/op) | **~12×** |
| **write** | 1.52M ops/s (659 ns/op) | 27.6M ops/s (36 ns/op) | **~18×** |

## Variant B — Uint8Array/DataView (dynamic, hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }`:

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 837k ops/s (1.19 µs/op) | 4.7M ops/s (212 ns/op) | **~5.6×** |
| **read** | 1.15M ops/s (871 ns/op) | 5.5M ops/s (181 ns/op) | **~4.8×** |

Buffer codegen is ~x1.6–3.0 faster than the DataView codegen on the same
models — `Buffer.readUInt*`/`write*` are intrinsified in V8, while `DataView`
pays a per-access endianness flag check. The DataView codegen is still
x4.8–18 over its interpreter and works everywhere (browsers, workers).

## Codegen compilation cost (per call)

Re-running `compile*` on every iteration (anti-pattern — compile once at startup):

| Call | Throughput | Notes |
|------|------------|-------|
| `cStruct.compileRead()` | 461k ops/s (~2.2 µs) | Instance already has `parsedModel`; only `generate` + `new Function` |
| `cStruct.compileWrite()` | 295k ops/s (~3.4 µs) | Similar |
| `cStruct.compileMake()` | 373k ops/s (~2.7 µs) | Also runs `analyzeModel` |
| `CStructLE.compileRead(model)` | 175k ops/s (~5.7 µs) | **Plus** `ModelParser.parseModel` every time |

`compileRead()` on an existing instance is **~2.6× faster** than `static compileRead(model)` because parsing is skipped. Still ~**90× slower** than calling a pre-compiled `readFn()` in a hot loop.

## Cold start (instance + compileRead once)

One-shot setup cost when the app starts:

| Approach | Throughput | vs `fromModelTypes + compileRead` |
|----------|------------|-----------------------------------|
| `fromModelTypes` + `compileRead()` | 176k ops/s | baseline |
| `fromCompiled` + `compileRead()` | 358k ops/s | **~2.0×** faster |
| `CStructLE.compileRead(model)` | 179k ops/s | ~same as baseline (parses model each time) |

Cold start is dominated by `new Function` (~2.2 µs) plus instance construction. `fromCompiled` wins by skipping `ModelParser`, not by speeding up codegen itself.

## Construction (instance only, no codegen)

| Approach | Throughput | Notes |
|----------|------------|-------|
| `fromModelTypes` (runs `ModelParser`) | 299k ops/s | Parses model every time |
| `fromCompiled` (loads `jsonModel`) | 1.74M ops/s | **~5.8×** faster; skips parser |

Use `fromCompiled` and compile codegen functions once at startup when you have many struct definitions or care about cold start.

## When codegen is worth it

| Scenario | Recommendation |
|----------|----------------|
| Thousands of buffers per second, fixed model | **codegen** (`compileRead` / `compileWrite` / `compileMake`) |
| Rare serialization, prototyping | **interpreter** (`read` / `write` / `make`) — simpler API, and since the reader/writer reuse fix no longer pathologically slow |
| Many struct definitions at startup | **`fromCompiled`** + instance `compileRead()` |
| Untrusted model strings | **Neither codegen nor `fromCompiled`** — trusted models only |

## Reproduce on your machine

```bash
git clone https://github.com/MrHIDEn/cstruct.git
cd cstruct
npm install
npm run bench:node
```

Paste your output into an issue or PR if you want to extend this table for other hardware.

Compare with Bun: [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md). Head-to-head: [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md).
