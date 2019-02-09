// cstruct2 mh-cstruct c_struct
// const cs2 = require('cstruct2');

//v rename position to offset
//todo simple proxy pbuffer.readx('u16le'[, offset]) pbuffer.writex('u16le', val[, offset])
//todo simple proxy pbuffer.readLE('u16'[, offset]) pbuffer.writeBE('u16le', val[, offset])
//todo simple proxy pbuffer.le.read('u16'[, offset]) pbuffer.be.write('u16', val[, offset])
//todo simple proxy pbuffer.le.read('s16'[, offset]) pbuffer.be.write('s16', val[, offset])

//v dynamic buffer allocation for write, extender
//v options, writeBufferLe(b1, r, o, options), writeBufferLe(b1, r, o, {offset: 0})

//v rename .length to size
//v array  pre-length s={"a.size", a:'u16'}
//todo assign .length for strings
//todo string pre-length s={"a.length":'u8', a:'s' }


function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}

// let s = { 'a.length': 'u8', s: 'u8' };
// let s = { 'a.length': 'u8', a: { a: 'u8' } };
// let s = { 'a.length': 'u8', a: 'T' };
// let t = { T: { x: 'u8', y: 'u8', z: 'u8' } };
let t1 = { T: { x: 'u16', y: 'u16', z: 'u16' } };
let s1 = { 'a.length': 'u16', a: 'T', s: 's10', f: 'f', d: 'd' };
let r1 = parseStruct(s1, t1, { protect: true });
r1;

let o1 = { a: [{ x: 11, y: 12, z: 13 }, { x: 21, y: 22, z: 33 }], s: 'MAREK', f: 1.23, d: 1.23 }
let b1 = Buffer.alloc(36);
let p1 = writeBufferLe(b1, r1, o1);
p1;
b1 = b1.slice(0, p1);
console.log(b1.toString('hex'));
console.log(hex2(b1));
let [o2, p2] = readBufferLe(b1, r1, { protect: true });
o2;
p2;

//r1 = parseStruct(s1, t1, { protect: true });
r1;
t1;
o1;
let [b3, p3] = makeBufferLe(r1, o1);
console.log(b3.toString('hex'));
p3;
//16

let [b4, p4] = makeBufferLe(['f', 'f', 'f', 'f'], [1.1, 2.2, 3.3, 4.4]);
console.log(hex4(b4));
p4;
let [o5, p5] = readBufferLe(b4, ['f', 'f', 'f', 'f'], { protect: true });
o5;
p5;


// // let s = { 'a.length': 'u8', s: 'u8' };
// // let s = { 'a.length': 'u8', a: { a: 'u8' } };
// let s = { 'a.length': 'u8', a: 'T' };
let t0 = { T: { x: 'u16', y: 'u16', z: 'u16' } };
let s0 = { a: 'T' };
let r0 = parseStruct(s0, t0, { protect: true });
r0;//​​​​​{ a: { x: 'u16', y: 'u16', z: 'u16' } }​​​​​

// let b = Buffer.concat([
//     Buffer.from([2, 4, 5, 6, 7, 8, 9])
// ]);
// console.log(b.toString('hex'));
// let [o, p] = readBufferBe(b, r, true);
// o;
// p;
// let b2 = Buffer.alloc(b.length);
// r;
// let p2 = writeBufferBe(b2, r, o);
// console.log(b.toString('hex'));
// console.log(b2.toString('hex'));
// p2;