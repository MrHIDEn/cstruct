const {
    parseStruct,
    readBufferLE,
    makeBufferLE,
} = require('../index');

let b, o, s, t, r, x;

let [buff, off] = makeBufferLE({ a: { b: 'f', c: ['f', 'f', 's5'] } }, { a: { b: 1.23, c: [3.14, 6.28, 'Hello'] } });
console.log(buff.toString('hex'));
let buffer = Buffer.from('a4709d3f c3f54840 c3f5c840 48656c6c6f'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28, 'Hello'}
console.log(buffer.toString('hex'));
let struct = { a: { b: 'f', c: ['f', 'f', 's5'] } };
let [obj, offset] = readBufferLE(buffer, struct);
obj;
// {
//     a: {
//         b: 1.2300000190734863,
//         c: [3.140000104904175, 6.28000020980835, 'Hello']
//     }
// }
offset; // 17



//{ a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' }
//let h = '0b 0c00 0d000000 f5 f4ff f3ffffff 0000a841 0000000000003640 6162630000'.replace(/ /g, '');
//b = Buffer.from(h, 'hex');

const le = {
    u8(v) { let b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); return b; },
    u16(v) { let b = Buffer.allocUnsafe(2); b.writeUInt16LE(v, 0); return b; },
    u32(v) { let b = Buffer.allocUnsafe(4); b.writeUInt32LE(v, 0); return b; },
    i8(v) { let b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); return b; },
    i16(v) { let b = Buffer.allocUnsafe(2); b.writeInt16LE(v, 0); return b; },
    i32(v) { let b = Buffer.allocUnsafe(4); b.writeInt32LE(v, 0); return b; },
    f(v) { let b = Buffer.allocUnsafe(4); b.writeFloatLE(v, 0); return b; },
    d(v) { let b = Buffer.allocUnsafe(8); b.writeDoubleLE(v, 0); return b; },
    s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s, '\0'), 0, s); return b; },
}
const be = {
    u8(v) { let b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); return b; },
    u16(v) { let b = Buffer.allocUnsafe(2); b.writeUInt16BE(v, 0); return b; },
    u32(v) { let b = Buffer.allocUnsafe(4); b.writeUInt32BE(v, 0); return b; },
    i8(v) { let b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); return b; },
    i16(v) { let b = Buffer.allocUnsafe(2); b.writeInt16BE(v, 0); return b; },
    i32(v) { let b = Buffer.allocUnsafe(4); b.writeInt32BE(v, 0); return b; },
    f(v) { let b = Buffer.allocUnsafe(4); b.writeFloatBE(v, 0); return b; },
    d(v) { let b = Buffer.allocUnsafe(8); b.writeDoubleBE(v, 0); return b; },
    s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s, '\0'), 0, s); return b; },
}

// console.log(le.s('abc', 10));
// console.log(be.s('abc', 10));
// console.log(le.f(11));
// console.log(be.f(11));
// console.log(le.u32(11));
// console.log(be.u32(11));

