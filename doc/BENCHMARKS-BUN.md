# Performance benchmarks (Bun)

Same micro-benchmarks as [`doc/BENCHMARKS-NODE.md`](BENCHMARKS-NODE.md), run with **Bun** instead of Node.js.

Run locally:

```bash
npm run bench:bun
# or
bun ./benchmarks/codegen-bench.ts
```

Node.js results: [`doc/BENCHMARKS-NODE.md`](BENCHMARKS-NODE.md) (`npm run bench:node`).

Deno results: [`doc/BENCHMARKS-DENO.md`](BENCHMARKS-DENO.md) (`npm run bench:deno`).

**Node vs Bun vs Deno comparison:** [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts)

## Environment

| Item | Value |
|------|-------|
| Machine | MacBook **M4 Pro** |
| OS | macOS 26.6.2 |
| **Bun** | **1.4.2** (JavaScriptCore) |
| Node.js (comparison) | v24.21.0 (LTS Krypton, via nvm) |
| Library | `@mrhiden/cstruct` 1.8.0 |
| Endian | Little-endian (`CStructLE` / `CStructUint8Array` default LE) |
| Bench duration | ~700 ms per case (default `BENCH_MS`) |

Node, Bun and Deno benchmarks were run **in parallel** on the same machine
during the same session. Absolute numbers vary between runs; use relative
speedups on the same runtime for decisions.

> Note: Bun's static Buffer codegen read/write numbers below (~1G ops/s,
> sub-ns/op) indicate the JIT optimized away nearly all per-iteration work on
> this tight loop — treat them as an upper bound, not a stable expectation.
> The `CStructUint8Array` (DataView) numbers are less aggressive and more representative.

## Static model (hot path)

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 2.46M ops/s (406 ns/op) | 78.0M ops/s (13 ns/op) | **~32×** |
| **read** | 2.99M ops/s (335 ns/op) | 973M ops/s (1 ns/op) † | **~326×** † |
| **write** | 2.28M ops/s (438 ns/op) | 1 237M ops/s (0.8 ns/op) † | **~542×** † |

† see the caveat note under *Environment*.

## Dynamic model (hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 1.28M ops/s (782 ns/op) | 27.7M ops/s (36 ns/op) | **~22×** |
| **read** | 1.65M ops/s (604 ns/op) | 14.2M ops/s (71 ns/op) | **~8.6×** |

## Variant B — Uint8Array/DataView (static, hot path)

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 1.90M ops/s (527 ns/op) | 8.6M ops/s (117 ns/op) | **~4.5×** |
| **read** | 2.82M ops/s (355 ns/op) | 28.1M ops/s (36 ns/op) | **~10×** |
| **write** | 1.79M ops/s (558 ns/op) | 33.9M ops/s (30 ns/op) | **~19×** |

## Variant B — Uint8Array/DataView (dynamic, hot path)

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 892k ops/s (1.12 µs/op) | 6.1M ops/s (164 ns/op) | **~6.9×** |
| **read** | 1.47M ops/s (682 ns/op) | 7.6M ops/s (131 ns/op) | **~5.2×** |

## Codegen compilation (per call)

| Call | Throughput |
|------|------------|
| `cStruct.compileRead()` | 754k ops/s (~1.3 µs) |
| `cStruct.compileWrite()` | 503k ops/s (~2.0 µs) |
| `cStruct.compileMake()` | 614k ops/s (~1.6 µs) |
| `CStructLE.compileRead(model)` | 288k ops/s (~3.5 µs) |

## Cold start (instance + compileRead once)

| Approach | Throughput | vs `fromModelTypes + compileRead` |
|----------|------------|-----------------------------------|
| `fromModelTypes` + `compileRead()` | 283k ops/s | baseline |
| `fromCompiled` + `compileRead()` | 588k ops/s | **~2.1×** |
| `CStructLE.compileRead(model)` | 286k ops/s | ~1.0× |

## Construction (instance only)

| Approach | Throughput | Notes |
|----------|------------|-------|
| `fromModelTypes` | 517k ops/s | baseline |
| `fromCompiled` | 3.50M ops/s | **~6.8×** |

## Bun vs Node.js vs Deno (same machine, same session)

See the full head-to-head tables (interpreter + codegen + cold start): **[`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)**.

Quick summary — pre-compiled `*Fn()` throughput (bold = row winner):

| Scenario | Bun 1.4.2 | Node 24.21.0 | Bun / Node | Deno 2.9.7 | Bun / Deno |
|----------|-----------|--------------|------------|------------|------------|
| Static **read** (Buffer) | **973M ops/s** † | 41.2M ops/s | ~24× † | 48.6M ops/s | **~20×** † |
| Static **write** (Buffer) | **1 237M ops/s** † | 55.9M ops/s | ~22× † | 59.9M ops/s | **~21×** † |
| Static **make** (Buffer) | **78.0M ops/s** | 22.6M ops/s | **~3.5×** | 21.1M ops/s | **~3.7×** |
| Dynamic **read** (Buffer) | **14.2M ops/s** | 9.1M ops/s | **~1.6×** | 12.2M ops/s | **~1.2×** |
| Dynamic **make** (Buffer) | **27.7M ops/s** | 10.5M ops/s | **~2.7×** | 6.7M ops/s | **~4.1×** |
| Static **read** (Uint8Array) | **28.1M ops/s** | 23.8M ops/s | **~1.2×** | 22.0M ops/s | **~1.3×** |
| Static **write** (Uint8Array) | **33.9M ops/s** | 27.6M ops/s | **~1.2×** | 26.4M ops/s | **~1.3×** |
| Static **make** (Uint8Array) | **8.6M ops/s** | 7.5M ops/s | **~1.1×** | 5.8M ops/s | **~1.5×** |

† Bun JIT upper-bound artifact.

Bun is faster than Node and Deno on **every codegen hot path** in this
session; the gap is modest (~x1.1–3.5) except the static Buffer read/write
loop flagged with †. The interpreter is also faster on Bun (~x1.2–1.6) —
reversed relative to pre-1.8.0 measurements, when the object-heavy per-call
reader/writer construction dominated and favoured Node.

## Reproduce

```bash
git clone https://github.com/MrHIDEn/cstruct.git
cd cstruct
npm install   # or bun install
npm run bench:bun
```

Compare with Node and Deno:

```bash
npm run bench:node
npm run bench:deno
```
