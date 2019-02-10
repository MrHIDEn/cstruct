const {
    parseStruct,
    readBufferLe,
    makeBufferLe,
} = require('../index');

let b, o, s, t, r, x;

s = { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' };
r = parseStruct(s);
s;
r;

[s, t] = [
    { p: 'XYZ' },
    { XYZ: { x: 'd', y: 'd', z: 'd' } }
];
r = parseStruct(s, t);
s;
r;


[s, t] = [
    ['XYZ', 'XYZ'],
    { XYZ: { x: 'd', y: 'd', z: 'd' } }
];
r = parseStruct(s, t);
s;
r;

[s, t] = [
    { 'a.array': 'u16', a: 'XYZ' },
    { XYZ: { x: 'd', y: 'd', z: 'd' } }
];
r = parseStruct(s, t);
s;
r;

[s, t, o] = [
    { 'a.array': 'u16', a: 'u16' },
    { },
    { a:[12,13,14] }
];
r = parseStruct(s, t);
s;
r;
let y = makeBufferLe(r, o);
y;

[s, t] = [
    { g: '2D' },
    { '2D': { x: 'f', y: 'f' } }
];
r = parseStruct(s, t);
s;
r;

[s, t] = [
    { g: '2D' },
    { '2D': { x: 'f', y: 'f' } }
];
r = parseStruct(s, t, { protect: false });
s;
r;

[s, t] = [
    { g: '2D' },
    { '2D': { x: 'f', y: 'f' } }
];
r = parseStruct(s, t, { protect: true });
s;
r;



//readBufferLe(buffer, struct, { protect = false, position = 0 } = {})
[b, s, x] = [
    Buffer.from('0b0b000b000000f5f5fff5ffffff000030410000000000002640​​​​​6162630000​​​​​', 'hex'),
    { a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' },
    { a: 11, b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' }
];
//expect(JSON.stringify(r = parseStruct(s))).toBe(JSON.stringify(x));
//expect(r).toBe(s);
b = Buffer.alloc(8);

b.fill(255);
console.log(b.toString('hex'));
console.log(b.writeUInt8(11, 0));
console.log(b.toString('hex'));
console.log(b.writeUInt16LE(11, 0));
console.log(b.toString('hex'));
console.log(b.writeUInt32LE(11, 0));
console.log(b.toString('hex'));

b.fill(0);
console.log(b.toString('hex'));
console.log(b.writeInt8(-11, 0));
console.log(b.toString('hex'));
console.log(b.writeInt16LE(-11, 0));
console.log(b.toString('hex'));
console.log(b.writeInt32LE(-11, 0));
console.log(b.toString('hex'));

b.fill(255);
console.log(b.toString('hex'));
console.log(b.writeFloatLE(21, 0));
console.log(b.toString('hex'));
console.log(b.writeDoubleLE(22, 0));
console.log(b.toString('hex'));
b = Buffer.alloc(5);
b.fill(0);
console.log(b.write('abc', 0));
console.log(b.toString('hex'));

//{ a: 'u8', b: 'u16', c: 'u32', d: 'i8', e: 'i16', f: 'i32', g: 'f', h: 'd', i: 's5' }
let h = '0b 0c00 0d000000 f5 f4ff f3ffffff 0000a841 0000000000003640 6162630000'.replace(/ /g, '');
b = Buffer.from(h, 'hex');
console.log(b.length);
console.log(b.toString('hex'));
r = readBufferLe(b, s);
console.log(JSON.stringify(r));

const le = {
    u8(v) { let b = Buffer.allocUnsafe(1); b.writeUInt8(v, 0); return b; },
    u16(v) { let b = Buffer.allocUnsafe(2); b.writeUInt16LE(v, 0); return b; },
    u32(v) { let b = Buffer.allocUnsafe(4); b.writeUInt32LE(v, 0); return b; },
    i8(v) { let b = Buffer.allocUnsafe(1); b.writeInt8(v, 0); return b; },
    i16(v) { let b = Buffer.allocUnsafe(2); b.writeInt16LE(v, 0); return b; },
    i32(v) { let b = Buffer.allocUnsafe(4); b.writeInt32LE(v, 0); return b; },
    f(v) { let b = Buffer.allocUnsafe(4); b.writeFloatLE(v, 0); return b; },
    d(v) { let b = Buffer.allocUnsafe(8); b.writeDoubleLE(v, 0); return b; },
    s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s,'\0'), 0, s); return b; },
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
    s(v, s) { let b = Buffer.allocUnsafe(s); b.write(v.padEnd(s,'\0'), 0, s); return b; },
}

console.log(le.s('abc',10));
console.log(be.s('abc',10));
console.log(le.f(11));
console.log(be.f(11));
console.log(le.u32(11));
console.log(be.u32(11));

[h, s, t, x] = [
        //21       21
        ' 0000a841 0000a841'.replace(/ /g, ''),
        { g: '2D' },
        { '2D': { x: 'f', y: 'f' } },
        [{ g: { x: 21, y: 21 } }, 8],
];
b = Buffer.from(h, 'hex');
b;
console.log(parseStruct(s, t));
console.log(JSON.stringify(r = readBufferLe(b, parseStruct(s, t))))
console.log(JSON.stringify(x));
console.log(r[0]);
console.log(s);
console.log(r[1]);
console.log(h.length / 2);