# Node.js vs Bun vs Deno — runtime comparison

Head-to-head results for `@mrhiden/cstruct` codegen on the **same machine**, benchmarks started **in parallel** in one session.

| Doc | Runtime | Command |
|-----|---------|---------|
| [BENCHMARKS-NODE.md](BENCHMARKS-NODE.md) | Node.js v24.21.0 (LTS Krypton, nvm) | `npm run bench:node` |
| [BENCHMARKS-BUN.md](BENCHMARKS-BUN.md) | Bun 1.4.2 (JavaScriptCore) | `npm run bench:bun` |
| [BENCHMARKS-DENO.md](BENCHMARKS-DENO.md) | Deno 2.9.7 (V8 15.0) | `npm run bench:deno` |

Hardware: MacBook **M4 Pro**, macOS 26.6.2, `@mrhiden/cstruct` 1.8.1, ~700 ms per case.

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts) — identical harness for all runtimes (Buffer + Uint8Array/DataView variants). Deno needs `--sloppy-imports` (extensionless dir imports) and reports `process.version` as a Node-compat shim (`v26.5.1`) — ignore that line in its output.

Ratio columns: **Bun/Node**, **Deno/Node** and **Bun/Deno** = throughput ÷ throughput (values > 1× mean the numerator is faster).

> Note: Bun's static Buffer codegen read/write numbers (~1G ops/s, sub-ns/op)
> indicate near-total JIT elimination of per-iteration work on that tight
> loop — treat as an upper bound (†).

## Static model — hot path

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }`.

### Pre-compiled `*Fn()` (codegen hot path)

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 41.2M ops/s (24 ns) | **972.5M ops/s (1 ns)** † | 48.6M ops/s (21 ns) | ~23.6× † | **~1.2×** | ~20.0× † |
| **write** | 55.9M ops/s (18 ns) | **1 236.6M ops/s (0.8 ns)** † | 59.9M ops/s (17 ns) | ~22.1× † | **~1.1×** | ~20.6× † |
| **make** | 22.6M ops/s (44 ns) | **78.0M ops/s (13 ns)** | 21.1M ops/s (47 ns) | **~3.5×** | ~0.93× | **~3.7×** |

### Interpreter (`read()` / `write()` / `make()`)

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 1.87M ops/s (534 ns) | **2.99M ops/s (335 ns)** | 1.87M ops/s (534 ns) | **~1.6×** | ~1.0× | **~1.6×** |
| **write** | 1.49M ops/s (671 ns) | **2.28M ops/s (438 ns)** | 1.21M ops/s (830 ns) | **~1.5×** | ~0.8× | **~1.9×** |
| **make** | 1.54M ops/s (650 ns) | **2.46M ops/s (406 ns)** | 1.33M ops/s (750 ns) | **~1.6×** | ~0.9× | **~1.9×** |

### Codegen speedup (interpreter → `*Fn()`, same runtime)

| Operation | Node.js | Bun | Deno |
|-----------|---------|-----|------|
| **read** | ~22× | ~326× † | ~26× |
| **write** | ~38× | ~542× † | ~50× |
| **make** | ~15× | ~32× | ~16× |

## Dynamic model — hot path

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

### Pre-compiled `*Fn()`

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 9.1M ops/s (110 ns) | **14.2M ops/s (71 ns)** | 12.2M ops/s (82 ns) | **~1.6×** | **~1.3×** | ~1.2× |
| **make** | 10.5M ops/s (96 ns) | **27.7M ops/s (36 ns)** | 6.7M ops/s (149 ns) | **~2.7×** | ~0.6× | **~4.1×** |

### Interpreter

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 1.23M ops/s (814 ns) | **1.65M ops/s (604 ns)** | 1.37M ops/s (730 ns) | **~1.3×** | **~1.1×** | ~1.2× |
| **make** | 876k ops/s (1.14 µs) | **1.28M ops/s (782 ns)** | 745k ops/s (1.34 µs) | **~1.5×** | ~0.9× | **~1.7×** |

### Codegen speedup (same runtime)

| Operation | Node.js | Bun | Deno |
|-----------|---------|-----|------|
| **read** | ~7.4× | ~8.6× | ~8.9× |
| **make** | ~12× | ~22× | ~9.0× |

## Variant B — Uint8Array/DataView (static, hot path)

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }` over `CStructUint8Array`.

### Pre-compiled `*Fn()`

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 23.8M ops/s (42 ns) | **28.1M ops/s (36 ns)** | 22.0M ops/s (46 ns) | **~1.2×** | ~0.9× | **~1.3×** |
| **write** | 27.6M ops/s (36 ns) | **33.9M ops/s (30 ns)** | 26.4M ops/s (38 ns) | **~1.2×** | ~1.0× | **~1.3×** |
| **make** | 7.5M ops/s (133 ns) | **8.6M ops/s (117 ns)** | 5.8M ops/s (174 ns) | **~1.1×** | ~0.8× | **~1.5×** |

