import { performance } from 'perf_hooks';
import { CStruct, CStructBE } from '../src';
import { Struct, u8, i16, f32, sizedArray } from 'typed-cstruct';

/**
 * Benchmark on the same struct layouts as the `typed-cstruct` README examples:
 *   basic:   { uint8_t a; int16_t b; float c; }            (LE)
 *   array:   { uint8_t a; int16_t b[3]; }                  (BE)
 *   nested:  { uint8_t a; struct { int16_t b; float c; } } (BE)
 * Comparing the interpreter path vs the codegen path on identical wire formats.
 *
 * Run: npx ts-node --transpile-only benchmarks/typed-cstruct-bench.ts
 */

interface BenchResult {
    name: string;
    opsPerSec: number;
    nsPerOp: number;
}

const DEFAULT_MS = Number(process.env.BENCH_MS ?? 700);
const WARMUP_MS = 150;

function runFor(fn: () => void, durationMs: number): { ops: number; elapsedMs: number } {
    let ops = 0;
    const start = performance.now();
    let now = start;
    do {
        for (let i = 0; i < 1000; i++) fn();
        ops += 1000;
        now = performance.now();
    } while (now - start < durationMs);
    return { ops, elapsedMs: now - start };
}

function bench(name: string, fn: () => void): BenchResult {
    runFor(fn, WARMUP_MS); // warmup (JIT)
    const { ops, elapsedMs } = runFor(fn, DEFAULT_MS);
    return { name, opsPerSec: (ops / elapsedMs) * 1000, nsPerOp: (elapsedMs * 1e6) / ops };
}

function fmt(n: number): string {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function printGroup(title: string, results: BenchResult[]) {
    console.log(`\n${title}`);
    console.log('-'.repeat(title.length));
    const baseline = results[0].opsPerSec;
    for (const r of results) {
        const speedup = (r.opsPerSec / baseline).toFixed(2);
        const opsStr = `${fmt(r.opsPerSec)} ops/s`.padStart(20);
        const nsStr = `${r.nsPerOp.toFixed(1)} ns/op`.padStart(14);
        console.log(`  ${r.name.padEnd(30)} ${opsStr} ${nsStr}  x${speedup}`);
    }
}

// --- basic: { uint8_t a; int16_t b; float c; } (LE, his default endian) ---
{
    const model = { a: 'u8', b: 'i16', c: 'f' };
    const data = { a: 1, b: 0x0302, c: 1.0 };
    const cStruct = new CStruct(model); // LE
    const buf = cStruct.make(data).buffer;
    const readFn = cStruct.compileRead();
    const writeFn = cStruct.compileWrite();
    const makeFn = cStruct.compileMake();

    printGroup('basic { u8, i16, f } (LE) — interpreter vs codegen', [
        bench('make (interpreter)', () => cStruct.make(data)),
        bench('read (interpreter)', () => cStruct.read(buf)),
        bench('write (interpreter)', () => cStruct.write(buf, data)),
        bench('make (compiled)', () => makeFn(data)),
        bench('read (compiled)', () => readFn(buf, 0)),
        bench('write (compiled)', () => writeFn(data, buf, 0)),
    ]);
}

// --- array: { uint8_t a; int16_t b[3]; } (BE) ---
{
    const cStruct = CStructBE.fromModelTypes({ a: 'u8', b: 'i16[3]' });
    const data = { a: 1, b: [0x0102, 0x0304, 0x0506] };
    const buf = cStruct.make(data).buffer;

    printGroup('array { u8, i16[3] } (BE) — interpreter', [
        bench('make (interpreter)', () => cStruct.make(data)),
        bench('read (interpreter)', () => cStruct.read(buf)),
        bench('write (interpreter)', () => cStruct.write(buf, data)),
    ]);
}

// --- nested: { uint8_t a; struct { int16_t b; float c; } d; } (BE) ---
{
    const cStruct = CStructBE.fromModelTypes({ a: 'u8', d: { b: 'i16', c: 'f' } });
    const data = { a: 1, d: { b: 0x0203, c: 1.0 } };
    const buf = cStruct.make(data).buffer;
    const readFn = cStruct.compileRead();
    const makeFn = cStruct.compileMake();

    printGroup('nested { u8, { i16, f } } (BE) — interpreter vs codegen', [
        bench('make (interpreter)', () => cStruct.make(data)),
        bench('read (interpreter)', () => cStruct.read(buf)),
        bench('make (compiled)', () => makeFn(data)),
        bench('read (compiled)', () => readFn(buf, 0)),
    ]);
}

// --- typed-cstruct: basic { u8, i16, f32 } (his default: LE) ---
{
    const tStruct = new Struct()
        .field('a', u8)
        .field('b', i16)
        .field('c', f32);
    const data = { a: 1, b: 0x0302, c: 1.0 };
    const tBuf = new Uint8Array(tStruct.size); // his layout (v0.11 aligns fields: size 8)
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    printGroup('basic { u8, i16, f } (LE) — typed-cstruct', [
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
    ]);
}

// --- typed-cstruct: array { u8, i16[3] } (BE) ---
{
    const tStruct = new Struct({ endian: 'big' })
        .field('a', u8)
        .field('b', sizedArray(i16, 3));
    const data = { a: 1, b: [0x0102, 0x0304, 0x0506] };
    const tBuf = new Uint8Array(tStruct.size);
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    printGroup('array { u8, i16[3] } (BE) — typed-cstruct', [
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
    ]);
}

// --- typed-cstruct: nested { u8, { i16, f32 } } (BE) ---
{
    const tStruct = new Struct({ endian: 'big' })
        .field('a', u8)
        .field('d', new Struct().field('b', i16).field('c', f32));
    const data = { a: 1, d: { b: 0x0203, c: 1.0 } };
    const tBuf = new Uint8Array(tStruct.size);
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    printGroup('nested { u8, { i16, f } } (BE) — typed-cstruct', [
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
    ]);
}

