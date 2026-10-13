# Compiled functions (codegen)

`compileRead`, `compileWrite` and `compileMake` turn a model into a **specialized
function** once, via `new Function`, so the hot path no longer walks the model
tree on every call. The produced functions are byte-identical to the interpreted
`read` / `write` / `make` — only the per-call model walk disappears.

> **Not to be confused with `fromCompiled`** — that one loads a precompiled
> `jsonModel` and still uses the interpreter. The `compile*` methods below
> generate real JavaScript *function bodies*. Both are covered in
> [EXAMPLES.md](./EXAMPLES.md#compiled-functions-codegen).

**When to use:** high-throughput parsing/serialization with a fixed model.
**When not to:** occasional calls — plain `read` / `make` is simpler.

**Security note:** `compile*` builds a function from a model you provide. Use only
**trusted** models (your own source or build-time artifacts), never untrusted
user input — the same rule as for `fromCompiled`.

## API

| | static (parses the model once) | instance (reuses the cached `parsedModel`) |
|---|---|---|
| read  | `CStructLE.compileRead(model, types?)`  | `cStruct.compileRead()`  |
| write | `CStructLE.compileWrite(model, types?)` | `cStruct.compileWrite()` |
| make  | `CStructLE.compileMake(model, types?)`  | `cStruct.compileMake()`  |

Works on both `CStructBE` and `CStructLE`. Compiled function signatures:

```typescript
const read  = CStructLE.compileRead<T>(model);   // (buf, off?) => { struct, offset, size }
const write = CStructLE.compileWrite<T>(model);  // (struct, buf, off?) => { buffer, offset, size }
const make  = CStructLE.compileMake<T>(model);   // (struct) => { buffer, offset, size }
```

## How a model is compiled

```text
model ── ModelParser.parseModel ──► parsed model
                                      │
        generateReadBody   ──────────┼──► new Function('buf', 'off', body)
        generateWriteBody  ──────────┤──► new Function('struct', 'buf', 'off', body)
        analyzeModel + generateMakeBody ─► new Function('struct', body)
```

`analyzeModel` first decides whether the layout is variable-length:

- **fixed size** → `make` allocates `Buffer.allocUnsafe(staticSize)` once and
  writes directly (single pass).
- **variable length** → `make` runs two passes: compute `size`, allocate, then write.

`read` has its own shortcut: fixed-layout object models are emitted as a single
folded expression (constant offsets), while dynamic/tuple/enum models fall back to
a cursor walker. See [Read: fast path vs cursor path](#read-fast-path-vs-cursor-path).

Every body below is the **actual output of the generator** (v1.9.0), shown as a
comment so you can see exactly what `new Function` receives.

## 1. Fixed-layout model (LE)

```typescript
import { CStructLE } from '@mrhiden/cstruct';

const model = { a: 'u8', b: 'i16', flag: 'b8' };
const data  = { a: 7, b: -3, flag: true };

const read  = CStructLE.compileRead(model);
const write = CStructLE.compileWrite(model);
const make  = CStructLE.compileMake(model);

const buf = make(data).buffer;
console.log(buf.toString('hex')); // 07fdff01
console.log(read(buf).struct);    // { a: 7, b: -3, flag: true }
write(data, buf, 0);
```

Generated bodies:

```js
// compileRead(...)  — fast path, one folded expression
off = off || 0;
return { struct: { "a": buf.readUInt8(off), "b": buf.readInt16LE(off + 1), "flag": Boolean(buf.readInt8(off + 3)) }, offset: off + 4, size: 4 };
```

```js
// compileWrite(...) — size pass, bounds check, then write pass
off = off || 0;
let size = 0;
size += 1;
size += 2;
size += 1;
if (size > buf.length - off) throw new Error("Write buffer is too short. Needs " + (size - (buf.length - off)) + " byte/s more.");
let o = off;
buf.writeUInt8(struct["a"], o); o += 1;
buf.writeInt16LE(struct["b"], o); o += 2;
buf.writeInt8(struct["flag"] ? 1 : 0, o); o += 1;
return { buffer: buf, offset: o, size: size };
```

```js
// compileMake(...) — static size, single pass
const buf = Buffer.allocUnsafe(4);
let o = 0;
buf.writeUInt8(struct["a"], o); o += 1;
buf.writeInt16LE(struct["b"], o); o += 2;
buf.writeInt8(struct["flag"] ? 1 : 0, o); o += 1;
return { buffer: buf, offset: o, size: o };
```

## 2. Nested object + static string (BE)

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = { error: { code: 'u16', message: 's20' } };
const data  = { error: { code: 15, message: 'abc' } };

const make = CStructBE.compileMake(model);
const buf  = make(data).buffer;
console.log(buf.toString('hex'));
// 000f6162630000000000000000000000000000000000
```

```js
// compileRead(...) — nested object folded, string trimmed at first NUL
off = off || 0;
return { struct: { "error": { "code": buf.readUInt16BE(off), "message": buf.toString('utf8', off + 2, off + 2 + 20).split('\0')[0] } }, offset: off + 22, size: 22 };
```

```js
// compileMake(...) — fixed s20 field zero-filled then written
const buf = Buffer.allocUnsafe(22);
let o = 0;
buf.writeUInt16BE(struct["error"]["code"], o); o += 2;
buf.fill(0, o, o + 20); buf.write(struct["error"]["message"], o, 20, 'utf8'); o += 20;
return { buffer: buf, offset: o, size: o };
```

## 3. Dynamic length-prefixed string (BE)

Variable length → `make` becomes two-pass, and `read` falls back to the cursor
path. The `i16` length prefix is written/read first, then the UTF-8 bytes.

```typescript
const model = { txt1: 's[i16]' };
const data  = { txt1: 'ABCDE' };

const make = CStructBE.compileMake(model);
const buf  = make(data).buffer;
console.log(buf.toString('hex')); // 00054142434445
//                                   0005_ 41..45  (len=5, "ABCDE")
```

```js
// compileRead(...) — cursor path: read len, slice string, advance
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
_t1 = buf.toString('utf8', o, o + _t2).split('\0')[0]; o += _t2;
_t0["txt1"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...) — pass 1 size, alloc, pass 2 write (len computed once)
let size = 0;
size += 2;
size += Buffer.byteLength(struct["txt1"], 'utf8');
const buf = Buffer.allocUnsafe(size);
let o = 0;
const _t0 = Buffer.byteLength(struct["txt1"], 'utf8');
buf.writeInt16BE(_t0, o); o += 2;
buf.write(struct["txt1"], o, _t0, 'utf8'); o += _t0;
return { buffer: buf, offset: o, size: o };
```

`compileWrite` is the same as `make` but starts with the size/bounds-check pass and
writes into the caller's `buf` at `off`.

## 4. Dynamic array (BE)

```typescript
const model = { abc: 'i8[i16]' };
const data  = { abc: [-1, 0, 1] };

const make = CStructBE.compileMake(model);
console.log(make(data).buffer.toString('hex')); // 0003ff0001
//                                                0003_ ff_00_01  (len=3)
```

```js
// compileRead(...) — cursor path with a loop
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
_t1 = [];
for (let _t3 = 0; _t3 < _t2; _t3++) {
let _t4;
_t4 = buf.readInt8(o); o += 1;
_t1[_t3] = _t4;
}
_t0["abc"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...) — static element size folded into size += length * 1
let size = 0;
size += 2;
size += struct["abc"].length * 1;
const buf = Buffer.allocUnsafe(size);
let o = 0;
buf.writeInt16BE(struct["abc"].length, o); o += 2;
for (let _t0 = 0; _t0 < struct["abc"].length; _t0++) {
buf.writeInt8(struct["abc"][_t0], o); o += 1;
}
return { buffer: buf, offset: o, size: o };
```

## 5. Tuple (LE)

```typescript
const model = ['u16', 'u16', 'u16'];
const data  = [1, 2, 3];

const make = CStructLE.compileMake(model);
console.log(make(data).buffer.toString('hex')); // 010002000300
```

```js
// compileRead(...) — top-level tuples keep the cursor path
off = off || 0;
let o = off;
const _t0 = [];
let _t1;
_t1 = buf.readUInt16LE(o); o += 2;
_t0[0] = _t1;
let _t2;
_t2 = buf.readUInt16LE(o); o += 2;
_t0[1] = _t2;
let _t3;
_t3 = buf.readUInt16LE(o); o += 2;
_t0[2] = _t3;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
const buf = Buffer.allocUnsafe(6);
let o = 0;
buf.writeUInt16LE(struct[0], o); o += 2;
buf.writeUInt16LE(struct[1], o); o += 2;
buf.writeUInt16LE(struct[2], o); o += 2;
return { buffer: buf, offset: o, size: o };
```

## 6. Enum (BE)

Enum fields are resolved raw ↔ name at compile time; the lookup table is inlined
into the generated body.

```typescript
const model = { state: { type: 'u8', enum: { 1: 'READY', 2: 'BUSY' } } };
const data  = { state: 'BUSY' };

const make = CStructBE.compileMake(model);
console.log(make(data).buffer.toString('hex')); // 02
```

```js
// compileRead(...) — raw byte mapped to name, falls back to the raw value
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
{ const _t2 = buf.readUInt8(o); o += 1; _t1 = {"1":"READY","2":"BUSY"}[String(_t2)] ?? _t2; }
_t0["state"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...) — name mapped to raw, unknown names throw
const buf = Buffer.allocUnsafe(1);
let o = 0;
let _t0 = struct["state"]; if (typeof _t0 === 'string') { _t0 = {"READY":1,"BUSY":2}[_t0]; if (_t0 === undefined) throw new Error('Unknown enum value "' + struct["state"] + '".'); }
buf.writeUInt8(_t0, o); o += 1;
return { buffer: buf, offset: o, size: o };
```

## More compiled shapes

The six cases above cover the core. A few more field kinds show up regularly and
compile to notably different code — each one below again shows the **actual
generator output** (v1.9.0). For brevity only the `read` and `make` bodies are
shown: `write` is always `make`'s body prefixed by the size + bounds-check pass
(see examples 1–3).

### Trailing-zero string (`s0`)

`'s0'` (or `'s[0]'`) is a NUL-terminated string. `read` scans for the terminator
with `buf.indexOf(0, …)`, `make` writes a `0` byte after the text:

```typescript
const make = CStructBE.compileMake({ name: 's0' });
console.log(make({ name: 'abcde' }).buffer.toString('hex')); // 616263646500
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
{ const _t2 = buf.indexOf(0, o) - o + 1; _t1 = buf.toString('utf8', o, o + _t2).split('\0')[0]; o += _t2; }
_t0["name"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
let size = 0;
size += Buffer.byteLength(struct["name"], 'utf8') + 1;
const buf = Buffer.allocUnsafe(size);
let o = 0;
{ const _b = Buffer.byteLength(struct["name"], 'utf8'); buf.write(struct["name"], o); buf.writeUInt8(0, o + _b); o += _b + 1; }
return { buffer: buf, offset: o, size: o };
```

### Wide string (`ws[i16]`)

UTF-16LE strings. Note the length prefix counts **characters** (JS `str.length`),
so the payload size is `len * 2` bytes — unlike `s[i16]`, whose prefix is the
UTF-8 byte length:

```typescript
const make = CStructBE.compileMake({ name: 'ws[i16]' });
console.log(make({ name: 'AB' }).buffer.toString('hex')); // 000241004200
//                                                         0002_ 41 00 42 00
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
_t1 = buf.toString('utf16le', o, o + (_t2) * 2).split('\u0000')[0]; o += (_t2) * 2;
_t0["name"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
let size = 0;
size += 2;
size += (struct["name"]).length * 2;
const buf = Buffer.allocUnsafe(size);
let o = 0;
buf.writeInt16BE((struct["name"]).length, o); o += 2;
{ const _t0 = (struct["name"]).length * 2; buf.write(struct["name"], o, _t0, 'utf16le'); o += _t0; }
return { buffer: buf, offset: o, size: o };
```

### JSON (`j[i16]`)

JSON fields compile to `JSON.parse` / `JSON.stringify`. The stringify is
**hoisted above both passes**, so it runs exactly once — the size pass and the
write pass reuse the same temp:

```typescript
const make = CStructBE.compileMake({ meta: 'j[i16]' });
console.log(make({ meta: [1, 2, 3] }).buffer.toString('hex')); // 00075b312c322c335d
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
let _t3;
_t3 = buf.toString('utf8', o, o + _t2).split('\0')[0]; o += _t2;
_t1 = JSON.parse(_t3);
_t0["meta"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...) — JSON.stringify hoisted, runs once
const _t0 = JSON.stringify(struct["meta"]);
let size = 0;
size += 2;
size += Buffer.byteLength(_t0, 'utf8');
const buf = Buffer.allocUnsafe(size);
let o = 0;
const _t1 = Buffer.byteLength(_t0, 'utf8');
buf.writeInt16BE(_t1, o); o += 2;
buf.write(_t0, o, _t1, 'utf8'); o += _t1;
return { buffer: buf, offset: o, size: o };
```

`'j0'` (trailing-zero JSON) is the same NUL-scan as `s0`, then `JSON.parse` —
with the stringify hoisted the same way.

### 64-bit integer (`u64`)

64-bit atoms use `BigInt`. `read` returns a `BigInt`; `make` coerces with
`BigInt(...)`. `i64` / `b64` are identical (`readBigInt64…` / `writeBigInt64…`):

```typescript
const make = CStructBE.compileMake({ id: 'u64' });
console.log(make({ id: 5 }).buffer.toString('hex')); // 0000000000000005
// read(make({ id: 5 }).buffer).struct.id === 5n
```

```js
// compileRead(...)
off = off || 0;
return { struct: { "id": buf.readBigUInt64BE(off) }, offset: off + 8, size: 8 };
```

```js
// compileMake(...)
const buf = Buffer.allocUnsafe(8);
let o = 0;
buf.writeBigUInt64BE(BigInt(struct["id"]), o); o += 8;
return { buffer: buf, offset: o, size: o };
```

### Raw buffer (`buf[i16]`)

Binary fields skip encoding entirely: `read` slices, `make` copies. Static
`'buf4'` is `buf.slice(off, off + 4)` / `struct["raw"].copy(buf, o, 0, 4)`:

```typescript
const make = CStructBE.compileMake({ raw: 'buf[i16]' });
console.log(make({ raw: Buffer.from('ABCDEF') }).buffer.toString('hex')); // 0006414243444546
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
_t1 = buf.slice(o, o + _t2); o += _t2;
_t0["raw"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
let size = 0;
size += 2;
size += (struct["raw"]).length;
const buf = Buffer.allocUnsafe(size);
let o = 0;
buf.writeInt16BE(struct["raw"].length, o); o += 2;
(struct["raw"]).copy(buf, o); o += (struct["raw"]).length;
return { buffer: buf, offset: o, size: o };
```

### Static array (`i8[3]`)

`'i8[3]'` parses to `vals.3` and compiles to a fixed-count loop. `make` bakes the
bounds check into the code:

```typescript
const make = CStructBE.compileMake({ vals: 'i8[3]' });
console.log(make({ vals: [1, 2, 3] }).buffer.toString('hex')); // 010203
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
_t1 = [];
for (let _t2 = 0; _t2 < 3; _t2++) {
let _t3;
_t3 = buf.readInt8(o); o += 1;
_t1[_t2] = _t3;
}
_t0["vals"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
const buf = Buffer.allocUnsafe(3);
let o = 0;
if (struct["vals"].length > 3) throw new Error('Size of value ' + struct["vals"].length + ' is greater than 3.');
for (let _t0 = 0; _t0 < struct["vals"].length; _t0++) {
buf.writeInt8(struct["vals"][_t0], o); o += 1;
}
return { buffer: buf, offset: o, size: o };
```

### Dynamic array of objects (named types)

A length-prefixed array of a named type is fully **inlined** — the `Point` type is
resolved at compile time, no runtime type lookup remains:

```typescript
const make = CStructBE.compileMake(
    { items: 'Point[i16]' },
    { Point: { x: 'i16', y: 'i16' } },
);
console.log(make({ items: [{ x: 1, y: 2 }, { x: 3, y: 4 }] }).buffer.toString('hex'));
// 00020001000200030004
```

```js
// compileRead(...)
off = off || 0;
let o = off;
const _t0 = {};
let _t1;
const _t2 = buf.readInt16BE(o); o += 2;
_t1 = [];
for (let _t3 = 0; _t3 < _t2; _t3++) {
const _t4 = {};
let _t5;
_t5 = buf.readInt16BE(o); o += 2;
_t4["x"] = _t5;
let _t6;
_t6 = buf.readInt16BE(o); o += 2;
_t4["y"] = _t6;
_t1[_t3] = _t4;
}
_t0["items"] = _t1;
return { struct: _t0, offset: o, size: o - off };
```

```js
// compileMake(...)
let size = 0;
size += 2;
for (let _t0 = 0; _t0 < struct["items"].length; _t0++) {
size += 2;
size += 2;
}
const buf = Buffer.allocUnsafe(size);
let o = 0;
buf.writeInt16BE(struct["items"].length, o); o += 2;
for (let _t1 = 0; _t1 < struct["items"].length; _t1++) {
buf.writeInt16BE(struct["items"][_t1]["x"], o); o += 2;
buf.writeInt16BE(struct["items"][_t1]["y"], o); o += 2;
}
return { buffer: buf, offset: o, size: o };
```

## Read: fast path vs cursor path

`generateReadBody` tries a **fast path** first and only falls back to the cursor
walker when it has to:

- **Fast path** (examples 1–2, plus `u64` / `buf4` above): fixed-layout object
  models. Every field becomes one expression at a constant offset (`off + N`)
  folded straight into the returned object literal — no cursor, no temp
  variables, no intermediate struct.
- **Cursor path** (examples 3–6 and the dynamic/trailing-zero shapes above):
  dynamic lengths, arrays, enums, dot-group keys, trailing-zero strings, and
  top-level tuples. It keeps a running `o` offset and temp variables
  (`_t0`, `_t1`, …).

Both produce the same result; the fast path is just shorter and cheaper.

## See also

- [`examples/codegen.ts`](../examples/codegen.ts) — runnable version
  (`compileRead` / `compileWrite` / `compileMake`, incl. `fromCompiled` + codegen).
- [`examples/from-compiled.ts`](../examples/from-compiled.ts) — precompiled
  `jsonModel` (interpreter, no codegen).
- Benchmarks: [`BENCHMARKS-NODE.md`](./BENCHMARKS-NODE.md),
  [`BENCHMARKS-BUN.md`](./BENCHMARKS-BUN.md),
  [`BENCHMARKS-RUNTIMES.md`](./BENCHMARKS-RUNTIMES.md).
  Run `npm run bench:node` or `npm run bench:bun`.
