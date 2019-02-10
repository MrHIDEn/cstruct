const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('../index');

let b, o, s, t, r, x;
let buffer, arr, obj, offset, struct;



buffer = Buffer.from("James\0\0\0\0\0" + "Bond\0\0\0\0\0\0" + "007\0\0\0\0\0\0\0");
console.log(buffer.toString('hex')); // 4a616d65730000000000426f6e6400000000000030303700000000000000
struct = { user: { first: 's10', last: 's10', licence: 's10' } };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"user":{"first":"James","last":"Bond","licence":"007"}}
console.log(offset); //30







//{ a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' }
//let h = '0b 0c00 0d000000 f5 f4ff f3ffffff 0000a841 0000000000003640 6162630000'.replace(/ /g, '');
//b = Buffer.from(h, 'hex');

// const le = {
//     u8(v) { let b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); return b; },
//     u16(v) { let b = Buffer.allocUnsafe(2); b.writeUInt16LE(v, 0); return b; },
//     u32(v) { let b = Buffer.allocUnsafe(4); b.writeUInt32LE(v, 0); return b; },
//     i8(v) { let b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); return b; },
//     i16(v) { let b = Buffer.allocUnsafe(2); b.writeInt16LE(v, 0); return b; },
//     i32(v) { let b = Buffer.allocUnsafe(4); b.writeInt32LE(v, 0); return b; },
//     f(v) { let b = Buffer.allocUnsafe(4); b.writeFloatLE(v, 0); return b; },
//     d(v) { let b = Buffer.allocUnsafe(8); b.writeDoubleLE(v, 0); return b; },
//     s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s, '\0'), 0, s); return b; },
// }
// const be = {
//     u8(v) { let b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); return b; },
//     u16(v) { let b = Buffer.allocUnsafe(2); b.writeUInt16BE(v, 0); return b; },
//     u32(v) { let b = Buffer.allocUnsafe(4); b.writeUInt32BE(v, 0); return b; },
//     i8(v) { let b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); return b; },
//     i16(v) { let b = Buffer.allocUnsafe(2); b.writeInt16BE(v, 0); return b; },
//     i32(v) { let b = Buffer.allocUnsafe(4); b.writeInt32BE(v, 0); return b; },
//     f(v) { let b = Buffer.allocUnsafe(4); b.writeFloatBE(v, 0); return b; },
//     d(v) { let b = Buffer.allocUnsafe(8); b.writeDoubleBE(v, 0); return b; },
//     s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s, '\0'), 0, s); return b; },
// }

// console.log(le.s('abc', 10));
// console.log(be.s('abc', 10));
// console.log(le.f(11));
// console.log(be.f(11));
// console.log(le.u32(11));
// console.log(be.u32(11));

