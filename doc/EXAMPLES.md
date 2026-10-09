# Examples

Full set of examples moved out of the main README — runnable scripts live in [`/examples`](../examples). All snippets below use `@mrhiden/cstruct`.

## Table of contents

- [Basic usage](#basic-usage-objects--strings)
  - [Endianness (BE vs LE)](#endianness-be-vs-le)
  - [Precompiled models (`fromCompiled`)](#precompiled-models-fromcompiled)
  - [Compiled functions (codegen)](#compiled-functions-codegen)
  - [Nested types and AtomTypes](#nested-types-and-atomtypes)
  - [Make and read with nested fields](#make-and-read-with-nested-fields)
  - [Write into an existing buffer](#write-into-an-existing-buffer)
  - [Enum values (`{ type, enum }`)](#enum-values-type-enum)
  - [Binary buffer field (`bufN`)](#binary-buffer-field-bufn)
  - [Wide string (`wstring` / `wsN`)](#wide-string-wstring--wsn)
  - [Named types (IoT-style)](#named-types-iot-style)
  - [String-based model and types](#string-based-model-and-types)
  - [Dynamic length](#dynamic-length)
  - [Trailing zero (`s[0]`, `j[0]`, …)](#trailing-zero-s0-j0-)

## Basic usage (objects & strings)

Start here for plain models. No classes or decorators required.

### Endianness (BE vs LE)

Same model and data — only the endian class changes the wire format:

```typescript
import { CStructBE, CStructLE } from '@mrhiden/cstruct';

const model = { a: 'u16', b: 'i16' };
const data = { a: 10, b: -10 };

const beHex = CStructBE.fromModelTypes(model).make(data).buffer.toString('hex');
const leHex = CStructLE.fromModelTypes(model).make(data).buffer.toString('hex');

console.log(beHex); // 000afff6
console.log(leHex); // 0a00f6ff
```

```text
Model: { a: 'u16', b: 'i16' }   data: { a: 10, b: -10 }

CStructBE (big endian, MSB first)
  byte:   0    1    2    3
        ┌────┬────┬────┬────┐
        │ 00 │ 0A │ FF │ F6 │
        └────┴────┴────┴────┘
          a = 10    b = -10

CStructLE (little endian, LSB first)
  byte:   0    1    2    3
        ┌────┬────┬────┬────┐
        │ 0A │ 00 │ F6 │ FF │
        └────┴────┴────┴────┘
          a = 10    b = -10
```

See also [`examples/little-endian.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/little-endian.ts).

### Precompiled models (`fromCompiled`)

Compile a model once (e.g. at build time), save the `jsonModel` string, and load it at runtime without running `ModelParser` again:

```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Build time: compile and persist jsonModel
const compiled = CStructBE.fromModelTypes({ a: 'u16', b: 'i16' });
const jsonModel = compiled.jsonModel; // e.g. save to a file or constant

// Runtime: load precompiled model
const cStruct = CStructBE.fromCompiled(jsonModel);

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;
console.log(cStruct.read(buffer).struct);
// { a: 10, b: -10 }
```

`fromCompiled` accepts a JSON string or a parsed object/array (the same shape as `jsonModel`). See [`examples/from-compiled.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/from-compiled.ts).

**Security note:** Treat `jsonModel` as a **trusted build-time artifact** (same trust level as your own source code). `fromCompiled` only checks that the input is valid JSON (object or array) — it does **not** re-run `ModelParser` and does **not** limit size or nesting depth. Do not load `jsonModel` from untrusted sources (user upload, arbitrary URL, unverified remote config): a malicious payload can cause high memory/CPU use (`JSON.parse` on a huge or deeply nested document). Prefer compiling with `fromModelTypes` in your build and shipping the resulting string as a constant or a file you control.

### Compiled functions (codegen)

For hot loops (thousands of buffers per second), compile the model once into specialized functions via `new Function`. The result matches `read` / `write` / `make`, but skips walking the model tree on every call.

```typescript
import { CStructLE } from '@mrhiden/cstruct';

const model = { x: 'u16', y: 'i32', flag: 'b8' };

// Compile once at startup
const readFrame  = CStructLE.compileRead(model);
const writeFrame = CStructLE.compileWrite(model);
const makeFrame  = CStructLE.compileMake(model);

// Use many times
const buf = makeFrame({ x: 13, y: -7, flag: true }).buffer;
const { struct } = readFrame(buf, 0);
writeFrame({ x: 1, y: 2, flag: false }, buf, 0);
```

Instance methods compile from the cached `parsedModel` (no second `parseModel`):

```typescript
const cStruct = CStructLE.fromModelTypes(model);
const readFn = cStruct.compileRead();
```

Works on `CStructBE` and `CStructLE`. For precompiled models: `CStructLE.fromCompiled(jsonModel).compileRead()`.

**When to use:** high-throughput parsing/serialization with a fixed model. **When not to:** occasional calls — regular `read`/`make` is simpler.

**Security note:** `compile*` uses `new Function` with a model you provide. Use only **trusted** models (your own source or build-time artifacts), not untrusted user input.

See [`examples/codegen.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/codegen.ts). Benchmarks on MacBook M4 Pro: [`doc/BENCHMARKS-NODE.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/BENCHMARKS-NODE.md) (Node), [`doc/BENCHMARKS-BUN.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/BENCHMARKS-BUN.md) (Bun), [`doc/BENCHMARKS-RUNTIMES.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/BENCHMARKS-RUNTIMES.md) (Node vs Bun). Run `npm run bench:node` or `npm run bench:bun`.

### Nested types and AtomTypes

```javascript
const { CStructBE, AtomTypes } = require('@mrhiden/cstruct');
const { U16, I16, STRING } = AtomTypes;

const types = {
    Sensor: { id: U16, value: I16 },
};
const model = {
    iotName: STRING(0), // 's0'
    sensors: 'Sensor[2]',
};
const cStruct = CStructBE.fromModelTypes(model, types);

const data = {
    iotName: 'iot-1',
    sensors: [
        { id: 1, value: -10 },
        { id: 2, value: -20 },
    ],
};
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 696f742d31000001fff60002ffec

const result = cStruct.read(buffer);
console.log(result.struct);
// { iotName: 'iot-1', sensors: [ { id: 1, value: -10 }, { id: 2, value: -20 } ] }
```

### Make and read with nested fields

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const cStruct = CStructBE.fromModelTypes({ error: { code: 'u16', message: 's20' } });

const { buffer, offset, size } = cStruct.make({ error: { code: 10, message: 'xyz' } });

console.log(buffer.toString('hex'));
// 000a78797a0000000000000000000000000000000000
console.log(offset); // 22
console.log(size);   // 22
```

```typescript
import { CStructBE, hexToBuffer } from '@mrhiden/cstruct';

const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
const cStruct = CStructBE.fromModelTypes({ error: { code: 'u16', message: 's20' } });

const { struct, offset, size } = cStruct.read(buffer);
console.log(struct);
// { error: { code: 15, message: 'abc' } }
console.log(offset); // 17
console.log(size);   // 17
```

### Write into an existing buffer

`make` allocates a new buffer. `write` patches data into a buffer you already have — useful for frames with headers, footers, or reserved slots.

```typescript
import { CStructBE, hexToBuffer } from '@mrhiden/cstruct';

const frame = hexToBuffer('111111 22222222222222222222222222222222222222222222 333333');
const cStruct = CStructBE.fromModelTypes({ error: { code: 'u16', message: 's20' } });

const { buffer, offset, size } = cStruct.write(
    frame,
    { error: { code: 0x44, message: 'xyz' } },
    3 // start writing at byte 3
);

console.log(buffer.toString('hex'));
// 111111004478797a00000000000000000000000000000000333333
console.log(offset); // 25
console.log(size);   // 22
```

See also [`examples/write-offset.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/write-offset.ts).

```text
write(frame, { code: 0x44, message: 'xyz' }, 3)

frame (28 bytes):
  [ 11 11 11 ][ 00 44 78 79 7A 00 ... 00 ][ 33 33 33 ]
   bytes 0-2   bytes 3-24 (22 bytes)        bytes 25-27
   header      overwritten by write()       footer
   (kept)      code=0x44, message="xyz"     (kept)
```

### Enum values (`{ type, enum }`)

Raw wire values can be mapped to names with an enum model — an object with `type` (the wire atom type) and `enum` (raw value → name). On `read` you get names, on `make`/`write` you can pass a name or a raw value. Raw values not present in the map pass through unchanged.

```typescript
// typedef struct {
//   uint8_t device_id;
//   uint8_t state;  // 1 = IDLE, 2 = RUNNING, 3 = FAULT
// } DeviceStatus;
// DeviceStatus dev = { 0x11, 2 };

import { CStructBE } from '@mrhiden/cstruct';

const cStruct = CStructBE.fromModelTypes({
    device_id: 'u8',
    state: { type: 'u8', enum: { 1: 'IDLE', 2: 'RUNNING', 3: 'FAULT' } },
});

const { buffer } = cStruct.make({ device_id: 0x11, state: 'RUNNING' });
console.log(buffer.toString('hex'));
// 1102

const { struct } = cStruct.read(buffer);
console.log(struct);
// { device_id: 17, state: 'RUNNING' }

// Unknown raw values pass through unchanged — like C enums:
const { struct: raw } = cStruct.read(Buffer.from([0x11, 0x2a]));
console.log(raw);
// { device_id: 17, state: 42 }
```

Enums work in nested structs, static and dynamic arrays of enums (`{ 'states.u8': { type: 'u8', enum: {...} } }`). They are **not yet supported in compiled functions** (`compileRead` / `compileWrite` / `compileMake`) — those throw a clear error; use `read` / `make` instead.

---

### Binary buffer field (`bufN`)

Use `bufN` (or `buffer`, `BUF`) for raw binary blobs with a fixed size. Values are Node `Buffer` objects.

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const cStruct = CStructBE.fromModelTypes(`{ cnt: i16, buf: buf10 }`);

const { buffer } = cStruct.make({
    cnt: 15,
    buf: Buffer.from('ABCD'),
});

console.log(buffer.toString('hex'));
// 000f41424344000000000000

const { struct } = cStruct.read(buffer);
console.log(struct.buf); // <Buffer 41 42 43 44 00 00 00 00 00 00>
```

See also [`examples/with-buffer.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/with-buffer.ts).

### Wide string (`wstring` / `wsN`)

`wsN` stores UTF-16LE text. Each character is 2 bytes; fixed `ws5` reserves 5 code units (10 bytes). Trailing zero uses `ws[0]` or `ws0` — terminator is 16-bit `'\u0000'`.

```typescript
import { CStructLE } from '@mrhiden/cstruct';

const cStruct = CStructLE.fromModelTypes({ label: 'ws5' });

const { buffer } = cStruct.make({ label: 'abc' });
console.log(buffer.toString('hex'));
// 61006200630000000000

const { struct } = cStruct.read(buffer);
console.log(struct);
// { label: 'abc' }
```

See also [`examples/wstring.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/wstring.ts).

```text
Model: { label: 'ws5' } (CStructLE)   data: 'abc'   total: 5 units = 10 bytes

  char:     a         b         c       zero      zero
  bytes:  61 00     62 00     63 00     00 00     00 00

  each unit = 2 bytes, low byte first: 'a' = U+0061 -> 61 00
```

### Named types (IoT-style)

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const types = {
  Sensor: {
    id: 'u32',
    type: 'u8',
    value: 'd',
    timestamp: 'u64',
  }
};
const iotModel = {
  iotName: 's20',
  sensor: 'Sensor',
};

const sender = CStructBE.fromModelTypes(iotModel, types);
const senderData = {
  iotName: 'IOT-1',
  sensor: {
    id: 123456789,
    type: 0x01,
    value: 123.456,
    timestamp: 1677277903685n,
  }
};
const { buffer: senderFrame } = sender.make(senderData);

const receiver = CStructBE.fromModelTypes(iotModel, types);
const { struct: receiverData } = receiver.read(senderFrame);
console.log(receiverData);
```

### String-based model and types

Model and types can be strings (or mixed with objects). Comments are allowed in string forms.

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const cStruct = CStructBE.fromModelTypes(
  `{errors: [Error, Error]}`,
  `{Error: {code: u16, message: s10}}`
);

const { buffer, offset, size } = cStruct.make({
    errors: [
        { code: 0x12, message: 'message1' },
        { code: 0x34, message: 'message2' },
    ]
});

console.log(buffer.toString('hex'));
// 00126d65737361676531000000346d657373616765320000
console.log(offset); // 24
console.log(size);   // 24
```

```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Mixed approach
const cStruct = CStructBE.fromModelTypes(
  { errors: `[Error, Error]` },
  { Error: `{code: u16, message: s10}` }
);
```

### Dynamic length

Length can come from the data itself — a length prefix is read from (or written before) the array. In C terms: the prefix is the `count` field.

```typescript
// typedef struct {
//   int16_t count;           // length prefix on the wire
//   struct { int8_t a; int8_t b; } ab[count];
// } SampleBatch;
// SampleBatch batch = { 2, { {-1, +1}, {-2, +2} } };

import { CStructBE } from '@mrhiden/cstruct';

const model = { ab: "Ab[i16]" };
const types = { Ab: { a: 'i8', b: 'i8' } };
const cStruct = CStructBE.fromModelTypes(model, types);

console.log(cStruct.modelClone);
// { 'ab.i16': { a: 'i8', b: 'i8' } }

const data = {
    ab: [
        { a: -1, b: +1 },
        { a: -2, b: +2 },
    ]
};
const { buffer } = cStruct.make(data);
console.log(buffer.toString('hex'));
// 0002ff01fe02

const { struct: extractedData } = cStruct.read(buffer);
console.log(extractedData);
// { ab: [ { a: -1, b: 1 }, { a: -2, b: 2 } ] }
```

```text
Model: { ab: "Ab[i16]" }   Ab = { a: i8, b: i8 }   data: 2 elements

  byte:    0    1    2    3    4    5
         ┌────┬────┬────┬────┬────┬────┐
  bytes: │ 00 │ 02 │ FF │ 01 │ FE │ 02 │
         └────┴────┴────┴────┴────┴────┘
         ├ length  ┤├ ab[0] ┤ ├ ab[1] ┤

  length = i16 2 (BE)   ab[0] = { a: -1, b: 1 }   ab[1] = { a: -2, b: 2 }
```

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = {
    txt1: "s[i16]",
    txt2: "string[i16]",
};
const cStruct = CStructBE.fromModelTypes(model);

const data = { txt1: "ABCDE", txt2: "AB" };
const { buffer } = cStruct.make(data);
console.log(buffer.toString('hex'));
// 0005414243444500024142

const { struct: extractedData } = cStruct.read(buffer);
console.log(extractedData);
// { txt1: 'ABCDE', txt2: 'AB' }
```

### Trailing zero (`s[0]`, `j[0]`, …)

For `"string"`, `"wstring"` and `"json"` types you can use trailing zero: data is written at full unknown length and terminated with `'\0'` (for wstring: 16-bit `'\u0000'`). That lets you read without knowing the length up front. Buffers cannot use this trick — they may contain zeros anywhere.

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = {
    any1: 'j[0]', // or 'json[0]' / 'any[0]'
    any2: 's[0]', // or 'string[0]'
};
const cStruct = CStructBE.fromModelTypes(model);

const data = { any1: [1, 2, 3], any2: 'abc' };
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 5b312c322c335d0061626300

const extractedData = cStruct.read(buffer).struct;
console.log(extractedData);
// { any1: [ 1, 2, 3 ], any2: 'abc' }
```

```text
Buffer for { any1: 'j[0]', any2: 's[0]' }  (12 bytes)
any1 = JSON "[1,2,3]" + \0 (8 bytes)   any2 = "abc" + \0 (4 bytes)

  5B 31 2C 32 2C 33 5D 00 | 61 62 63 00
  [  1  ,  2  ,  3  ]  \0  | a  b  c  \0
```

---

## Advanced usage (classes & decorators)

Use this path when you want typed classes and decorator metadata.

**Must enable in `tsconfig.json` or `jsconfig.json`:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Also see [`/examples/decorators.ts`](https://github.com/MrHIDEn/cstruct/tree/main/examples/decorators.ts).

### Property decorators — make / read

```typescript
import { CStructBE, CStructProperty } from '@mrhiden/cstruct';

class MyClass {
    @CStructProperty({ type: 'u8' })
    public propertyA: number;

    @CStructProperty({ type: 'i8' })
    public propertyB: number;
}

const myClass = new MyClass();
myClass.propertyA = 10;
myClass.propertyB = -10;

const bufferMake = CStructBE.make(myClass).buffer;
console.log(bufferMake.toString('hex'));
// 0af6

const buffer = Buffer.from('0af6', 'hex');
const readBack = CStructBE.read(MyClass, buffer).struct;
console.log(readBack);
// MyClass { propertyA: 10, propertyB: -10 }
console.log(readBack instanceof MyClass); // true
```

### Class model via `@CStructClass`

```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: {
        propertyA: 'u8',
        propertyB: 'i8',
    }
})
class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const buffer = Buffer.from('0af6', 'hex');
const myClass = CStructBE.read(MyClass, buffer).struct;
console.log(myClass);
// MyClass { propertyA: 10, propertyB: -10 }
```

### Offset + string model/types in decorator

```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: `{propertyA: U8, propertyB: I8}`,
    types: '{U8: uint8, I8: int8}',
})
class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const buffer = Buffer.from('77770af6', 'hex');
const myClass = CStructBE.read(MyClass, buffer, 2).struct;
console.log(myClass);
// MyClass { propertyA: 10, propertyB: -10 }
```

### `CStructBE.from` with class or options

```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const myClass = new MyClass();
myClass.propertyA = 10;
myClass.propertyB = -10;

const cStruct = CStructBE.from({
    model: `{propertyA: U16, propertyB: I16}`,
    types: '{U16: uint16, I16: int16}',
});
console.log(cStruct.make(myClass).buffer.toString('hex'));
// 000afff6
```

```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: `{propertyA: U16, propertyB: I16}`,
    types: '{U16: uint16, I16: int16}',
})
class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const myClass = new MyClass();
myClass.propertyA = 10;
myClass.propertyB = -10;

const cStruct = CStructBE.from(MyClass);
console.log(cStruct.make(myClass).buffer.toString('hex'));
// 000afff6
```

### Nested typed property (`CStructModelProperty`)

```typescript
import { CStructBE, CStructClass, CStructModelProperty } from '@mrhiden/cstruct';

class MyClass {
    public a: number;
    public b: number;
}

@CStructClass({
    types: { MyClass: { a: 'u16', b: 'i16' } }
})
class MyData {
    @CStructModelProperty('MyClass')
    public myClass: MyClass;
}

const myData = new MyData();
myData.myClass = new MyClass();
myData.myClass.a = 10;
myData.myClass.b = -10;

const bufferMake = CStructBE.make(myData).buffer;
console.log(bufferMake.toString('hex'));
// 000afff6

const myDataRead = new MyData();
myDataRead.myClass = new MyClass();
CStructBE.read(myDataRead, bufferMake);
console.log(myDataRead);
// MyData { myClass: MyClass { a: 10, b: -10 } }

const bufferWrite = Buffer.alloc(4);
CStructBE.write(myData, bufferWrite);
console.log(bufferWrite.toString('hex'));
// 000afff6
```

---

## Specialized (PLC, C-struct, JSON)

Niche and longer examples. Expand only what you need.

<details>
<summary><strong>PLC aliases</strong> (<code>BYTE</code>, <code>WORD</code>, <code>BOOL</code>, …)</summary>

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = { b: 'BYTE', w: 'WORD', f: 'BOOL' };
const cStruct = CStructBE.fromModelTypes(model);

const struct = { b: 0x12, w: 0x3456, f: true };
const { buffer } = cStruct.make(struct);
console.log(buffer.toString('hex'));
// 12345601

const { struct: extractedData } = cStruct.read(buffer);
console.log(extractedData);
// { b: 18, w: 13398, f: true }
```

</details>

<details>
<summary><strong>C-kind fields</strong> (<code>{u8 a,b;}</code>)</summary>

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = `{u8 a,b;}`;
const cStruct = CStructBE.fromModelTypes(model);

const makeStruct = { a: 1, b: 2 };
const { buffer: structBuffer } = cStruct.make(makeStruct);
console.log(structBuffer.toString('hex'));
// 0102

const { struct: readStruct } = cStruct.read(structBuffer);
console.log(readStruct);
// { a: 1, b: 2 }
```

</details>

<details>
<summary><strong>C-kind struct / typedef</strong> (comments allowed)</summary>

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = { xyzs: "Xyx[2]" };
const types = `{
    typedef struct {
        uint8_t x;
        uint8_t y;
        uint8_t z;
    } Xyx;
}`;

const cStruct = CStructBE.fromModelTypes(model, types);
const data = {
    xyzs: [
        { x: 1, y: 2, z: 3 },
        { x: 4, y: 5, z: 6 },
    ]
};
const { buffer: makeBuffer } = cStruct.make(data);
console.log(makeBuffer.toString('hex'));
// 010203040506

const { struct: readStruct } = cStruct.read(makeBuffer);
console.log(readStruct);
// { xyzs: [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ] }
```

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const types = `{
    // 1st approach
    typedef struct {
        u8 x,y,z;
    } Xyz;

    // 2nd approach
    struct Ab {
        i8 x,y;
    };
}`;
const model = `{
    ab: Ab,
    xyz: Xyz,
}`;

const cStruct = CStructBE.fromModelTypes(model, types);
const data = {
    ab: { x: -2, y: -1 },
    xyz: { x: 0, y: 1, z: 2 }
};
const { buffer: makeBuffer } = cStruct.make(data);
console.log(makeBuffer.toString('hex'));
// feff000102
```

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = `[
    i8,         // 1 byte
    i8[2],      // 2 bytes static array
    i8[i16]     // dynamic array
]`;

const cStruct = CStructBE.fromModelTypes(model);
console.log(cStruct.jsonModel);
// ["i8","i8.2","i8.i16"]

const data = [0x01, [0x02, 0x03], [0x04, 0x05, 0x06, 0x07]];
const { buffer } = cStruct.make(data);
console.log(buffer.toString('hex'));
// 010203000404050607

const { struct: extractedData } = cStruct.read(buffer);
console.log(extractedData);
// [ 1, [ 2, 3 ], [ 4, 5, 6, 7 ] ]
```

```typescript
import { CStructBE } from '@mrhiden/cstruct';

class Undecorated {
    a: number;
    b: number;
}
const undecorated = new Undecorated();
undecorated.a = -1;
undecorated.b = -2;

const undecoratedStruct = CStructBE.from({
    model: '{a:float,b:double}',
});
const undecoratedBuffer = undecoratedStruct.make(undecorated).buffer;
console.log(undecoratedBuffer.toString('hex'));
// bf800000c000000000000000
```

</details>

<details>
<summary><strong>JSON mode</strong> (<code>j</code> / <code>json</code> / <code>any</code>)</summary>

```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: {
        any1: 'j[i8]',
        any2: 'json[i8]',
        any3: 'any[i8]',
    }
})
class MyClass {
    any1: any;
    any2: any;
    any3: any;
}

const myClass = new MyClass();
myClass.any1 = { a: 1 };
myClass.any2 = { b: "B" };
myClass.any3 = [1, 3, 5];

const buffer = CStructBE.make(myClass).buffer;
console.log(buffer.toString('hex'));
// 077b2261223a317d097b2262223a2242227d075b312c332c355d

const myClass2 = CStructBE.read(MyClass, buffer).struct;
console.log(myClass2);
// MyClass { any1: { a: 1 }, any2: { b: 'B' }, any3: [ 1, 3, 5 ] }
```

</details>

<details>
<summary><strong>Larger realistic example</strong> (file of geo points)</summary>

```typescript
import { CStructBE, CStructClass, CStructProperty } from '@mrhiden/cstruct';
import * as fs from "fs";

interface GeoAltitude {
    lat: number;
    long: number;
    alt: number;
}

@CStructClass({
    types: `{ GeoAltitude: { lat:double, long:double, alt:double }}`
})
class GeoAltitudesFile {
    @CStructProperty({ type: 'string30' })
    public fileName: string = 'GeoAltitudesFile v1.0';

    @CStructProperty({ type: 'GeoAltitude[i32]' })
    public geoAltitudes: GeoAltitude[] = [];
}

(async () => {
    const geoAltitudesFile = new GeoAltitudesFile();
    for (let i = 0; i < 1e6; i++) {
        const randomLat = Math.random() * (90 - -90) + -90;
        const randomLong = Math.random() * (180 - -180) + -180;
        const randomAlt = 6.4e6 * Math.random() * (8e3 - -4e3) + -4e3;
        geoAltitudesFile.geoAltitudes.push({
            lat: randomLat,
            long: randomLong,
            alt: randomAlt,
        });
    }

    const writeFile = CStructBE.make(geoAltitudesFile).buffer;
    await fs.promises.writeFile('geoAltitudesFile.bin', writeFile);

    const readFile = await fs.promises.readFile('geoAltitudesFile.bin');
    const readGeoAltitudesFile = CStructBE.read(GeoAltitudesFile, readFile).struct;
    console.log(readGeoAltitudesFile.fileName);
    console.log(readGeoAltitudesFile.geoAltitudes.length);
})();
```

</details>

---

