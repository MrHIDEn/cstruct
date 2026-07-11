# Performance benchmarks (Bun)

Same micro-benchmarks as [`doc/BENCHMARKS.md`](BENCHMARKS.md), run with **Bun** instead of Node.js.

Run locally:

```bash
npm run bench:bun
# or
bun ./benchmarks/codegen-bench.ts
```

Node.js results: [`doc/BENCHMARKS.md`](BENCHMARKS.md) (`npm run bench`).

**Node vs Bun comparison:** [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts)

## Environment

| Item | Value |
|------|-------|
| Machine | MacBook **M4 Pro** |
| OS | macOS 26.5.1 |
| **Bun** | **1.3.14** |
| Node.js (comparison) | v26.4.0 |
| Library | `@mrhiden/cstruct` 1.7.1 |
| Endian | Little-endian (`CStructLE`) |
| Bench duration | ~700 ms per case (default `BENCH_MS`) |

Node and Bun benchmarks were run **in parallel** on the same machine during the same session. Absolute numbers vary between runs; use relative speedups on the same runtime for decisions.

## Static model (hot path)

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 96k ops/s (10.4 µs/op) | 6.80M ops/s (147 ns/op) | **~71×** |
| **read** | 111k ops/s (9.0 µs/op) | 87.6M ops/s (11.4 ns/op) | **~792×** |
| **write** | 100k ops/s (10.0 µs/op) | 73.8M ops/s (13.6 ns/op) | **~742×** |

## Dynamic model (hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 87k ops/s (11.5 µs/op) | 5.20M ops/s (192 ns/op) | **~60×** |
| **read** | 80k ops/s (12.4 µs/op) | 8.55M ops/s (117 ns/op) | **~106×** |

## Codegen compilation (per call)

| Call | Throughput |
|------|------------|
| `cStruct.compileRead()` | 605k ops/s (~1.7 µs) |
| `cStruct.compileWrite()` | 430k ops/s (~2.3 µs) |
| `cStruct.compileMake()` | 543k ops/s (~1.8 µs) |
| `CStructLE.compileRead(model)` | 209k ops/s (~4.8 µs) |

## Cold start (instance + compileRead once)

| Approach | Throughput | vs `fromModelTypes + compileRead` |
|----------|------------|-----------------------------------|
| `fromModelTypes` + `compileRead()` | 204k ops/s | baseline |
| `fromCompiled` + `compileRead()` | 451k ops/s | **~2.2×** |
| `CStructLE.compileRead(model)` | 179k ops/s | ~0.9× |

## Construction (instance only)

| Approach | Throughput | Notes |
|----------|------------|-------|
| `fromModelTypes` | 330k ops/s | baseline |
| `fromCompiled` | 2.91M ops/s | **~8.8×** |

## Bun vs Node.js (same machine, same session)

See the full head-to-head tables (interpreter + codegen + cold start): **[`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)**.

Quick summary — pre-compiled `*Fn()` throughput:

| Scenario | Node `*Fn()` | Bun `*Fn()` | Bun / Node | Node / Bun |
|----------|--------------|-------------|------------|------------|
| Static **read** | 55.0M ops/s | **87.6M ops/s** | **~1.6×** | ~0.63× |
| Static **write** | 59.3M ops/s | **73.8M ops/s** | **~1.2×** | ~0.83× |
| Static **make** | **24.5M ops/s** | 6.80M ops/s | ~0.28× | **~3.6×** |
| Dynamic **read** | 8.0M ops/s | **8.55M ops/s** | ~1.1× | ~0.94× |
| Dynamic **make** | **10.1M ops/s** | 5.20M ops/s | ~0.51× | **~1.9×** |

Bun wins on tight **read/write** loops; Node wins on **`compileMake`** and **interpreter** paths in this session.

## Reproduce

```bash
git clone https://github.com/MrHIDEn/cstruct.git
cd cstruct
npm install   # or bun install
npm run bench:bun
```

Compare with Node:

```bash
npm run bench
```
