import { performance } from 'perf_hooks';
import { CStructLE } from '../src';

/**
 * Zero-dependency micro-benchmark comparing the interpreter path
 * (read/write/make) against the codegen path (compileRead/Write/Make).
 *
 * Run: npm run bench
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
    // Batch to reduce clock-read overhead.
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
    const opsPerSec = (ops / elapsedMs) * 1000;
    const nsPerOp = (elapsedMs * 1e6) / ops;
    return { name, opsPerSec, nsPerOp };
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
        console.log(`  ${r.name.padEnd(26)} ${opsStr} ${nsStr}  x${speedup}`);
    }
}

// --- Static model (fixed size) ---
{
    const model = { x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' };
    const data = { x: 0x1234, y: -7, z: 42, flag: true, d: 123.456 };

    const cStruct = CStructLE.fromModelTypes(model);
    const buffer = cStruct.make(data).buffer;

    const makeFn = cStruct.compileMake();
    const readFn = cStruct.compileRead();
    const writeFn = cStruct.compileWrite();
    const writeTarget = Buffer.alloc(buffer.length);

    printGroup('Static model — make (hot path)', [
        bench('interpreter make()', () => { cStruct.make(data); }),
        bench('makeFn() pre-compiled', () => { makeFn(data); }),
    ]);

    printGroup('Static model — read (hot path)', [
        bench('interpreter read()', () => { cStruct.read(buffer); }),
        bench('readFn() pre-compiled', () => { readFn(buffer, 0); }),
    ]);

    printGroup('Static model — write (hot path)', [
        bench('interpreter write()', () => { cStruct.write(writeTarget, data); }),
        bench('writeFn() pre-compiled', () => { writeFn(data, writeTarget, 0); }),
    ]);
}

// --- Dynamic model (variable length) ---
{
    const model = { name: 's[i16]', items: 'u32[i16]' };
    const data = { name: 'sensor-01', items: [1, 2, 3, 4, 5, 6, 7, 8] };

    const cStruct = CStructLE.fromModelTypes(model);
    const buffer = cStruct.make(data).buffer;

    const makeFn = cStruct.compileMake();
    const readFn = cStruct.compileRead();

    printGroup('Dynamic model — make (hot path)', [
        bench('interpreter make()', () => { cStruct.make(data); }),
        bench('makeFn() pre-compiled', () => { makeFn(data); }),
    ]);

    printGroup('Dynamic model — read (hot path)', [
        bench('interpreter read()', () => { cStruct.read(buffer); }),
        bench('readFn() pre-compiled', () => { readFn(buffer, 0); }),
    ]);
}

// --- Codegen compilation cost (re-compile every call — not recommended) ---
{
    const model = { x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' };
    const cStruct = CStructLE.fromModelTypes(model);

    printGroup('Codegen compilation (per call)', [
        bench('cStruct.compileRead()', () => { cStruct.compileRead(); }),
        bench('cStruct.compileWrite()', () => { cStruct.compileWrite(); }),
        bench('cStruct.compileMake()', () => { cStruct.compileMake(); }),
        bench('CStructLE.compileRead(model)', () => { CStructLE.compileRead(model); }),
    ]);
}

// --- Cold start: instance + compile once ---
{
    const model = { x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' };
    const jsonModel = CStructLE.fromModelTypes(model).jsonModel;

    printGroup('Cold start (instance + compileRead once)', [
        bench('fromModelTypes + compileRead', () => {
            CStructLE.fromModelTypes(model).compileRead();
        }),
        bench('fromCompiled + compileRead', () => {
            CStructLE.fromCompiled(jsonModel).compileRead();
        }),
        bench('static compileRead(model)', () => {
            CStructLE.compileRead(model);
        }),
    ]);
}

// --- Construction cost (instance only, no codegen) ---
{
    const model = { x: 'u16', y: 'i32', z: 'u32', flag: 'b8', d: 'd' };
    const jsonModel = CStructLE.fromModelTypes(model).jsonModel;

    printGroup('Construction (instance only)', [
        bench('fromModelTypes (parse)', () => { CStructLE.fromModelTypes(model); }),
        bench('fromCompiled (no parse)', () => { CStructLE.fromCompiled(jsonModel); }),
    ]);
}

console.log('\nNote: hot-path rows measure pre-compiled *Fn() only; compile* cost is in separate sections.');
const runtime = typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined' ? `Bun ${(process.versions as { bun?: string }).bun}` : `Node.js ${process.version}`;
console.log(`Runtime: ${runtime}. Results vary by machine. Higher ops/s is better.`);
