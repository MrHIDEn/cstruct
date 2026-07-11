# Performance benchmarks

Micro-benchmarks comparing the **interpreter** path (`read` / `write` / `make`) with the **codegen** path (`compileRead` / `compileWrite` / `compileMake`).

Run locally:

```bash
npm run bench
```

Bun (separate results): [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md) — `npm run bench:bun`

**Node vs Bun comparison:** [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)

Optional longer run:

```bash
BENCH_MS=2000 npm run bench
```

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts)

## Environment

| Item | Value |
|------|-------|
| Machine | MacBook **M4 Pro** |
| OS | macOS 26.5.1 |
| Node.js | v26.4.0 |
| Library | `@mrhiden/cstruct` 1.7.1 |
| Endian | Little-endian (`CStructLE`) |
| Bench duration | ~700 ms per case (default `BENCH_MS`) |

Results are **indicative only**. Absolute numbers vary by CPU load, Node version, and model shape. Relative speedups between interpreter and codegen on the same machine are more meaningful than cross-machine comparisons.

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
| **make** | 191k ops/s (5.2 µs/op) | 24.2M ops/s (41 ns/op) | **~127×** |
| **read** | 184k ops/s (5.4 µs/op) | 52.8M ops/s (19 ns/op) | **~287×** |
| **write** | 188k ops/s (5.3 µs/op) | 57.6M ops/s (17 ns/op) | **~307×** |

## Dynamic model (hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }` — variable length; `compileMake` computes size first, then single `allocUnsafe` (no `concat`).

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 182k ops/s (5.5 µs/op) | 7.38M ops/s (136 ns/op) | **~41×** |
| **read** | 182k ops/s (5.5 µs/op) | 7.64M ops/s (131 ns/op) | **~42×** |

Dynamic fields add loops and concatenation, so gains are smaller than for fully static models — but codegen remains significantly faster.

## Codegen compilation cost (per call)

Re-running `compile*` on every iteration (anti-pattern — compile once at startup):

| Call | Throughput | Notes |
|------|------------|-------|
| `cStruct.compileRead()` | 678k ops/s (~1.5 µs) | Instance already has `parsedModel`; only `generate` + `new Function` |
| `cStruct.compileWrite()` | 716k ops/s (~1.4 µs) | Similar |
| `cStruct.compileMake()` | 478k ops/s (~2.1 µs) | Also runs `analyzeModel` |
| `CStructLE.compileRead(model)` | 188k ops/s (~5.3 µs) | **Plus** `ModelParser.parseModel` every time |

`compileRead()` on an existing instance is **~3× faster** than `static compileRead(model)` because parsing is skipped. Still ~**300× slower** than calling a pre-compiled `readFn()` in a hot loop.

## Cold start (instance + compileRead once)

One-shot setup cost when the app starts:

| Approach | Throughput | vs `fromModelTypes + compileRead` |
|----------|------------|-----------------------------------|
| `fromModelTypes` + `compileRead()` | 188k ops/s | baseline |
| `fromCompiled` + `compileRead()` | 436k ops/s | **~2.3×** faster |
| `CStructLE.compileRead(model)` | 187k ops/s | ~same as baseline (parses model each time) |

Cold start is dominated by `new Function` (~1.5 µs) plus instance construction. `fromCompiled` wins by skipping `ModelParser`, not by speeding up codegen itself.

## Construction (instance only, no codegen)

| Approach | Throughput | Notes |
|----------|------------|-------|
| `fromModelTypes` (runs `ModelParser`) | 276k ops/s | Parses model every time |
| `fromCompiled` (loads `jsonModel`) | 1.45M ops/s | **~5×** faster; skips parser |

Use `fromCompiled` and compile codegen functions once at startup when you have many struct definitions or care about cold start.

## When codegen is worth it

| Scenario | Recommendation |
|----------|----------------|
| Thousands of buffers per second, fixed model | **codegen** (`compileRead` / `compileWrite` / `compileMake`) |
| Rare serialization, prototyping | **interpreter** (`read` / `write` / `make`) — simpler API |
| Many struct definitions at startup | **`fromCompiled`** + instance `compileRead()` |
| Untrusted model strings | **Neither codegen nor `fromCompiled`** — trusted models only |

## Reproduce on your machine

```bash
git clone https://github.com/MrHIDEn/cstruct.git
cd cstruct
npm install
npm run bench
```

Paste your output into an issue or PR if you want to extend this table for other hardware.

Compare with Bun: [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md). Head-to-head: [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md).
