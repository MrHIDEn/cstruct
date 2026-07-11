# @mrhiden/cstruct
*'C like structures'* — TypeScript library for packing and unpacking binary data (`Buffer` ⇔ Object/Array).

If you only need to pack a plain object into a buffer — **Basic usage** is enough. Classes, decorators, PLC aliases, and C-struct parsing are optional paths below.

## Table of contents
- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [Concepts](#concepts)
- [Basic usage](#basic-usage-objects--strings)
  - [Endianness (BE vs LE)](#endianness-be-vs-le)
  - [Precompiled models (`fromCompiled`)](#precompiled-models-fromcompiled)
  - [Compiled functions (codegen)](#compiled-functions-codegen)
  - [Write into an existing buffer](#write-into-an-existing-buffer)
  - [Binary buffer field (`bufN`)](#binary-buffer-field-bufn)
  - [Wide string (`wstring` / `wsN`)](#wide-string-wstring--wsn)
- [Advanced usage](#advanced-usage-classes--decorators)
- [Specialized](#specialized-plc-c-struct-json)
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

## Install
```bash
npm i @mrhiden/cstruct
```

## Quick start

Precompile a model once, then `make` and `read` as many times as you need:

```javascript
const { CStructBE, AtomTypes } = require('@mrhiden/cstruct');
const { U16, I16 } = AtomTypes; // or use 'u16', 'i16' as strings

const model = { a: U16, b: I16 }; // = { a: 'u16', b: 'i16' }
const cStruct = CStructBE.fromModelTypes(model);

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 000afff6

const result = cStruct.read(buffer);
console.log(result.struct);
// { a: 10, b: -10 }
```

Same cycle in TypeScript with string atom types:

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = { a: 'u16', b: 'i16' };
const cStruct = CStructBE.fromModelTypes(model);

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 000afff6

const result = cStruct.read(buffer);
console.log(result.struct);
// { a: 10, b: -10 }
```

Use `CStructLE` instead of `CStructBE` when your protocol is little-endian — same API, different byte order (see [Endianness](#endianness-be-vs-le)).

## Concepts

The main idea: create a model of your data structure, precompile it into a `CStructBE` or `CStructLE` object, then use that object to read from and write to buffers.

| Class | Endianness |
|-------|------------|
| `CStructBE` | Big Endian |
| `CStructLE` | Little Endian |

Both classes share the same methods and functionality.

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

---

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

See [`examples/codegen.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/codegen.ts). Sample throughput on MacBook M4 Pro: [`doc/BENCHMARKS.md`](https://github.com/MrHIDEn/cstruct/blob/main/doc/BENCHMARKS.md). Run `npm run bench` locally.

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

Length can come from another integer field (`u16`, `i16`, …).

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = { ab: "Ab[i16]" };
const types = { Ab: { a: 'i8', b: 'i8' } };
const cStruct = CStructBE.fromModelTypes(model, types);

console.log(cStruct.modelClone);
// { 'ab.i16': { a: 'i8', b: 'i8' } }

const data = {
    ab: [
        { a: '-1', b: '+1' },
        { a: '-2', b: '+2' },
    ]
};
const { buffer } = cStruct.make(data);
console.log(buffer.toString('hex'));
// 0002ff01fe02

const { struct: extractedData } = cStruct.read(buffer);
console.log(extractedData);
// { ab: [ { a: -1, b: 1 }, { a: -2, b: 2 } ] }
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

Runnable scripts live in [`/examples`](https://github.com/MrHIDEn/cstruct/tree/main/examples). Build first (`npm run build`), then `npx ts-node examples/<file>.ts`.

| File | Topic |
|------|-------|
| [`simple-model.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/simple-model.ts) | Basic make/read, offset, write |
| [`little-endian.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/little-endian.ts) | BE vs LE side-by-side |
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

### What's new in 1.7.0
* Added `compileRead`, `compileWrite`, `compileMake` on `CStructBE` and `CStructLE` — compile a model once into specialized functions for high-throughput read/write/make
* Instance methods `cStruct.compileRead()` / `compileWrite()` / `compileMake()` use cached `parsedModel`
* `compileMake` uses single `allocUnsafe` for fully static models and `chunks + concat` for variable-length fields
* Added [`examples/codegen.ts`](https://github.com/MrHIDEn/cstruct/blob/main/examples/codegen.ts) and README section [Compiled functions](#compiled-functions-codegen)
* Added `npm run bench` and [`doc/BENCHMARKS.md`](doc/BENCHMARKS.md) with sample throughput (interpreter vs codegen)

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
