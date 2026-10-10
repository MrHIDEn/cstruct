import { performance } from 'perf_hooks';
import { createRequire } from 'module';
import { CStruct, CStructLE, CStructUint8Array } from '../src';

/**
 * Binary-vs-binary comparison: @mrhiden/cstruct (3 variants) vs
 * `struct-compile` (https://www.npmjs.com/package/struct-compile).
 *
 * Both libraries compile a fixed-size struct into specialized read/write
 * functions and produce the exact same wire layout (packed, little endian),
 * so this is a like-for-like throughput comparison on the same struct used by
 * formats-bench.ts (see FORMATS-RESULTS.md for JSON/protobuf numbers).
 *
 *   cstruct variants:
 *     - CStruct (Buffer)              — Node Buffer, interpreter (walk model)
 *     - CStructLE (Buffer codegen)    — compileMake/compileRead on Buffer,
 *                                       uses Buffer.read/write*LE intrinsics
 *                                       (like-for-like peer of compileFast)
 *     - CStructUint8Array (DataView)  — Uint8Array/DataView, interpreter
 *     - CStructUint8Array (codegen)   — model compiled once into a function
 *
 *   struct-compile modes:
 *     - compileFast  — inline `new Function` codecs with constant-offset
 *                      Buffer reads/writes, plain objects (closest analogue
 *                      of cstruct codegen)
 *     - compile      — class with lazy Object.defineProperty getters
 *                      (a different use case: random field access on a
 *                      large record; all fields are touched here)
 *
 * Note on encode fairness: struct-compile `encode` writes into a
 * caller-provided Buffer (no allocation), while cstruct `make` allocates the
 * result. Both variants are measured: preallocated (raw codec throughput)
 * and with `Buffer.allocUnsafe` inside the loop (allocation included).
 *
 * struct-compile is Node-only (requires the Node `Buffer` API) and GPL-3.0
 * licensed. cstruct's DataView variant works in browsers/Deno/Bun.
 *
 * Run: npm run bench:formats:struct-compile
 *      (ts-node --transpile-only benchmarks/formats-bench-struct-compile.ts)
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
        const opsStr = `${fmt(r.opsPerSec)} ops/s`.padStart(18);
        const nsStr = `${r.nsPerOp.toFixed(1)} ns/op`.padStart(12);
        console.log(`  ${r.name.padEnd(34)} ${opsStr} ${nsStr}  x${speedup}`);
    }
}

// ---------------------------------------------------------------- setup

// Same struct as benchmarks/formats-bench.ts:
//   struct Sensor { uint8_t a; int16_t b; uint32_t c; float d; double e; };
//   data = { a: 7, b: -123, c: 123456, d: 1.5, e: 123.456 }
const model = { a: 'u8', b: 'i16', c: 'u32', d: 'f', e: 'd' };
const data = { a: 7, b: -123, c: 123456, d: 1.5, e: 123.456 };

// struct-compile (CJS build; the package is ESM-first with a require export)
const sc = createRequire(__filename)('struct-compile') as {
    compile: (decl: string) => Record<string, new (buffer: Buffer) => Record<string, any>>;
    compileFast: (decl: string) => Record<string, {
        size: number;
        decode: (buffer: Buffer, offset?: number) => Record<string, any>;
        encode: (buffer: Buffer, offset: number, struct: Record<string, any>) => void;
    }>;
};

const cDecl = `
  //@LE
  struct __attribute__((__packed__)) Sensor {
    uint8_t a;
    int16_t b;
    uint32_t c;
    float d;
    double e;
  };
`;
const { Sensor: SensorFast } = sc.compileFast(cDecl);
const { Sensor: SensorClass } = sc.compile(cDecl);

// cstruct — Buffer interpreter
const bufCStruct = new CStruct(model);
const buf = bufCStruct.make(data).buffer;

// cstruct — DataView interpreter
const uvCStruct = CStructUint8Array.fromModelTypes(model);
const bytes = uvCStruct.make(data).bytes;

// cstruct — DataView codegen (compiled once)
const uvMakeFn = uvCStruct.compileMake();
const uvReadFn = uvCStruct.compileRead();

// cstruct — Buffer codegen (CStructLE; uses Buffer.read/write*LE intrinsics —
// the natural like-for-like peer of struct-compile fast mode on Node)
const leCStruct = new CStructLE(model);
const leMakeFn = leCStruct.compileMake();
const leReadFn = leCStruct.compileRead();

// struct-compile — fast mode (caller-provided output buffer)
const scBuf = Buffer.allocUnsafe(SensorFast.size);
SensorFast.encode(scBuf, 0, data);

// struct-compile — class mode (lazy getters over the backing buffer)
const scClsBuf = Buffer.from(scBuf);

// ---------------------------------------------------------------- sanity check

const scFastDecoded = SensorFast.decode(scBuf, 0);
const scCls = new SensorClass(scClsBuf);
const scClassDecoded = { a: scCls.a, b: scCls.b, c: scCls.c, d: scCls.d, e: scCls.e };
const csDecoded = uvReadFn(bytes).struct;
const csLeDecoded = leReadFn(buf).struct;

const same = (a: Record<string, any>, b: Record<string, any>) =>
    ['a', 'b', 'c', 'd', 'e'].every((k) => a[k] === b[k]);
if (!same(data, scFastDecoded) || !same(data, scClassDecoded) || !same(data, csDecoded) || !same(data, csLeDecoded)) {
    throw new Error('round-trip mismatch between cstruct and struct-compile');
}

// ---------------------------------------------------------------- wire size

console.log('Wire size / layout for the same data object:');
console.log(`  cstruct        ${buf.length} bytes  0x${buf.toString('hex')}`);
console.log(`  struct-compile ${scBuf.length} bytes  0x${scBuf.toString('hex')}`);
const identical = Buffer.compare(buf, scBuf) === 0;
console.log(`  layouts identical: ${identical}`);
if (!identical) {
    throw new Error('wire layouts differ — comparison would not be like-for-like');
}

// ---------------------------------------------------------------- encode

printGroup('ENCODE (data -> bytes)', [
    bench('cstruct make (Buffer)', () => { bufCStruct.make(data); }),
    bench('cstruct make (DataView)', () => { uvCStruct.make(data); }),
    bench('cstruct make (Buffer codegen)', () => { leMakeFn(data); }),
    bench('cstruct make (codegen)', () => { uvMakeFn(data); }),
    bench('sc fast encode (prealloc)', () => { SensorFast.encode(scBuf, 0, data); }),
    bench('sc fast encode (allocUnsafe)', () => { const b = Buffer.allocUnsafe(SensorFast.size); SensorFast.encode(b, 0, data); }),
]);

// ---------------------------------------------------------------- decode

let sink = 0; // printed below; prevents the class-lazy path from being optimized away
printGroup('DECODE (bytes -> data)', [
    bench('cstruct read (Buffer)', () => { bufCStruct.read(buf); }),
    bench('cstruct read (DataView)', () => { uvCStruct.read(bytes); }),
    bench('cstruct read (Buffer codegen)', () => { leReadFn(buf); }),
    bench('cstruct read (codegen)', () => { uvReadFn(bytes); }),
    bench('sc fast decode', () => { SensorFast.decode(scBuf, 0); }),
    bench('sc class lazy (all fields)', () => { const o = new SensorClass(scClsBuf); sink += o.a + o.b + o.c + o.d + o.e; }),
]);

// ---------------------------------------------------------------- note

console.log(`\nsink=${sink} (sum of decoded fields; keeps the class-lazy path honest)`);
console.log(`Notes:
- struct-compile fast encode writes into a caller-provided Buffer; cstruct make
  allocates the result. "prealloc" is the raw codec throughput, "allocUnsafe"
  includes allocation like cstruct make does.
- sc class mode decodes lazily per field; all fields are touched here, with a
  sink to keep it honest.
- Both libraries produce the identical packed little-endian wire layout (checked
  above), so the comparison is like-for-like.
- struct-compile is Node-only (Buffer API) and GPL-3.0; cstruct has a
  Uint8Array/DataView variant that runs in browsers, Deno and Bun.
- For JSON/protobuf numbers on the same struct see benchmarks/FORMATS-RESULTS.md.
- Runtime: ${process.versions.node ? 'Node.js ' + process.version : process.versions.bun ? 'Bun ' + process.versions.bun : 'unknown'}.
  Higher ops/s is better.`);