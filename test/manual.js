const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('../index');

let b, o, s, t, r, x;
let buffer, arr, obj, offset, struct, types, base;

var a = 5;
b = 10;

function struc(strings, ...values) {
    console.log(strings.raw);
    console.log(strings);
    console.log(values);
    let a = [];
    let o = {};
    for (let s of strings) {
        let d = s.split('\n');
        d;
        for (let x of d) {
            if (!x) continue;
            x;
            x = x.replace(/^\s*(.+);$/, '$1');
            x;
            let m = x.match(/^(\w[\w\d]*) (.*)$/);
            m;
            if (!m) continue;
            let [, t, r] = m;
            t;
            r;
            r = r.split(/\s*,\s*/);
            r;
            for (let k of r) {
                let m = k.match(/^(\w[\w\d]*)\[(\d+)\]$/);
                if (m == null)
                    o[k] = t;
                else {
                    let [, n, s] = m;
                    n;
                    s;
                    o[n] = Array(+s).fill(t);
                }
            }
            o;
            x;
            a.push(x);
        }
    }
    a;
    o;
    //class Schema
    return { struct: o };
}
function struct(base, types = {}) {
    if (typeof types == 'string') {
        let tmp = types;
        types = {};
        tmp = tmp.replace(/\n/g, '');
        tmp;
        tmp = tmp.replace(/\}\s*;/g, '\n').split('\n');
        tmp;
        for (let x of tmp) {
            if (!x) continue;
            x;
            let m = x.match(/^\s*(\w[\w\d]*)\s*\{\s*(.*;)\s*$/);//array? Xy [ u8, u8 ], niee
            let [, type, r] = m;
            r = r.split(';');
            type;
            r;
            types[type] = {};
            for (let x of r) {
                if (!x) continue;
                console.log(types[type]);
                console.log([x]);
                //todo cos nie trybi
                x;
                //r = r.split(/\s*,\s*/);
                let m = x.match(/^\s*(\w[\w\d]*) (.*)$/);
                m;
                if (!m) continue;
                let [, t, r] = m;
                t;
                r;
                r = r.split(/\s*,\s*/);// ','
                r;
                //todo
                for (let x of r) {
                    x;
                    console.log(types[type]);
                    let m = x.match(/^(\w[\w\d]*)\[(\d+)\]$/);
                    if (m == null)
                        types[type][x] = t;
                    else {
                        let [, n, s] = m;
                        n;
                        s;
                        types[type][n] = Array(+s).fill(t);
                    }
                    console.log(types[type]);
                }
                console.log(types[type]);
            }

            //types[type] = r;
        }
        types;
    }
    if (typeof base == 'string') {
        base;
    }
    types;
    base;

    let model = new C_Struct();
    return model;
}

let model = struct(
    `Xy a[2];`,
    `Xy {
        u8 z[3];
    };`
);
model;
//wlasny format
/*

*/

// let St1 = struc`
//     u8 a[2];
//     u8 b, c;
//     u8 d;`
// let St1 = struc`
//     u8 a[2];`
let St1 = { struct: { a: ['u8', 'u8'] } };
St1;
let St2 = struc`${St1} s;`;
St2;

// let Plot = struc`
//     u8 x, y;//Hello 
//     ${Color} color;
//     //u16 g`;
// Plot;
return;

//buffer = Buffer.alloc(7, 0x00)

/* C struct
typedef struct {
    uint8_t x;
    uint8_t y;
    uint8_t z;
} Xyx;         */

// #1a - PARSE (base is unprotected), READ+OFFSET
base = { xyz: 'Xyz' };
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // {"xyz":"Xyz"}
// PARSE
struct = parseStruct(base, types);

console.log(JSON.stringify(base)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}  <== Changed
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}

// #2 READ + OFFSET (struct is unprotected)
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}
[obj, offset] = readBufferLE(buffer, struct, { offset: 2 });
console.log(JSON.stringify(obj)); // {"xyz":{"a":170,"b":187,"c":204}}
console.log(offset); // 5
console.log(JSON.stringify(struct)); // {"xyz":{"a":170,"b":187,"c":204}}  <== Changed


// #3 - PARSE (struct is protected)
base = { xyz: 'Xyz' };
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // {"xyz":"Xyz"}
// PARSE
struct = parseStruct(base, types, { protect: true });

console.log(JSON.stringify(base)); // {"xyz":"Xyz"}  <== Unchanged
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}

// #4 READ + OFFSET (struct is protected)
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}
[obj, offset] = readBufferLE(buffer, struct, { offset: 2, protect: true });
console.log(JSON.stringify(obj)); // {"xyz":{"a":170,"b":187,"c":204}}
console.log(offset); // 5
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}  <== Unchanged

// #5 - PARSE (struct is protected)
base = ['Xyz', 'Xyz', 'Xyz'];
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // ["Xyz","Xyz","Xyz"]
// PARSE
struct = parseStruct(base, types, { protect: true });

console.log(JSON.stringify(base)); // ["Xyz","Xyz","Xyz"]  <== Unchanged
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]

// #6 READ (struct is protected)
buffer = Buffer.from('01 02 03  04 05 06  07 08 09'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 010203040506070809
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]
[obj, offset] = readBufferLE(buffer, struct, { protect: true });
console.log(JSON.stringify(obj)); // [{"x":1,"y":2,"z":3},{"x":4,"y":5,"z":6},{"x":7,"y":8,"z":9}]
console.log(offset); // 9
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]  <== Unchanged




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

