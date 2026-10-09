import { performance } from 'perf_hooks';
import * as protobuf from 'protobufjs';
import { CStruct, CStructUint8Array } from '../src';

/**
 * Cross-format comparison on a COMPLEX (realistic) message — nested struct,
 * fixed array and a string — across @mrhiden/cstruct (3 variants), JSON and
 * Google Protocol Buffers (protobufjs).
 *
 *   struct Sensor {
 *     uint8_t  id;
 *     uint16_t type;
 *     uint32_t seq;
 *     float    temp;
 *     struct   { int16_t x; int16_t y; int16_t z; } pos;   // nested
 *     uint16_t samples[8];                                   // fixed array
 *     char     name[16];                                     // fixed string
 *   };
 *
 * Run: npx ts-node --transpile-only benchmarks/formats-bench-complex.ts
 * Results: benchmarks/FORMATS-RESULTS-COMPLEX.md
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

const model = {
    id: 'u8',
    type: 'u16',
    seq: 'u32',
    temp: 'f',
    pos: { x: 'i16', y: 'i16', z: 'i16' },
    samples: 'u16[8]',
    name: 's16',
};

const data = {
    id: 42,
    type: 0x1234,
    seq: 1_000_000,
    temp: 36.6,
    pos: { x: -10, y: 20, z: -30 },
    samples: [1, 2, 3, 4, 5, 6, 7, 8],
    name: 'sensor-01',
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
const Sensor = protobuf.parse(`
  syntax = "proto3";
  message Position {
    int32 x = 1;
    int32 y = 2;
    int32 z = 3;
  }
  message Sensor {
    uint32 id = 1;
    uint32 type = 2;
    uint32 seq = 3;
    float  temp = 4;
    Position pos = 5;
    repeated uint32 samples = 6;
    string name = 7;
  }
`).root.lookupType('Sensor');
const pbBuf = Sensor.encode(data).finish();

// ---------------------------------------------------------------- wire size

console.log('Wire size for the same complex message:');
console.log(`  cstruct (binary, fixed)  ${buf.length} bytes`);
console.log(`  protobuf (binary, varint) ${pbBuf.length} bytes`);
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
- cstruct reads return a plain object (nested pos, fixed array, string stripped
  of trailing nulls); protobuf decode() returns a Message instance (nested pos
  is a Message too — add .toObject() for a plain object); JSON.parse returns a
  plain object.
- cstruct has a fixed 49-byte layout; protobuf is variable (varint + repeated
  length-delimited); JSON is text and the largest.
- Runtime: ${process.versions.node ? 'Node.js ' + process.version : 'unknown'}.
  Higher ops/s is better; wire bytes is smaller-is-better.`);
