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
| cstruct (Buffer, interpreted) | 530 611 | 1 884.6 | 687 691 | 1 454.1 | **49** |
| cstruct (DataView, interpreted) | 531 232 | 1 882.4 | 668 024 | 1 497.0 | **49** |
| cstruct (codegen) | **4 444 006** | **225.0** | 4 000 268 | 250.0 | **49** |
| JSON | 3 756 250 | 266.2 | 2 540 878 | 393.6 | 125 |
| protobuf (protobufjs) | 4 001 333 | 249.9 | **8 229 951** | **121.5** | 61 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **Encode** — `cstruct` codegen leads (~4.44M), ahead of protobuf `encode`
  (~4.00M) and `JSON.stringify` (~3.76M). The interpreter paths (~0.53M) pay for
  runtime model walking over a 7-field message.
* **Decode** — protobuf `decode` leads (~8.23M); `cstruct` codegen is ~4.00M and
  `JSON.parse` ~2.54M. The interpreters read at ~0.67–0.69M.
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
