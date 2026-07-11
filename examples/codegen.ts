import { CStructBE, CStructLE } from '../src';

const model = { x: 'u16', y: 'i32', flag: 'b8' };
const data = { x: 13, y: -7, flag: true };

// --- Static compile (parse model once) ---
const readFrameBe = CStructBE.compileRead(model);
const makeFrameBe = CStructBE.compileMake(model);

const { buffer } = makeFrameBe(data);
const readResult = readFrameBe(buffer);

console.log('BE compileRead:', readResult.struct);
// { x: 13, y: -7, flag: true }

// --- Instance compile (uses cached parsedModel) ---
const cStructLe = CStructLE.fromModelTypes(model);
const readFrameLe = cStructLe.compileRead();
const writeFrameLe = cStructLe.compileWrite();

const leBuffer = cStructLe.make(data).buffer;
const writeTarget = Buffer.alloc(leBuffer.length);
writeFrameLe(data, writeTarget, 0);

console.log('LE compileWrite hex:', writeTarget.toString('hex'));
console.log('LE parity:', JSON.stringify(readFrameLe(leBuffer).struct) === JSON.stringify(data));

// --- With fromCompiled ---
const fromCompiled = CStructBE.fromCompiled(cStructLe.jsonModel);
console.log('fromCompiled + compileRead:', fromCompiled.compileRead()(buffer).struct);
