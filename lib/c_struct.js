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

