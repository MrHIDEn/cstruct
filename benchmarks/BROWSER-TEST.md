# Browser smoke test

A manual, opt-in smoke test that verifies the browser-ready path of
`@mrhiden/cstruct` — `CStructUint8Array` (DataView / Uint8Array / TextDecoder,
**no `Buffer`**) — in a real headless Chrome/Chromium.

It is **not** part of the CI pipeline. CI only runs `npm run lint`,
`npm test` and `npm run build` (see `.github/workflows/lint-test.yml`,
`pull-request.yml`, `npm-publish.yml`); `bench:browser` is a separate
script that no workflow invokes. Run it by hand when you want to confirm
the browser path still works.

## Run it

```bash
npm run bench:browser
```

Prerequisites:

* Node.js (any recent version) and `npm install` (so `lib/` can be built).
* A local Chrome/Chromium. The runner auto-detects Chrome, Chromium,
  Brave and Edge on macOS/Linux/Windows; override with `CHROME_BIN`:

  ```bash
  CHROME_BIN="/path/to/chrome" npm run bench:browser
  ```

Exit code `0` = all assertions passed, `1` = failures or missing prerequisites.

## What it does

1. Builds `lib/` with `tsc` if it is missing (`lib/` is gitignored).
2. Bundles the CommonJS `lib/index.js` (45 modules) into a single IIFE —
   a ~40-line dependency-free bundler, no esbuild/webpack needed.
3. Generates a self-contained HTML page with the assertions from `test.js`.
4. Runs `--headless=new --dump-dom` in the detected browser and parses the
   result (`<title>` + the `#out` block).

Generated artifacts land in `benchmarks/browser/.tmp/` (gitignored).

## What it covers (31 assertions)

| Area | Assertions |
|---|---|
| scalars / endianness | `u8`/`i16`/`f` LE make+read bytes & offset/size; `i16[3]` BE; constructor `{ endian: 'be' }` |
| full-width atoms | `u32`/`i32`/`u64`/`i64`/`d`/`b8`/`b16` round-trip (incl. `BigInt`) |
| strings | `s4` (utf8), `ws4` (utf16le), null-terminated `s0`, dynamic `s[i16]` |
| buffers | dynamic `buf[i16]` with a plain `Uint8Array` value |
| structs | nested object + enum (BE); JSON field `j[i16]` |
| API surface | `make()` returns a plain `Uint8Array`; `read()` accepts a `byteOffset` view; `write()` into a pre-allocated array at offset; too-short write throws; `fromCompiled` parity |
| errors | unknown type throws; invalid endian throws |
| aliases | `uint8`/`BOOL`/`INT`/`float`/`string4` round-trip |
| codegen | `compileMake`/`compileRead`/`compileWrite` byte-parity with the interpreter |

## Latest result

```
CStruct browser smoke test
pass: 31, fail: 0, total: 31

PASS  basic LE make bytes
...
RESULT: ALL OK
```

* Last run: 2026-10-09, Google Chrome (headless=new), macOS (Apple Silicon),
  `@mrhiden/cstruct` 1.8.x.

## Files

* `benchmarks/browser/run.cjs` — runner (build → bundle → html → headless Chrome → parse).
* `benchmarks/browser/test.js` — the browser assertions.
* `benchmarks/BROWSER-TEST.md` — this report.
