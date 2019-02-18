// 'c_struct' - written by marekkrzyzowski 31.01.2019 0.6.0
'use strict';

const lib = require('./lib');
// , readBufferLE, writeBufferLE, makeBufferLE,

function preAllocSize(newSize) {
    if (newSize) lib.PRE_ALLOC_SIZE = newSize;
    return lib.PRE_ALLOC_SIZE;
}

function struct(base, types = {}) {
    return new lib.C_Struct(base, types);
}

module.exports.preAllocSize = preAllocSize;
module.exports.struct = struct;

//todo
// /[\s\w]*\{[\s\w ,;]*\}\s*;/g
// ' A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};'

//let m = ' A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};'.match(/[\s\w]*\{[\s\w ,;]*\}\s*;/g);
//console.log(m);

// let model1 = struct(
//     `
//     string d[u8];
//     `,
//     // Xy d[u8];
//     // `
//     // Xy a, b;
//     // u16 h;

//     // `,
//     `Xy {
//         u8 a ,z[3];
//     };
//     A { u8 x, y ; } ; B { u16 a ; } ;C{u32 g;};
//     `
// );
// Xy
let model1 = struct(
    `u8 a, b, c;`
);
model1;
let buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
let read = model1.readBE(buffer, 2);
read;
console.log(model1.offset);

buffer = Buffer.alloc(7);
let write = model1.writeBE(buffer, { a: 65, b: 66, c: 67 }, 2);
write;
console.log(buffer.toString('hex'));

// let make = model1.makeLE({ a: 65, b: 66, c: 67 });
// ({ a: 'u8', b: 'u8', c: 'u8' }, { a: 65, b: 66, c: 67 });
let make = model1.makeBE({ a: 65, b: 66, c: 67 });
make;

buffer = Buffer.concat([Buffer.from([2,65,66,67]), Buffer.allocUnsafe(100)]);
console.log(buffer.toString('hex'));

let model2 = struct(
    `u8 [3];`
);
read = model2.readBE(buffer);
read;

let model3 = struct(
    `u8 a[3];`
);
read = model3.readBE(buffer);
read;

let model4 = struct(
    `u8 a[u8];`
);
read = model4.readBE(buffer);
read;

let model5 = struct(
    `string s[u8];`
);
read = model5.readBE(buffer);
read;

let model6 = struct(`
    u16 a;
    u8 b;
    d c;`
);
read = model6.readBE(buffer);
read;

let model7 = struct(`
    ABC a;
    u8 b;`,`
    ABC { u8 a,b,c; };`
);
read = model7.readBE(buffer);
read;

let model8 = struct(`
    Octave noise[2];
    Octave vibr_x[2];
    Octave vibr_y[2];
    Octave vibr_z[2];
    `,`
    Octave { f band, value; };
    `
);
read = model8.readBE(buffer);
read;

let model9 = struct(`
    Octave noise[u8];
    `,`
    Octave { f band, value; };`
);
read = model9.readBE(buffer);
read;