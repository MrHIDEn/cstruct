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
| cstruct (Buffer, interpreted) | 1 569 614 | 637.1 | 1 984 896 | 503.8 | **19** |
| cstruct (DataView, interpreted) | 1 643 466 | 608.5 | 2 054 891 | 486.6 | **19** |
| cstruct (codegen) | **36 301 716** | **27.5** | **22 975 242** | **43.5** | **19** |
| JSON | 6 533 182 | 153.1 | 5 670 588 | 176.3 | 47 |
| protobuf (protobufjs) | 6 262 505 | 159.7 | 21 953 025 | 45.6 | 31 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen dominates (~36.3M, ~5.8× faster than protobuf
  `encode` and `JSON.stringify`), because it writes integers directly to the
  `Uint8Array` (no per-call `DataView`) and uses a fast UTF-8 writer. The
  interpreter paths (~1.57–1.64M) pay for runtime model walking.
* **Decode** — `cstruct` codegen (~23.0M) and protobuf `decode` (~22.0M) are on
  par and well ahead of `JSON.parse` (~5.7M). The interpreters read at ~1.98–2.05M.
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
