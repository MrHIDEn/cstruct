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
  // data = { name: "sensor-01",
  //          samples: 20 values spanning 0..65535 }  (mixed 1/2/3-byte varints,
  //                   so not skewed toward small ints)
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
| cstruct (Buffer, interpreted) | 546 888 | 1 828.5 | 880 092 | 1 136.2 | **53** |
| cstruct (DataView, interpreted) | 518 057 | 1 930.3 | 899 353 | 1 111.9 | **53** |
| cstruct (codegen) | **19 205 393** | **52.1** | **8 534 018** | **117.2** | **53** |
| JSON | 5 805 771 | 172.2 | 3 481 588 | 287.2 | 129 |
| protobuf (protobufjs) | 8 523 462 | 117.3 | 6 637 559 | 150.7 | 56 |

Higher ops/s is better; lower ns/op and wire bytes is better.

## How to read this

* **`cstruct` codegen leads on encode and decode** — encode ~19.2M (~2.3× faster
  than protobuf `encode` and ~3.3× faster than `JSON.stringify`), decode ~8.53M
  (~1.3× faster than protobuf `decode` and ~2.5× faster than `JSON.parse`) —
  because it reads/writes integers directly to the `Uint8Array` (no per-call
  `DataView`) and uses fast UTF-8 codecs.
* **`cstruct` wins wire size** — 53 B vs protobuf 56 B vs JSON 129 B. With a
  spread of magnitudes the fixed 2-byte `u16` beats varint: varint costs 3 bytes
  for values > 16 383, while `u16` stays at 2.
* **Wire size depends on value magnitude for protobuf, not for cstruct.** With
  all-small values (`[1..20]`) protobuf was 33 B vs cstruct 53 B; with this
  mixed spread it flips to 56 B vs 53 B. cstruct is constant/predictable,
  protobuf adapts (smaller for small ints, larger for big ints).
* **Interpreters** (~0.52–0.55M encode, ~0.88–0.90M decode) — same model-walk
  cost as the other messages.

## How varint works

protobuf's variable wire size here comes from **varint** (LEB128 / Base-128): an
integer encoding whose length is not declared anywhere — it's written into
every byte.

Each varint byte carries **7 bits of data + 1 "more?" flag** in the top bit
(MSB): `0` = "this number ends here", `1` = "one more byte follows". The decoder
just reads byte-by-byte until it sees an MSB of `0`; the 7-bit groups are
assembled least-significant-first.

| value (`uint32`) | bytes | MSB flags |
|---|---:|---|
| 1 | `01` | `01` = 0 (end) |
| 20 | `14` | `14` = 0 (end) |
| 127 | `7f` | `7f` = 0 (end) |
| 128 | `80 01` | `80` = 1 (more), `01` = 0 (end) |
| 300 | `ac 02` | `ac` = 1 (more), `02` = 0 (end) |
| 65535 | `ff ff 03` | `ff` = 1, `ff` = 1, `03` = 0 |
| 1000000 | `c0 84 3d` | `c0` = 1, `84` = 1, `3d` = 0 |

Worked example — `300` (binary `1 0010 1100`, 9 bits, so it does not fit in 7):

```text
300 = 1 0010 1100  ->  split into 7-bit groups, least-significant first
        │  └───┬───┘
        │   010 1100    (low 7 bits = 44)
        └─ 10           (remaining high bits = 2)

byte 1:  "more"(1) + 010 1100  =  1010 1100  =  ac
byte 2:  "end"(0)  + 0000 010  =  0000 0010  =  02
```

The decoder reverses it: `ac` (MSB=1 → keep `0101100`), `02` (MSB=0 → append
`0000010`), then reassembles `0000010 0101100` = `1 0010 1100` = **300**.

So varint is not general-purpose compression — it's a bet that integers are
small. It is **smaller than a fixed `u32` for values < ~268M** (1–4 bytes) but
**larger (5 bytes) for the top 1/16 of the range**. Negatives are the trap:
plain `int32` encodes them as 10-byte varints; protobuf's `sint32`/`sint64` fix
this with zigzag encoding (which interleaves ± so small negatives stay 1 byte).

## Notes

* `cstruct` read returns a plain object with the string and a number array;
  protobuf `decode()` returns a `Message` (`.toObject()` for a plain object);
  `JSON.parse` returns a plain object.
* The `cstruct` three variants share the same 53-byte wire format and
  interoperate.
* Sibling results: [`FORMATS-RESULTS.md`](FORMATS-RESULTS.md) (simple fixed
  struct) and [`FORMATS-RESULTS-COMPLEX.md`](FORMATS-RESULTS-COMPLEX.md) (nested
  + fixed array + string).
