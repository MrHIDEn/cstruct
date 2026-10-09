# Formats benchmark results — dynamic (variable-length) message

Cross-format comparison of `@mrhiden/cstruct` (three variants) against **JSON**
and **Google Protocol Buffers** ([`protobufjs`](https://www.npmjs.com/package/protobufjs)),
on **variable-length data**: a length-prefixed string + a length-prefixed array.

* Last run: 2026-10-09, Node.js v24.21.0, macOS (Apple Silicon).
* Reproduce: `npx ts-node --transpile-only benchmarks/formats-bench-dynamic.ts`.
* Message under test:

  ```js
  // cstruct model
  { name: 's[i16]', samples: 'u16[i16]' }
  //   name:    i16 length prefix + UTF-8 bytes
  //   samples: i16 length prefix + N × u16
  //
  // protobuf equivalent
  //   message Dyn { string name = 1; repeated uint32 samples = 2; }
  //
  // data = { name: "sensor-01", samples: [1..20] }   (20 elements)
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
| cstruct (Buffer, interpreted) | 538 676 | 1 856.4 | 824 811 | 1 212.4 | 53 |
| cstruct (DataView, interpreted) | 512 048 | 1 952.9 | 854 723 | 1 170.0 | 53 |
| cstruct (codegen) | 4 483 094 | 223.1 | 6 181 768 | 161.8 | 53 |
| JSON | 7 938 292 | 126.0 | 3 751 543 | 266.6 | 83 |
| protobuf (protobufjs) | **9 485 580** | **105.4** | **12 701 006** | **78.7** | **33** |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **protobuf wins this round** on encode, decode **and** wire size. Two reasons:
  it packs `repeated` scalar fields (one tag + one length for the whole array,
  ~1 byte/value for small ints) and its `decode` is a tightly-tuned runtime.
* **`cstruct` codegen** is solidly second on decode (~6.18M) — within ~2× of
  protobuf — and on encode (~4.48M) it trails `JSON.stringify` (~7.94M).
* **Wire size** — protobuf 33 B (packed varint), `cstruct` 53 B (each element is
  a fixed 2-byte `u16` + an `i16` length prefix), JSON 83 B (text).
  For small-magnitude arrays protobuf's varint packing is the most compact;
  `cstruct`'s fixed-width arrays are predictable but not always the smallest.
* **Interpreters** (~0.51–0.54M encode, ~0.82–0.85M decode) — same model-walk
  cost as the other messages.

## Notes

* `cstruct` read returns a plain object with the string and a number array;
  protobuf `decode()` returns a `Message` (`.toObject()` for a plain object);
  `JSON.parse` returns a plain object.
* The `cstruct` three variants share the same 53-byte wire format and
  interoperate.
* Sibling results: [`FORMATS-RESULTS.md`](FORMATS-RESULTS.md) (simple fixed
  struct) and [`FORMATS-RESULTS-COMPLEX.md`](FORMATS-RESULTS-COMPLEX.md) (nested
  + fixed array + string).
