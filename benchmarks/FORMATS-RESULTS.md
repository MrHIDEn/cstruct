# Formats benchmark results

Cross-format comparison of `@mrhiden/cstruct` (three variants) against **JSON**
and **Google Protocol Buffers** ([`protobufjs`](https://www.npmjs.com/package/protobufjs)).

* Last run: 2026-10-09, Node.js v24.21.0, macOS (Apple Silicon).
* Reproduce: `npm run bench:formats`
  (`ts-node --transpile-only benchmarks/formats-bench.ts`).
* Struct under test (fixed size, all fields always present):

  ```c
  struct Sensor { uint8_t a; int16_t b; uint32_t c; float d; double e; };
  // data = { a: 7, b: -123, c: 123456, d: 1.5, e: 123.456 }
  ```

  | Variant | What it is |
  |---|---|
  | **cstruct (Buffer)** | Node `Buffer` path, interpreter (walks the model at runtime) |
  | **cstruct (DataView)** | `CStructUint8Array`, `Uint8Array`/`DataView`, interpreter |
  | **cstruct (codegen)** | `CStructUint8Array.compileRead/compileMake` — model compiled once |
  | **JSON** | native `JSON.stringify` / `JSON.parse` (text, no schema) |
  | **protobuf** | Protocol Buffers via `protobufjs` (binary, varint, schema) |

## Results

| Format / path | Encode ops/s | Encode ns/op | Decode ops/s | Decode ns/op | Wire bytes |
|---:|---:|---:|---:|---:|---:|
| cstruct (Buffer, interpreted) | 1 537 792 | 650.3 | 2 201 265 | 454.3 | **19** |
| cstruct (DataView, interpreted) | 1 608 890 | 621.5 | 1 925 997 | 519.2 | **19** |
| cstruct (codegen) | 5 859 877 | 170.7 | **22 487 735** | **44.5** | **19** |
| JSON | **6 468 736** | **154.6** | 5 448 028 | 183.6 | 47 |
| protobuf (protobufjs) | 6 289 313 | 159.0 | 21 669 613 | 46.1 | 31 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `JSON.stringify` (~6.47M) and protobuf `encode` (~6.29M) lead;
  `cstruct` codegen is close (~5.86M). The interpreter paths (~1.5–1.6M) pay for
  runtime model walking plus dynamic features (enum/JSON/dynamic length).
* **Decode** — `cstruct` codegen (~22.5M) and protobuf `decode` (~21.7M) are on
  par and well ahead of `JSON.parse` (~5.4M). The interpreters read at ~1.9–2.2M.
* **Wire size** — `cstruct` is the smallest and fixed (19 B). protobuf is 31 B
  (an `int32` negative value encodes as a 10-byte varint); JSON is 47 B of UTF-8
  text (~2.5× larger) and carries no type information.

## Notes

* `cstruct` read returns a plain object with every field; protobuf `decode()`
  returns a `Message` instance (add `.toObject()` for a plain object);
  `JSON.parse` returns a plain object.
* Formats are not interchangeable: `cstruct` lays fields back-to-back (fixed
  size), protobuf uses tagged varint/fixed fields (schema-driven), JSON is text.
* The `cstruct` three variants share the exact same 19-byte wire format, so they
  interoperate — pick by runtime (Node `Buffer` vs portable `Uint8Array`) and by
  throughput need (interpreted vs compiled).
