# Formats benchmark results — complex message

Cross-format comparison of `@mrhiden/cstruct` (three variants) against **JSON**
and **Google Protocol Buffers** ([`protobufjs`](https://www.npmjs.com/package/protobufjs)),
on a **complex, realistic message**: nested struct + fixed array + string.

* Last run: 2026-10-09, Node.js v24.21.0, macOS (Apple Silicon).
* Reproduce: `npx ts-node --transpile-only benchmarks/formats-bench-complex.ts`.
* Message under test:

  ```c
  struct Sensor {
      uint8_t  id;
      uint16_t type;
      uint32_t seq;
      float    temp;
      struct { int16_t x; int16_t y; int16_t z; } pos;  // nested
      uint16_t samples[8];                               // fixed array
      char     name[16];                                 // fixed string
  };
  // data = { id:42, type:0x1234, seq:1000000, temp:36.6,
  //          pos:{x:-10,y:20,z:-30}, samples:[1..8], name:"sensor-01" }
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
| cstruct (Buffer, interpreted) | 530 939 | 1 883.5 | 678 066 | 1 474.8 | **49** |
| cstruct (DataView, interpreted) | 520 066 | 1 922.8 | 686 217 | 1 457.3 | **49** |
| cstruct (codegen) | **14 792 170** | **67.6** | **9 861 451** | **101.4** | **49** |
| JSON | 3 660 548 | 273.2 | 2 495 702 | 400.7 | 125 |
| protobuf (protobufjs) | 4 026 442 | 248.4 | 8 108 021 | 123.3 | 61 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen dominates (~14.8M, ~3.7× faster than protobuf
  `encode` and ~4.0× faster than `JSON.stringify`), because it writes integers
  directly to the `Uint8Array` (no per-call `DataView`) and uses a fast UTF-8
  writer. The interpreter paths (~0.52–0.53M) pay for runtime model walking over
  a 7-field message.
* **Decode** — `cstruct` codegen (~9.86M) now leads protobuf `decode` (~8.11M)
  by ~22%, after replacing per-call `DataView` reads with direct byte reads.
  `JSON.parse` is ~2.50M; the interpreters read at ~0.68–0.69M.
* **Wire size** — `cstruct` is the smallest and fixed (49 B). protobuf is 61 B
  (varint overhead on `int32` negatives: `x=-10`/`z=-30` → 10-byte varints).
  JSON is 125 B of UTF-8 text (~2.5× larger).

## Notes

* `cstruct` read returns a plain object (nested `pos`, `samples` as a fixed
  array, `name` stripped of trailing nulls). protobuf `decode()` returns a
  `Message` instance (nested `pos` is a `Message` too — `.toObject()` for a
  plain object). `JSON.parse` returns a plain object.
* The `cstruct` three variants share the exact same 49-byte wire format and
  interoperate — choose by runtime (Node `Buffer` vs portable `Uint8Array`) and
  by throughput need (interpreted vs compiled).
* Compare with the simple fixed struct: see
  [`FORMATS-RESULTS.md`](FORMATS-RESULTS.md).
