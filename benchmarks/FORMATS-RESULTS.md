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
| cstruct (Buffer, interpreted) | 7 214 644 | 138.6 | 11 047 830 | 90.5 | **19** |
| cstruct (DataView, interpreted) | 10 359 201 | 96.5 | 7 743 686 | 129.1 | **19** |
| cstruct (codegen) | **36 666 866** | **27.3** | **68 342 662** | **14.6** | **19** |
| JSON | 6 462 171 | 154.7 | 5 549 531 | 180.2 | 47 |
| protobuf (protobufjs) | 6 214 073 | 160.9 | 21 924 785 | 45.6 | 31 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen dominates (~36.7M, ~5.9× faster than protobuf
  `encode` and ~5.7× faster than `JSON.stringify`), because it writes integers
  directly to the `Uint8Array` (no per-call `DataView`) and uses a fast UTF-8
  writer. After the interpreter was compiled to a pre-resolved model and switched
  to switch-dispatch + a single growing buffer, the interpreters now encode at
  ~7.2M (Buffer) / ~10.4M (DataView) — *faster than both `JSON.stringify` and
  protobuf `encode`*.
* **Decode** — `cstruct` codegen (~68.3M) is ~3.1× faster than protobuf `decode`
  (~21.9M) and ~12.3× faster than `JSON.parse`, for the same reason: direct byte
  reads instead of per-call `DataView`. The Buffer interpreter (~11.0M) is ~2×
  faster than `JSON.parse`; the DataView interpreter reads at ~7.7M.
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
