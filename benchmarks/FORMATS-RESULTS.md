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
| cstruct (Buffer, interpreted) | 1 628 406 | 614.1 | 2 175 534 | 459.7 | **19** |
| cstruct (DataView, interpreted) | 1 657 311 | 603.4 | 2 080 458 | 480.7 | **19** |
| cstruct (codegen) | **36 143 199** | **27.7** | **69 781 075** | **14.3** | **19** |
| JSON | 6 527 933 | 153.2 | 5 523 033 | 181.1 | 47 |
| protobuf (protobufjs) | 6 203 178 | 161.2 | 21 760 282 | 46.0 | 31 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen dominates (~36.1M, ~5.8× faster than protobuf
  `encode` and ~5.5× faster than `JSON.stringify`), because it writes integers
  directly to the `Uint8Array` (no per-call `DataView`) and uses a fast UTF-8
  writer. The interpreter paths (~1.63–1.66M) pay for runtime model walking.
* **Decode** — `cstruct` codegen (~69.8M) is ~3.2× faster than protobuf `decode`
  (~21.8M) and ~12.6× faster than `JSON.parse`, for the same reason: direct byte
  reads instead of per-call `DataView`. The interpreters read at ~2.08–2.18M.
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
