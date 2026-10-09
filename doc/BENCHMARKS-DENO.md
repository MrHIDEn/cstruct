# Performance benchmarks (Deno)

Same micro-benchmarks as [`doc/BENCHMARKS-NODE.md`](BENCHMARKS-NODE.md), run with **Deno** instead of Node.js.

Run locally:

```bash
npm run bench:deno
# or directly:
deno run -A --no-check --sloppy-imports ./benchmarks/codegen-bench.ts
```

Node.js results: [`doc/BENCHMARKS-NODE.md`](BENCHMARKS-NODE.md) (`npm run bench:node`).
Bun results: [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md) (`npm run bench:bun`).

**Node vs Bun vs Deno comparison:** [`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts)

## Environment

| Item | Value |
|------|-------|
| Machine | MacBook **M4 Pro** |
| OS | macOS 26.6.2 |
| **Deno** | **2.9.7** (V8 **15.0.245**, TypeScript 6.0.3) |
| Node.js (comparison) | v24.21.0 (LTS Krypton, V8 13.6) |
| Library | `@mrhiden/cstruct` 1.7.3 |
| Endian | Little-endian (`CStructLE` / `CStructUint8Array` default LE) |
| Bench duration | ~700 ms per case (default `BENCH_MS`) |

Deno runs the same TypeScript file natively (no ts-node). Notes:

- `--sloppy-imports` is needed because the harness uses extensionless/directory
  relative imports (Node/ts-node convention).
- The script's final line prints `Runtime: Node.js v26.5.1` under Deno — that
  is Deno's `process.version` Node-compat shim, **not** an actual Node runtime.
- Run benchmarks with `--no-check` (type-checking skipped), as in the npm script.

Node, Bun and Deno benchmarks were run **in parallel** on the same machine
during the same session. Absolute numbers vary between runs; use relative
speedups on the same runtime for decisions.

## Static model (hot path)

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 1.33M ops/s (750 ns/op) | 21.1M ops/s (47 ns/op) | **~16×** |
| **read** | 1.87M ops/s (534 ns/op) | 48.6M ops/s (21 ns/op) | **~26×** |
| **write** | 1.21M ops/s (830 ns/op) | 59.9M ops/s (17 ns/op) | **~50×** |

## Dynamic model (hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 745k ops/s (1.34 µs/op) | 6.7M ops/s (149 ns/op) | **~9.0×** |
| **read** | 1.37M ops/s (730 ns/op) | 12.2M ops/s (82 ns/op) | **~8.9×** |

## Variant B — Uint8Array/DataView (static, hot path)

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 810k ops/s (1.23 µs/op) | 5.8M ops/s (174 ns/op) | **~7.1×** |
| **read** | 2.04M ops/s (489 ns/op) | 22.0M ops/s (46 ns/op) | **~10.8×** |
| **write** | 754k ops/s (1.33 µs/op) | 26.4M ops/s (38 ns/op) | **~35×** |

## Variant B — Uint8Array/DataView (dynamic, hot path)

| Operation | Interpreter | Pre-compiled `*Fn()` | Speedup |
|-----------|-------------|----------------------|---------|
| **make** | 397k ops/s (2.52 µs/op) | 4.2M ops/s (236 ns/op) | **~10.7×** |
| **read** | 1.24M ops/s (805 ns/op) | 6.6M ops/s (152 ns/op) | **~5.3×** |

## Codegen compilation (per call)

| Call | Throughput |
|------|------------|
| `cStruct.compileRead()` | 637k ops/s (~1.6 µs) |
| `cStruct.compileWrite()` | 403k ops/s (~2.5 µs) |
| `cStruct.compileMake()` | 473k ops/s (~2.1 µs) |
| `CStructLE.compileRead(model)` | 203k ops/s (~4.9 µs) |

## Cold start (instance + compileRead once)

| Approach | Throughput | vs `fromModelTypes + compileRead` |
|----------|------------|-----------------------------------|
| `fromModelTypes` + `compileRead()` | 202k ops/s | baseline |
| `fromCompiled` + `compileRead()` | 455k ops/s | **~2.3×** |
| `CStructLE.compileRead(model)` | 204k ops/s | ~1.0× |

## Construction (instance only)

| Approach | Throughput | Notes |
|----------|------------|-------|
| `fromModelTypes` | 303k ops/s | baseline |
| `fromCompiled` | 1.78M ops/s | **~5.9×** |

## Deno vs Node.js vs Bun (same machine, same session)

Full head-to-head tables: **[`doc/BENCHMARKS-RUNTIMES.md`](BENCHMARKS-RUNTIMES.md)**.

Quick summary — pre-compiled `*Fn()` throughput (bold = row winner):

| Scenario | Deno 2.9.7 | Node 24.21.0 | Node / Deno | Bun 1.4.2 | Bun / Deno |
|----------|------------|--------------|-------------|-----------|------------|
| Static **read** (Buffer) | 48.6M ops/s | 41.2M ops/s | ~0.85× | **973M ops/s** † | **~20×** † |
| Static **write** (Buffer) | 59.9M ops/s | 55.9M ops/s | ~0.93× | **1 237M ops/s** † | **~21×** † |
| Static **make** (Buffer) | 21.1M ops/s | 22.6M ops/s | ~1.07× | **78.0M ops/s** | **~3.7×** |
| Dynamic **read** (Buffer) | 12.2M ops/s | 9.1M ops/s | ~0.75× | **14.2M ops/s** | **~1.2×** |
| Dynamic **make** (Buffer) | 6.7M ops/s | 10.5M ops/s | ~1.56× | **27.7M ops/s** | **~4.1×** |
| Static **read** (Uint8Array) | 22.0M ops/s | 23.8M ops/s | ~1.08× | **28.1M ops/s** | **~1.3×** |
| Static **write** (Uint8Array) | 26.4M ops/s | 27.6M ops/s | ~1.05× | **33.9M ops/s** | **~1.3×** |
| Static **make** (Uint8Array) | 5.8M ops/s | 7.5M ops/s | ~1.31× | **8.6M ops/s** | **~1.5×** |

† Bun JIT upper-bound artifact (see [`doc/BENCHMARKS-BUN.md`](BENCHMARKS-BUN.md)).

Deno (V8 15.0) tracks Node (V8 13.6) closely — slightly faster on Buffer reads
(~x1.2–1.3), slightly slower on make paths (~x0.9–1.6). Bun leads every codegen
hot path in this session.

## Reproduce

```bash
git clone https://github.com/MrHIDEn/cstruct.git
cd cstruct
npm install   # deno must be on PATH
npm run bench:deno
```

Compare with Node and Bun:

```bash
npm run bench:node
npm run bench:bun
```
