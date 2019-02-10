const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('../index');

let b, o, s, t, r, x;
let buffer, arr, obj, offset, struct;

buffer = Buffer.from('ae47e17a14aef33f 1f85eb51b81e0940 1f85eb51b81e1940'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28}
struct = {
    a: {
        b: 'd',
        c: ['d', 'd']
    }
};
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.23,"c":[3.14,6.28]}}
console.log(offset); // 24

buffer = Buffer.alloc(2 * 8);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // 0000000000000000 0000000000000000
struct = ['d', 'd'];
arr = [1.23, 3.14];
offset = writeBufferLE(buffer, struct, arr);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // ae47e17a14aef33f 1f85eb51b81e0940
console.log(offset); // 16







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

