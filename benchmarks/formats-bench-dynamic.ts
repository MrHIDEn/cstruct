import { performance } from 'perf_hooks';
import * as protobuf from 'protobufjs';
import { CStruct, CStructUint8Array } from '../src';

/**
 * Cross-format comparison on VARIABLE-LENGTH data — a length-prefixed string
 * and a length-prefixed array — across @mrhiden/cstruct (3 variants), JSON and
 * Google Protocol Buffers (protobufjs).
 *
 *   // cstruct model
 *   { name: 's[i16]', samples: 'u16[i16]' }
 *   //   name:    i16 length prefix + UTF-8 bytes
 *   //   samples: i16 length prefix + N × u16
 *
 * This is where all three formats agree conceptually: protobuf's `string` and
 * `repeated` fields are inherently length-delimited, and JSON is text. The
 * difference is the wire encoding and decode speed.
 *
 * Run: npx ts-node --transpile-only benchmarks/formats-bench-dynamic.ts
 * Results: benchmarks/FORMATS-RESULTS-DYNAMIC.md
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
    runFor(fn, WARMUP_MS);
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

// Dynamic string + dynamic array (length prefix on the wire).
const model = { name: 's[i16]', samples: 'u16[i16]' };
const data = {
    name: 'sensor-01',
    samples: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
};

// cstruct — Buffer interpreter
const bufCStruct = new CStruct(model);
const buf = bufCStruct.make(data).buffer;

// cstruct — DataView interpreter
const uvCStruct = CStructUint8Array.fromModelTypes(model);
const bytes = uvCStruct.make(data).bytes;

// cstruct — DataView codegen
const uvMakeFn = uvCStruct.compileMake();
const uvReadFn = uvCStruct.compileRead();

// JSON
const jsonStr = JSON.stringify(data);

// protobuf (Google Protocol Buffers)
const Dyn = protobuf.parse(`
  syntax = "proto3";
  message Dyn {
    string name = 1;
    repeated uint32 samples = 2;
  }
`).root.lookupType('Dyn');
const pbBuf = Dyn.encode(data).finish();

// ---------------------------------------------------------------- wire size

console.log('Wire size for the same variable-length message:');
console.log(`  cstruct (binary, i16 length prefixes)  ${buf.length} bytes`);
console.log(`  protobuf (binary, varint length)        ${pbBuf.length} bytes`);
console.log(`  JSON (UTF-8 text)                      ${Buffer.byteLength(jsonStr)} bytes`);
console.log(`\nData: name="sensor-01", samples=[1..20] (20 elements)`);

// ---------------------------------------------------------------- encode

printGroup('ENCODE (data -> bytes/string)', [
    bench('cstruct make (Buffer)', () => { bufCStruct.make(data); }),
    bench('cstruct make (DataView)', () => { uvCStruct.make(data); }),
    bench('cstruct make (codegen)', () => { uvMakeFn(data); }),
    bench('JSON.stringify', () => { JSON.stringify(data); }),
    bench('protobuf encode', () => { Dyn.encode(data).finish(); }),
]);

// ---------------------------------------------------------------- decode

printGroup('DECODE (bytes/string -> data)', [
    bench('cstruct read (Buffer)', () => { bufCStruct.read(buf); }),
    bench('cstruct read (DataView)', () => { uvCStruct.read(bytes); }),
    bench('cstruct read (codegen)', () => { uvReadFn(bytes); }),
    bench('JSON.parse', () => { JSON.parse(jsonStr); }),
    bench('protobuf decode', () => { Dyn.decode(pbBuf); }),
]);

// ---------------------------------------------------------------- note

console.log(`\nNotes:
- cstruct reads return a plain object with the string and the number array;
  protobuf decode() returns a Message (repeated field as a JS array; add
  .toObject() for a plain object); JSON.parse returns a plain object.
- All three formats are length-delimited here — the comparison is about the wire
  encoding (i16 prefix vs varint vs text) and decode speed.
- Runtime: ${process.versions.node ? 'Node.js ' + process.version : 'unknown'}.
  Higher ops/s is better; wire bytes is smaller-is-better.`);
