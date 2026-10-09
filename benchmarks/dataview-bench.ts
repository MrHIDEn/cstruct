import { performance } from 'perf_hooks';
import { CStruct, CStructBE, CStructUint8Array } from '../src';
import { Struct, u8, i16, f32, sizedArray } from 'typed-cstruct';
import { Struct as TStruct } from 'typed-struct';

/**
 * Comparison: Buffer interpreter (CStruct) vs DataView interpreter
 * (CStructUint8Array) vs typed-cstruct vs typed-struct, on the same
 * struct layouts:
 *   basic:   { uint8_t a; int16_t b; float c; }            (LE)
 *   array:   { uint8_t a; int16_t b[3]; }                  (BE)
 *   nested:  { uint8_t a; struct { int16_t b; float c; } } (BE)
 *
 * Note: typed-struct has no big-endian variant for typed-array fields
 * (e.g. Int16Array is native-endian only), so it is benchmarked on the
 * basic (LE) and nested (BE) layouts only.
 *
 * Run: npx ts-node --transpile-only benchmarks/dataview-bench.ts
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
        console.log(`  ${r.name.padEnd(34)} ${opsStr} ${nsStr}  x${speedup}`);
    }
}

// --- basic: { uint8_t a; int16_t b; float c; } (LE) ---
{
    const model = { a: 'u8', b: 'i16', c: 'f' };
    const data = { a: 1, b: 0x0302, c: 1.0 };
    const bufCStruct = new CStruct(model); // Buffer-based (LE)
    const uvCStruct = new CStructUint8Array(model); // DataView-based (LE)
    const buf = bufCStruct.make(data).buffer;
    const bytes = uvCStruct.make(data).bytes;

    const tStruct = new Struct()
        .field('a', u8)
        .field('b', i16)
        .field('c', f32);
    const tBuf = new Uint8Array(tStruct.size); // his layout (v0.11 aligns fields: size 8)
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    const bufReadFn = bufCStruct.compileRead();
    const bufWriteFn = bufCStruct.compileWrite();
    const bufMakeFn = bufCStruct.compileMake();
    const uvReadFn = uvCStruct.compileRead();
    const uvWriteFn = uvCStruct.compileWrite();
    const uvMakeFn = uvCStruct.compileMake();

    const tsBasic = new TStruct('Basic')
        .UInt8('a')
        .Int16LE('b')
        .Float32LE('c')
        .compile();
    const tsBuf = Buffer.alloc(tsBasic.baseSize);
    const tsItem = new tsBasic(tsBuf);

    printGroup('basic { u8, i16, f } (LE) — Buffer vs DataView vs tcs vs tstruct', [
        bench('cstruct read (Buffer)', () => bufCStruct.read(buf)),
        bench('cstruct read (Buffer, codegen)', () => bufReadFn(buf, 0)),
        bench('cstruct read (DataView)', () => uvCStruct.read(bytes)),
        bench('cstruct read (DataView, codegen)', () => uvReadFn(bytes)),
        bench('cstruct make (Buffer)', () => bufCStruct.make(data)),
        bench('cstruct make (Buffer, codegen)', () => bufMakeFn(data)),
        bench('cstruct make (DataView)', () => uvCStruct.make(data)),
        bench('cstruct make (DataView, codegen)', () => uvMakeFn(data)),
        bench('cstruct write (Buffer)', () => bufCStruct.write(buf, data)),
        bench('cstruct write (Buffer, codegen)', () => bufWriteFn(data, buf, 0)),
        bench('cstruct write (DataView)', () => uvCStruct.write(bytes, data)),
        bench('cstruct write (DataView, codegen)', () => uvWriteFn(data, bytes)),
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
        bench('tstruct read (instance + props)', () => {
            const it = new tsBasic(tsBuf);
            return it.a + it.b + it.c;
        }),
        bench('tstruct write (props)', () => {
            tsItem.a = 1;
            tsItem.b = 0x0302;
            tsItem.c = 1.0;
        }),
    ]);
}

// --- array: { uint8_t a; int16_t b[3]; } (BE) ---
{
    const model = { a: 'u8', b: 'i16[3]' };
    const data = { a: 1, b: [0x0102, 0x0304, 0x0506] };
    const bufCStruct = CStructBE.fromModelTypes(model);
    const uvCStruct = CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
    const buf = bufCStruct.make(data).buffer;
    const bytes = uvCStruct.make(data).bytes;

    const tStruct = new Struct({ endian: 'big' })
        .field('a', u8)
        .field('b', sizedArray(i16, 3));
    const tBuf = new Uint8Array(tStruct.size); // his layout (aligned, size 8)
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    const bufReadFn = bufCStruct.compileRead();
    const bufMakeFn = bufCStruct.compileMake();
    const uvReadFn = uvCStruct.compileRead();
    const uvMakeFn = uvCStruct.compileMake();

    printGroup('array { u8, i16[3] } (BE) — Buffer vs DataView vs tcs', [
        bench('cstruct read (Buffer)', () => bufCStruct.read(buf)),
        bench('cstruct read (Buffer, codegen)', () => bufReadFn(buf, 0)),
        bench('cstruct read (DataView)', () => uvCStruct.read(bytes)),
        bench('cstruct read (DataView, codegen)', () => uvReadFn(bytes)),
        bench('cstruct make (Buffer)', () => bufCStruct.make(data)),
        bench('cstruct make (Buffer, codegen)', () => bufMakeFn(data)),
        bench('cstruct make (DataView)', () => uvCStruct.make(data)),
        bench('cstruct make (DataView, codegen)', () => uvMakeFn(data)),
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
    ]);
}

// --- nested: { uint8_t a; struct { int16_t b; float c; } d; } (BE) ---
{
    const model = { a: 'u8', d: { b: 'i16', c: 'f' } };
    const data = { a: 1, d: { b: 0x0203, c: 1.0 } };
    const bufCStruct = CStructBE.fromModelTypes(model);
    const uvCStruct = CStructUint8Array.fromModelTypes(model, undefined, { endian: 'be' });
    const buf = bufCStruct.make(data).buffer;
    const bytes = uvCStruct.make(data).bytes;

    const tStruct = new Struct({ endian: 'big' })
        .field('a', u8)
        .field('d', new Struct().field('b', i16).field('c', f32));
    const tBuf = new Uint8Array(tStruct.size); // his layout (aligned)
    tStruct.write(data, { buf: tBuf });
    const tScratch = new Uint8Array(tStruct.size);

    const bufReadFn = bufCStruct.compileRead();
    const bufMakeFn = bufCStruct.compileMake();
    const uvReadFn = uvCStruct.compileRead();
    const uvMakeFn = uvCStruct.compileMake();

    const tsSub = new TStruct('Sub')
        .Int16BE('b')
        .Float32BE('c')
        .compile();
    const tsNested = new TStruct('Nested')
        .UInt8('a')
        .Struct('d', tsSub)
        .compile();
    const tsBuf = Buffer.alloc(tsNested.baseSize); // no C alignment: 7 bytes, same as ours
    const tsItem = new tsNested(tsBuf);

    printGroup('nested { u8, { i16, f } } (BE) — Buffer vs DataView vs tcs vs tstruct', [
        bench('cstruct read (Buffer)', () => bufCStruct.read(buf)),
        bench('cstruct read (Buffer, codegen)', () => bufReadFn(buf, 0)),
        bench('cstruct read (DataView)', () => uvCStruct.read(bytes)),
        bench('cstruct read (DataView, codegen)', () => uvReadFn(bytes)),
        bench('cstruct make (Buffer)', () => bufCStruct.make(data)),
        bench('cstruct make (Buffer, codegen)', () => bufMakeFn(data)),
        bench('cstruct make (DataView)', () => uvCStruct.make(data)),
        bench('cstruct make (DataView, codegen)', () => uvMakeFn(data)),
        bench('tcs read', () => tStruct.read({ buf: tBuf })),
        bench('tcs write', () => tStruct.write(data, { buf: tScratch })),
        bench('tstruct read (instance + props)', () => {
            const it = new tsNested(tsBuf);
            return it.a + it.d.b + it.d.c;
        }),
        bench('tstruct write (props)', () => {
            tsItem.a = 1;
            tsItem.d.b = 0x0203;
            tsItem.d.c = 1.0;
        }),
    ]);
}
