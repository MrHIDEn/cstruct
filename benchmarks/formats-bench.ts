import { performance } from 'perf_hooks';
import * as protobuf from 'protobufjs';
import { CStruct, CStructUint8Array } from '../src';

/**
 * Cross-format comparison: @mrhiden/cstruct (3 variants) vs JSON vs
 * Protocol Buffers (protobufjs) — encode (make/stringify/encode) and decode
 * (read/parse/decode) throughput plus wire size.
 *
 *   cstruct variants:
 *     - CStruct (Buffer)              — Node Buffer, interpreter (walk model)
 *     - CStructUint8Array (DataView)  — Uint8Array/DataView, interpreter
 *     - CStructUint8Array (codegen)   — model compiled once into a function
 *
 *   references:
 *     - JSON           — native JSON.stringify / JSON.parse (text, no schema)
 *     - protobuf       — Google Protocol Buffers via protobufjs (binary, varint)
 *
 * Wire format note: these are different formats. cstruct lays fields back-to-back
 * (fixed size); protobuf uses tagged varint/fixed fields; JSON is UTF-8 text.
 * The "wire bytes" column shows the encoded size for the SAME data object.
 *
 * Run: npx ts-node --transpile-only benchmarks/formats-bench.ts
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

// Fixed-size struct — all fields always present, comparable across formats.
const model = { a: 'u8', b: 'i16', c: 'u32', d: 'f', e: 'd' };
const data = { a: 7, b: -123, c: 123456, d: 1.5, e: 123.456 };

// cstruct — Buffer interpreter
const bufCStruct = new CStruct(model);
const buf = bufCStruct.make(data).buffer;

// cstruct — DataView interpreter
const uvCStruct = CStructUint8Array.fromModelTypes(model);
const bytes = uvCStruct.make(data).bytes;

// cstruct — DataView codegen (compiled once)
const uvMakeFn = uvCStruct.compileMake();
const uvReadFn = uvCStruct.compileRead();

// JSON
const jsonStr = JSON.stringify(data);

// protobuf (Google Protocol Buffers)
const Sensor = protobuf.parse(`
  syntax = "proto3";
  message Sensor {
    uint32 a = 1;
    int32  b = 2;
    uint32 c = 3;
    float  d = 4;
    double e = 5;
  }
`).root.lookupType('Sensor');
const pbBuf = Sensor.encode(data).finish();

// ---------------------------------------------------------------- wire size

console.log('Wire size for the same data object:');
console.log(`  cstruct (binary, fixed)  ${buf.length} bytes`);
console.log(`  protobuf (binary, varint) ${pbBuf.length} bytes  (int32 -123 -> 10-byte varint)`);
console.log(`  JSON (UTF-8 text)        ${Buffer.byteLength(jsonStr)} bytes`);
console.log(`\nData: ${JSON.stringify(data)}`);

// ---------------------------------------------------------------- encode

printGroup('ENCODE (data -> bytes/string)', [
    bench('cstruct make (Buffer)', () => { bufCStruct.make(data); }),
    bench('cstruct make (DataView)', () => { uvCStruct.make(data); }),
    bench('cstruct make (codegen)', () => { uvMakeFn(data); }),
    bench('JSON.stringify', () => { JSON.stringify(data); }),
    bench('protobuf encode', () => { Sensor.encode(data).finish(); }),
]);

// ---------------------------------------------------------------- decode

printGroup('DECODE (bytes/string -> data)', [
    bench('cstruct read (Buffer)', () => { bufCStruct.read(buf); }),
    bench('cstruct read (DataView)', () => { uvCStruct.read(bytes); }),
    bench('cstruct read (codegen)', () => { uvReadFn(bytes); }),
    bench('JSON.parse', () => { JSON.parse(jsonStr); }),
    bench('protobuf decode', () => { Sensor.decode(pbBuf); }),
]);

// ---------------------------------------------------------------- note

console.log(`\nNotes:
- cstruct reads return a plain object with all fields; protobuf decode() returns
  a Message instance (add .toObject() if you need a plain object). JSON.parse
  returns a plain object.
- JSON has no schema and is native, so it's fast — but ~2.5x larger on the wire
  and loses type info (everything is a JS number/string).
- protobuf varint is compact for small positive ints but 32-bit negatives are
  10 bytes; cstruct is fixed-size and predictable.
- Runtime: ${process.versions.node ? 'Node.js ' + process.version : process.versions.bun ? 'Bun ' + process.versions.bun : 'unknown'}.
  Higher ops/s is better; wire bytes is smaller-is-better.`);
