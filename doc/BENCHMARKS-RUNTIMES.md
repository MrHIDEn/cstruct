# Node.js vs Bun — runtime comparison

Head-to-head results for `@mrhiden/cstruct` codegen on the **same machine**, benchmarks started **in parallel** in one session.

| Doc | Runtime | Command |
|-----|---------|---------|
| [BENCHMARKS.md](BENCHMARKS.md) | Node.js v26.4.0 | `npm run bench` |
| [BENCHMARKS-BUN.md](BENCHMARKS-BUN.md) | Bun 1.3.14 | `npm run bench:bun` |

Hardware: MacBook **M4 Pro**, macOS 26.5.1, `@mrhiden/cstruct` 1.7.1, `CStructLE`, ~700 ms per case.

Source: [`benchmarks/codegen-bench.ts`](../benchmarks/codegen-bench.ts) — identical harness for both runtimes.

Ratio columns: **Bun / Node** = Bun throughput ÷ Node throughput; **Node / Bun** = Node ÷ Bun (values > 1× mean that runtime is faster).

## Static model — hot path

Model: `{ x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' }`.

### Pre-compiled `*Fn()` (codegen hot path)

| Operation | Node.js | Bun | Bun / Node | Node / Bun |
|-----------|---------|-----|------------|------------|
| **read** | 55.0M ops/s (18 ns) | **87.6M ops/s (11 ns)** | **~1.6×** | ~0.63× |
| **write** | 59.3M ops/s (17 ns) | **73.8M ops/s (14 ns)** | **~1.2×** | ~0.83× |
| **make** | **24.5M ops/s (41 ns)** | 6.80M ops/s (147 ns) | ~0.28× | **~3.6×** |

### Interpreter (`read()` / `write()` / `make()`)

| Operation | Node.js | Bun | Bun / Node | Node / Bun |
|-----------|---------|-----|------------|------------|
| **read** | **195k ops/s (5.1 µs)** | 111k ops/s (9.0 µs) | ~0.57× | **~1.8×** |
| **write** | **202k ops/s (5.0 µs)** | 100k ops/s (10.0 µs) | ~0.49× | **~2.0×** |
| **make** | **199k ops/s (5.0 µs)** | 96k ops/s (10.4 µs) | ~0.48× | **~2.1×** |

### Codegen speedup (interpreter → `*Fn()`, same runtime)

| Operation | Node.js speedup | Bun speedup |
|-----------|-----------------|-------------|
| **read** | ~282× | ~792× |
| **write** | ~294× | ~742× |
| **make** | ~123× | ~71× |

## Dynamic model — hot path

Model: `{ name: 's[i16]', items: 'u32[i16]' }`.

### Pre-compiled `*Fn()`

| Operation | Node.js | Bun | Bun / Node | Node / Bun |
|-----------|---------|-----|------------|------------|
| **read** | 8.0M ops/s (125 ns) | **8.55M ops/s (117 ns)** | ~1.1× | ~0.94× |
| **make** | **10.1M ops/s (99 ns)** | 5.20M ops/s (192 ns) | ~0.51× | **~1.9×** |

### Interpreter

| Operation | Node.js | Bun | Bun / Node | Node / Bun |
|-----------|---------|-----|------------|------------|
| **read** | **96k ops/s (10.4 µs)** | 80k ops/s (12.4 µs) | ~0.84× | **~1.2×** |
| **make** | **181k ops/s (5.5 µs)** | 87k ops/s (11.5 µs) | ~0.48× | **~2.1×** |

### Codegen speedup (same runtime)

| Operation | Node.js speedup | Bun speedup |
|-----------|-----------------|-------------|
| **read** | ~83× | ~106× |
| **make** | ~56× | ~60× |

## Cold start & construction

| Scenario | Node.js | Bun | Bun / Node | Node / Bun |
|----------|---------|-----|------------|------------|
| `fromModelTypes` (instance) | 269k ops/s | **330k ops/s** | ~1.2× | ~0.82× |
| `fromCompiled` (instance) | 1.42M ops/s | **2.91M ops/s** | ~2.0× | ~0.49× |
| `fromModelTypes` + `compileRead()` | 181k ops/s | **204k ops/s** | ~1.1× | ~0.89× |
| `fromCompiled` + `compileRead()` | 368k ops/s | **451k ops/s** | ~1.2× | ~0.82× |
| `cStruct.compileRead()` (re-compile) | **629k ops/s** | 605k ops/s | ~0.96× | ~1.0× |

## Summary

| Use case | Faster runtime (this session) | Notes |
|----------|-------------------------------|-------|
| **Static codegen `read` / `write`** | **Bun** | Up to ~×1.6 on tight read loops |
| **Static / dynamic codegen `make`** | **Node.js** | Buffer alloc + sequential writes favour Node here |
| **Interpreter** (`read` / `write` / `make`) | **Node.js** | ~2× vs Bun — object-heavy `MakeLE` path |
| **Instance construction** | **Bun** | Especially `fromCompiled` (~×2) |
| **Codegen vs interpreter ratio** | **Bun** (read/write) | Larger relative gain, but interpreter baseline is slower |

**Practical advice:**

- **High-throughput parsing** (static `compileRead`) on Bun or Node — both excellent; Bun slightly ahead on read/write hot path in this run.
- **High-throughput packing** (`compileMake`, especially static) — Node was faster here; measure on your target runtime.
- **Occasional API** (`cStruct.read()` without codegen) — Node interpreter is faster in this benchmark.
- Always compile once at startup (`compileRead()` / `fromCompiled`); runtime choice matters less than avoiding per-call compilation.

Numbers are **indicative** — re-run both benches on your hardware:

```bash
npm run bench & npm run bench:bun & wait
```