### Interpreter

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read** | 1.96M ops/s (510 ns) | **2.82M ops/s (355 ns)** | 2.04M ops/s (489 ns) | **~1.4×** | **~1.0×** | **~1.4×** |
| **write** | 1.52M ops/s (659 ns) | **1.79M ops/s (558 ns)** | 0.75M ops/s (1 327 ns) | **~1.2×** | ~0.5× | **~2.4×** |
| **make** | 1.58M ops/s (633 ns) | **1.90M ops/s (527 ns)** | 0.81M ops/s (1 234 ns) | **~1.2×** | ~0.5× | **~2.3×** |

## Variant B — Uint8Array/DataView (dynamic, hot path)

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

| Operation | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|-----------|---------|-----|------|----------|-----------|----------|
| **read `*Fn()`** | 5.5M ops/s (181 ns) | **7.6M ops/s (131 ns)** | 6.6M ops/s (152 ns) | **~1.4×** | **~1.2×** | ~1.2× |
| **make `*Fn()`** | 4.7M ops/s (212 ns) | **6.1M ops/s (164 ns)** | 4.2M ops/s (236 ns) | **~1.3×** | ~0.9× | **~1.4×** |
| read (interp.) | 1.15M ops/s (871 ns) | **1.47M ops/s (682 ns)** | 1.24M ops/s (805 ns) | **~1.3×** | **~1.1×** | ~1.2× |
| make (interp.) | 837k ops/s (1.19 µs) | **892k ops/s (1.12 µs)** | 397k ops/s (2.52 µs) | **~1.1×** | ~0.5× | **~2.2×** |

## Cold start & compilation

| Scenario | Node.js | Bun | Deno | Bun/Node | Deno/Node | Bun/Deno |
|----------|---------|-----|------|----------|-----------|----------|
| `cStruct.compileRead()` (re-compile) | 461k ops/s | **754k ops/s** | 637k ops/s | **~1.6×** | **~1.4×** | ~1.2× |
| `fromModelTypes` (instance) | 299k ops/s | **517k ops/s** | 303k ops/s | **~1.7×** | ~1.0× | **~1.7×** |
| `fromCompiled` (instance) | 1.74M ops/s | **3.50M ops/s** | 1.78M ops/s | **~2.0×** | ~1.0× | **~2.0×** |
| `fromModelTypes` + `compileRead()` | 176k ops/s | **283k ops/s** | 202k ops/s | **~1.6×** | **~1.1×** | **~1.4×** |
| `fromCompiled` + `compileRead()` | 358k ops/s | **588k ops/s** | 455k ops/s | **~1.6×** | **~1.3×** | **~1.3×** |

## Summary

| Use case | Winner (this session) | Notes |
|----------|-----------------------|-------|
| **Static codegen `read` / `write`** (Buffer) | **Bun**, with a big margin over both V8 runtimes | but the † caveat applies — treat as upper bound; real gap closer |
| **Static codegen `make`** | **Bun** (~x3.5–3.7) | Node ≈ Deno (~0.93×) |
| **Dynamic codegen `read`** | **Bun** | Deno beats Node here (~x1.3) |
| **Dynamic codegen `make`** | **Bun** (~x2.7–4.1) | Deno weakest (~x0.6 vs Node) |
| **Interpreter** | **Bun** (~x1.1–1.6) | Deno ≈ Node on read, weaker on write/make (~x0.5–0.9) |
| **Variant B (DataView) `read`** | **Bun** (small margins ~x1.2–1.4) | Deno ≈ Node |
| **Variant B (DataView) write/make** | **Bun** | Deno notably weaker here (~x0.5 vs Node) |
| **Cold start / construction** | **Bun** | Node ≈ Deno |

**Practical advice:**

- **Compile once at startup** (`compileRead()` / `compileWrite()` / `compileMake()`, ideally via `fromCompiled`) — this matters far more than the runtime choice.
- **Bun led every measured codegen path** in this session; Deno (V8 15.0) tracks Node (V8 13.6) closely — slightly faster on reads, slightly slower on make/write paths.
- For browser code use `CStructUint8Array` — the DataView codegen costs ~x1.6–3.0 vs the Node-only Buffer codegen on Node, the price of portability.
- Numbers are **indicative** — re-run all three benches on your hardware:

```bash
npm run bench:node & npm run bench:bun & npm run bench:deno & wait
```
