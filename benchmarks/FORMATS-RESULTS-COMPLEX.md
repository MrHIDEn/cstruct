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
| cstruct (Buffer, interpreted) | 2 898 807 | 345.0 | 2 960 332 | 337.8 | **49** |
| cstruct (DataView, interpreted) | 4 161 783 | 240.3 | 2 913 628 | 343.2 | **49** |
| cstruct (codegen) | **16 533 739** | **60.5** | **8 629 497** | **115.9** | **49** |
| JSON | 3 842 336 | 260.3 | 2 516 799 | 397.3 | 125 |
| protobuf (protobufjs) | 3 999 457 | 250.0 | 8 207 911 | 121.8 | 61 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen dominates (~16.5M, ~4.1× faster than protobuf
  `encode` and ~4.3× faster than `JSON.stringify`), because it writes integers
  directly to the `Uint8Array` (no per-call `DataView`) and uses a fast UTF-8
  writer. The interpreters encode at ~2.9M (Buffer) / ~4.2M (DataView) — the
  DataView interpreter now beats both `JSON.stringify` and protobuf `encode`.
* **Decode** — `cstruct` codegen (~8.63M) leads protobuf `decode` (~8.21M) by a
  small margin, and is ~3.4× faster than `JSON.parse` (~2.52M). The interpreters
  read at ~2.96M (Buffer) / ~2.91M (DataView).
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
