# @mrhiden/cstruct
[![NPM version](https://img.shields.io/npm/v/@mrhiden/cstruct.svg)](https://www.npmjs.com/package/@mrhiden/cstruct)
[![NPM downloads](https://img.shields.io/npm/dm/@mrhiden/cstruct.svg)](https://www.npmjs.com/package/@mrhiden/cstruct)
[![License](https://img.shields.io/npm/l/@mrhiden/cstruct.svg)](https://github.com/MrHIDEn/cstruct/blob/main/LICENSE)
[![build](https://github.com/MrHIDEn/cstruct/actions/workflows/lint-test.yml/badge.svg)](https://github.com/MrHIDEn/cstruct/actions/workflows/lint-test.yml)

## *'C like structures'* — TypeScript library for packing and unpacking binary data (`Buffer` ⇔ Object/Array).

If you only need to pack a plain object into a buffer — **Quick start** is enough. Dynamic arrays, enums, decorators, PLC aliases, and C-struct parsing are optional paths in [Examples](doc/EXAMPLES.md).

## Table of contents
- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [Concepts](#concepts)
- [Examples](#examples)
  - [Dynamic array (length on the wire)](#dynamic-array-length-on-the-wire)
  - [Enum values (named states)](#enum-values-named-states)
  - [Straight from C (`typedef struct`)](#straight-from-c-typedef-struct)
- [Endianness & more](#endianness--more)
- [Browser & Deno (`CStructUint8Array`)](#browser--deno-cstructuint8array)
- [Data types reference](#data-types-reference)
- [More examples](#more-examples)
- [Changelog](#changelog)
- [TODO](#todo)
- [Contact](#contact)

## Features
* Read/make/write buffer, **Buffer <=> Object/Array**
* Pack / unpack, compress / decompress data to minimize size.
* Convert buffer of **struct/array** to TypeScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
* Little endian - LE
* Big endian - BE
* TypeScript's decorators for classes and properties
* **Browser-ready path**: `CStructUint8Array` — `Uint8Array`/`DataView` instead of Node `Buffer` (works in browsers, Deno, Bun, Node)

## Install
```bash
npm i @mrhiden/cstruct
```

## Quick start

Precompile a model once, then `make` and `read` as many times as you need:

```c
// typedef struct {
//   uint16_t a;
//   int16_t  b;
// } Pair;
// Pair pair = { 10, -10 };
```

```javascript
const { CStruct, AtomTypes } = require('@mrhiden/cstruct');
const { U16, I16 } = AtomTypes; // or use 'u16', 'i16' as strings

const model = { a: U16, b: I16 }; // = { a: 'u16', b: 'i16' }
const cStruct = new CStruct(model); // default: little endian

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 0a00f6ff

const result = cStruct.read(buffer);
console.log(result.struct);
// { a: 10, b: -10 }
```

Same cycle in TypeScript with string atom types:

```typescript
import { CStruct } from '@mrhiden/cstruct';

const model = { a: 'u16', b: 'i16' };
const cStruct = new CStruct(model); // default: little endian

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 0a00f6ff

const result = cStruct.read(buffer);
console.log(result.struct);
// { a: 10, b: -10 }
```

## Concepts

The main idea: create a model of your data structure, precompile it into a `CStruct` object, then use that object to read from and write to buffers.

| Class | Endianness |
|-------|------------|
| `CStruct` | **default** — little endian, option `{ endian: 'be' }` for big endian |
| `CStructLE` | Little Endian (explicit) |
| `CStructBE` | Big Endian (explicit) |

All three share the same methods and functionality.

- **Dynamic API** — Object/Array/String model and types (`fromModelTypes`, `fromCompiled`)
- **Static API** — TypeScript decorators on classes (`@CStructClass`, `@CStructProperty`)

**MAKE** — creates a new buffer from data:<br>
`make(struct: T): CStructWriteResult` → `{ buffer, offset, size }`

**WRITE** — writes into an existing buffer (optional start offset):<br>
`write(buffer: Buffer, struct: T, offset?: number): CStructWriteResult`

**READ** — reads from an existing buffer (optional start offset):<br>
`read<T>(buffer: Buffer, offset?: number): CStructReadResult<T>` → `{ struct, offset, size }`

**OFFSET** — pin read/write to any position in the buffer so you can split frames into parts.

**DECORATORS** — `@CStructClass` defines model/types for a class; `@CStructProperty` defines a property type.<br>
When `@CStructClass` is used with `{ model: ... }` it can override `@CStructProperty` decorators.

```text
  model + types ──► new CStruct(model, types, { endian })   /  CStruct.fromCompiled(jsonModel)
                              │
                              ▼
                     CStruct instance (parsedModel cached)
                              │
          ┌───────────────────┼────────────────────┐
          ▼                   ▼                    ▼
   make(data)          write(buf, data, off)   read(buf, off)
   data ─► new Buffer  data ─► existing Buffer  Buffer ─► data
          │                   │                    ▲
          └───────────────────┴──── bytes ─────────┘
```

---

## Examples

The wire format is described by a **model** — a plain object. Each example below starts with the C declaration it encodes. The full set (codegen, decorators, PLC, strings, buffers, …) lives in [`doc/EXAMPLES.md`](doc/EXAMPLES.md).

### Dynamic array (length on the wire)

```c
// typedef struct {
//   uint8_t  count;           // number of samples on the wire
//   uint16_t samples[count];  // count × u16
// } SampleBatch;
// SampleBatch batch = { 2, { 0x0a, 0x0b } };
```

```typescript
import { CStruct } from '@mrhiden/cstruct';

const cStruct = new CStruct({ 'samples.u8': 'u16' }, { endian: 'be' });

const { buffer } = cStruct.make({ samples: [0x0a, 0x0b] });
console.log(buffer.toString('hex'));
// 02000a000b  — count is the length prefix, written automatically

const { struct } = cStruct.read(Buffer.from('02000a000b', 'hex'));
console.log(struct);
// { samples: [ 10, 11 ] }  — count is read from the buffer
```

### Enum values (named states)

```c
// typedef struct {
//   uint8_t device_id;
//   uint8_t state;  // 1 = IDLE, 2 = RUNNING, 3 = FAULT
// } DeviceStatus;
// DeviceStatus dev = { 0x11, 2 };
```

```typescript
import { CStruct } from '@mrhiden/cstruct';

const cStruct = new CStruct({
    device_id: 'u8',
    state: { type: 'u8', enum: { 1: 'IDLE', 2: 'RUNNING', 3: 'FAULT' } },
}, { endian: 'be' });

const { buffer } = cStruct.make({ device_id: 0x11, state: 'RUNNING' });
console.log(buffer.toString('hex'));
// 1102

const { struct } = cStruct.read(buffer);
console.log(struct);
// { device_id: 17, state: 'RUNNING' }  — names, not raw numbers

// Unknown raw values pass through unchanged — like C enums:
console.log(cStruct.read(Buffer.from('112a', 'hex')).struct);
// { device_id: 17, state: 42 }
```

### Straight from C (`typedef struct`)

You can paste a C declaration as-is — the parser understands `typedef struct`, C-kind fields (`u8 a,b;`), and comments:

```c
// typedef struct {
//   uint8_t x;
//   uint8_t y;
//   uint8_t z;
// } Vec3;   ← this exact text can be your `types`
```

```typescript
import { CStruct } from '@mrhiden/cstruct';

const types = `{
    typedef struct {
        uint8_t x;
        uint8_t y;
        uint8_t z;
    } Vec3;
}`;

const cStruct = new CStruct({ point: 'Vec3' }, types);

const { buffer } = cStruct.make({ point: { x: 1, y: 2, z: 3 } });
console.log(buffer.toString('hex'));
// 010203

const { struct } = cStruct.read(buffer);
console.log(struct);
// { point: { x: 1, y: 2, z: 3 } }
```

## Endianness & more

All examples above pass options to `CStruct` — by default it is **little endian**; when your protocol is big endian, pass `{ endian: 'be' }`:

```typescript
import { CStruct } from '@mrhiden/cstruct';

const cStruct = new CStruct(model, { endian: 'be' }); // or CStruct.fromModelTypes(model, types, { endian: 'be' })
```

If you prefer explicit classes, `CStructLE` and `CStructBE` take the same `{ endian }`-free API — pick the class instead of the option. Precompiled models: `CStruct.fromCompiled(jsonModel, { endian: 'be' })`.

More examples — write into an existing buffer, codegen, decorators, PLC aliases, strings, buffers, dynamic length — live in [`doc/EXAMPLES.md`](doc/EXAMPLES.md).

## Browser & Deno (`CStructUint8Array`)

`CStruct` / `CStructLE` / `CStructBE` are built on Node's `Buffer`. If you need the library in a **browser**, **Deno** or anywhere without `Buffer`, use `CStructUint8Array` — same model syntax, same API shape, but it works on plain `Uint8Array`/`DataView` and returns plain `Uint8Array` (no `Buffer`):

```javascript
const { CStructUint8Array } = require('@mrhiden/cstruct');

const model = { a: 'u16', b: 'i16' };
const cStruct = new CStructUint8Array(model); // default: little endian

const data = { a: 10, b: -10 };
const { bytes } = cStruct.make(data);
console.log(bytes); // Uint8Array(4) [10, 0, 246, 255]

const result = cStruct.read(bytes);
console.log(result.struct); // { a: 10, b: -10 }
```

Write into an existing `Uint8Array`, choose endianness and compile for throughput:

```javascript
// big endian wire format
const cStructBE = new CStructUint8Array(model, { endian: 'be' });

// write into an existing Uint8Array at offset
cStruct.write(bytes, data, 0);

// precompiled, hot path
const readFn = cStruct.compileRead();
const struct = readFn(bytes).struct;
```

Available factories mirror the `Buffer` classes: `CStructUint8Array.fromModelTypes(model, types, options)`, `CStructUint8Array.fromCompiled(jsonModel, options)` and static `CStructUint8Array.compileRead/compileWrite/compileMake(model, types, options)`.

Performance note: the `Uint8Array`/`DataView` codegen is somewhat slower than the Node-only `Buffer` codegen (~x1.6–3.0, see [`doc/BENCHMARKS-RUNTIMES.md`](doc/BENCHMARKS-RUNTIMES.md)) — that is the price of portability.

## Data types reference

<details>
<summary><strong>Atom types and aliases</strong> (full table)</summary>

| Atom | Type               | Size [B] | Aliases                                     | Notes |
|------|--------------------|----------|---------------------------------------------|-------|
| b8   | boolean            | 1        | bool8 bool               BOOL               |       |
| b16  | boolean            | 2        | bool16                                      |       |
| b32  | boolean            | 4        | bool32                                      |       |
| b64  | boolean            | 8        | bool64                                      |       |
| u8   | unsigned char      | 1        | uint8  uint8_t           BYTE               |       |
| u16  | unsigned int       | 2        | uint16 uint16_t          WORD               |       |
| u32  | unsigned long      | 4        | uint32 uint32_t          DWORD              |       |
| u64  | unsigned long long | 8        | uint64 uint64_t          LWORD QWORD        |       |
| i8   | signed char        | 1        | int8  int8_t             SINT               |       |
| i16  | signed int         | 2        | int16 int16_t            INT                |       |
| i32  | signed long        | 4        | int32 int32_t            DINT               |       |
| i64  | signed long long   | 8        | int64 int64_t            LINT QINT          |       |
| f    | float              | 4        | float  float32 float32_t single REAL  F F32 |       |
| d    | double             | 4        | double float64 float64_t        LREAL D F64 |       |
| sN   | string             | N        | string                                      | N= 0+ |
| wsN  | wstring (UTF-16LE) | N * 2    | wstring                  WS WSTR WSTRING    | N= 0+ |
| bufN | buffer             | N        | buffer                   BUF BUFFER         | N= 1+ |
| jN   | json               | N        | json any                 J JSON ANY         | N= 0+ |

See also [`doc/DATA_TYPES.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/DATA_TYPES.md).

</details>

## More examples

Detailed walkthroughs (codegen, decorators, PLC, C-struct parsing, strings, buffers, dynamic length) live in [`doc/EXAMPLES.md`](doc/EXAMPLES.md).

Runnable scripts live in [`/examples`](https://github.com/MrHIDEn/cstruct/tree/main/examples). Build first (`npm run build`), then `npx ts-node examples/<file>.ts`.

| File | Topic |
|------|-------|
| [`simple-model.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/simple-model.ts) | Basic make/read, offset, write |
| [`little-endian.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/little-endian.ts) | BE vs LE side-by-side |
| [`cstruct-default.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/cstruct-default.ts) | `CStruct` class with `{ endian }` option |
| [`from-compiled.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/from-compiled.ts) | Precompiled `jsonModel` / `fromCompiled` |
| [`codegen.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/codegen.ts) | Compiled functions (`compileRead` / `compileWrite` / `compileMake`) |
| [`write-offset.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/write-offset.ts) | `make` vs `write` with offset |
| [`with-buffer.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/with-buffer.ts) | `bufN` binary fields |
| [`wstring.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/wstring.ts) | UTF-16LE wide strings |
| [`dynamic-model.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/dynamic-model.ts) | Dynamic arrays and strings |
| [`decorators.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/decorators.ts) | Class decorators |
| [`c-struct-types.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/c-struct-types.ts) | C `typedef struct` |
| [`plc.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/plc.ts) | PLC aliases |
| [`JS-from-model-types.js`](https://github.com/MrHIDEn/cstruct/blob/main/examples/JS-from-model-types.js) | JavaScript (CommonJS) |

Full index: [`examples/README.md`](https://github.com/MrHIDEn/cstruct/blob/main/examples/README.md).

## Changelog

### What's new in 1.8.1
* Added `CStructUint8Array` — browser-ready serialization on `Uint8Array`/`DataView` (no Node `Buffer`): same model syntax, `read`/`write`/`make`, `compileRead`/`compileWrite`/`compileMake`, `fromModelTypes`/`fromCompiled` and `{ endian: 'be' }` option
* Performance: interpreter (`read` / `write` / `make`) reuses reader/writer instances per `CStruct` (new `reset()` / `run()` on reader/writer classes) — ~15× faster interpreter (up to 2–3.5M ops/s)
* Benchmarks: full audit of `doc/BENCHMARKS-*.md` — all tables re-measured in one parallel Node/Bun/Deno session; added `CStruct (Buffer codegen)` column; `npm run bench:node` / `bench:bun` / `bench:deno`
* New [`doc/BENCHMARKS-DENO.md`](doc/BENCHMARKS-DENO.md)

### What's new in 1.7.3
* README: text diagrams for endianness (BE vs LE), data flow (`make` / `write` / `read`), `write` with offset, trailing zero (`s[0]`, `j[0]`), dynamic length (`Ab[i16]`) and wstring (UTF-16LE)
* `package.json`: extended `keywords` and `description` to make the package easier to find on npm (no runtime changes)

### What's new in 1.7.2
* Fixed publish hook: `prepublishOnly` runs `tsc` before `npm publish` (replaces deprecated `prepublish`, which no longer builds on publish)

### What's new in 1.7.1
* Codegen fixes: correct dynamic `j[i16]` / `s[i16]` length prefixes, `compileWrite` validates buffer size before writing, bracket notation for model field access (safer `new Function` codegen)
* Optimized dynamic `compileMake` — size precompute + single `allocUnsafe` (~×41 vs interpreter on dynamic make)
* Added `npm run bench:bun`, [`doc/BENCHMARKS-BUN.md`](doc/BENCHMARKS-BUN.md), [`doc/BENCHMARKS-RUNTIMES.md`](doc/BENCHMARKS-RUNTIMES.md) (Node vs Bun comparison)

### What's new in 1.7.0
* Added `compileRead`, `compileWrite`, `compileMake` on `CStructBE` and `CStructLE` — compile a model once into specialized functions for high-throughput read/write/make
* Instance methods `cStruct.compileRead()` / `compileWrite()` / `compileMake()` use cached `parsedModel`
* `compileMake` uses single `allocUnsafe` for fully static models; for variable-length fields it precomputes size then allocates once (no `concat`)
* Added [`examples/codegen.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/codegen.ts) and README section [Compiled functions](#compiled-functions-codegen)
* Added `npm run bench` / `npm run bench:bun` and [`doc/BENCHMARKS-NODE.md`](doc/BENCHMARKS-NODE.md) / [`doc/BENCHMARKS-BUN.md`](doc/BENCHMARKS-BUN.md) / [`doc/BENCHMARKS-RUNTIMES.md`](doc/BENCHMARKS-RUNTIMES.md) with sample throughput

### What's new in 1.6.2
* Modernized dev stack: ESLint 9 (flat config), typescript-eslint 8, TypeScript 5.9, @types/node 20
* Fixed security vulnerabilities in devDependencies (`npm audit fix`)
* No API or runtime changes (zero production dependencies)

### What's new in 1.6.1
* **Immutable schema (read path):** `read` no longer mutates the compiled model — it builds a fresh result tree via `readSchema`
* **Cached `parsedModel`:** the compiled model is parsed once in the constructor and reused across `read`, `write`, and `make` (eliminates `JSON.parse` per operation)
* Added getter `parsedModel` — returns the cached compiled model object
* **`modelClone` behavior:** now returns the same cached schema reference as `parsedModel` (do not mutate in place)

### What's new in 1.6.0
* Added `CStructBE.fromCompiled(jsonModel)` and `CStructLE.fromCompiled(jsonModel)` — load a precompiled model without running `ModelParser.parseModel`
* Added [`examples/from-compiled.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/from-compiled.ts) and README section [Precompiled models](#precompiled-models-fromcompiled)
* Documented that `jsonModel` must be treated as a trusted build-time artifact (do not load from untrusted sources)

### What's new in 1.5.5
* Reorganized README into Basic / Advanced / Specialized paths with TOC and Quick start
* Added examples for LE, write+offset, `bufN`, and `wstring`; added `examples/README.md` index

### What's new in 1.5
* Added support for wstring (UTF-16LE) type. Thanks to [Sorunome](https://github.com/Sorunome).<br>
  For wstring/utf16le trailing character is/must be 16bit zero `'\u0000'`.

### What's new in 1.4
* Added predefined types
* Added predefined aliases
* Fixed issue in one function where we use endian BE → LE
* Added more tests to cover that issue and predefined types

## TODO

See [`doc/TODO.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/TODO.md).

## Contact

If you have any questions or suggestions, please contact me at<br>
[mrhiden@outlook.com](mailto:mrhiden@outlook.com)
