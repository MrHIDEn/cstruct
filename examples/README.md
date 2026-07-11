# Examples

Runnable scripts in this folder. Build first (`npm run build`), then run with `npx ts-node examples/<file>.ts`.

| File | Topic |
|------|-------|
| [`simple-model.ts`](./simple-model.ts) | Basic make/read, offset, write into existing buffer |
| [`simple-model-types.ts`](./simple-model-types.ts) | Named types, arrays, `write` |
| [`string-model.ts`](./string-model.ts) | String-based models, LE vs BE |
| [`string-model-types.ts`](./string-model-types.ts) | String models + named types |
| [`little-endian.ts`](./little-endian.ts) | BE vs LE side-by-side |
| [`write-offset.ts`](./write-offset.ts) | `make` vs `write` with offset |
| [`with-buffer.ts`](./with-buffer.ts) | `bufN` / binary buffer fields |
| [`wstring.ts`](./wstring.ts) | `wsN` / UTF-16LE wide strings |
| [`trailing-zero.ts`](./trailing-zero.ts) | Trailing zero for `s[0]`, `j[0]`, arrays |
| [`ending-zero.ts`](./ending-zero.ts) | End-zero variants (`s0`, `j0`, `buf0`) |
| [`dynamic-model.ts`](./dynamic-model.ts) | Dynamic arrays, strings, buffers |
| [`json-model.ts`](./json-model.ts) | JSON / `any` fields with decorators |
| [`decorators.ts`](./decorators.ts) | `@CStructClass`, `@CStructProperty` |
| [`c-struct-types.ts`](./c-struct-types.ts) | C `typedef struct` parsing |
| [`plc.ts`](./plc.ts) | PLC aliases (`BYTE`, `WORD`, `BOOL`) |
| [`JS-from-model-types.js`](./JS-from-model-types.js) | JavaScript (CommonJS) usage |
| [`JS-ending-zero.js`](./JS-ending-zero.js) | JavaScript trailing/end zero |

`npm run sandbox` runs [`sandbox.ts`](./sandbox.ts) for local experiments.
