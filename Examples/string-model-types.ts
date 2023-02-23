import { hexToBuffer, CStructBE, CStructLE } from "../src/index";


/**
 * Read/try `examples\simple-numbers.js` first to get general idea of using this library
 * This section is based on `string` or `JSON` models for BASE and TYPES
 * You can mix Object/String models for BASE=Object/String and TYPES=Object/String
 */

/**
 * Advanced struct parser/reader, String based, or JSON based.
 * readBE(BASE)
 */

/**
 * String based
 */
buffer = Buffer.from("01 0101 00000102".replace(/[ ,\n]+/g, ''), 'hex');

model = struct("[u8]");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1]

model = struct("[u8, u16, u32]");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1,257,258]

model = struct("{ a: 'u8' }");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1}

model = struct("{ a: 'u8', b: 'u16', c: 'u32' }");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":257,"c":258}

model = struct("{ a: { b: 'u8', c: 'u16' }, d: 'u32' }");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"b":1,"c":257},"d":258}

model = struct("{ a: 'u8', b: ['u16', 'u32'] }");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":[257,258]}

model = struct("{ a: [{ b: 'u8' }, { c: 'u16' }, { d: 'u32' }] }");
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[{"b":1},{"c":257},{"d":258}]}

/**
 * JSON based
 */
buffer = Buffer.from("01 0101 00000102".replace(/[ ,\n]+/g, ''), 'hex');

model = struct('["u8"]');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1]

model = struct('["u8", "u16", "u32"]');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1,257,258]

model = struct('{ "a": "u8" }');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1}

model = struct('{ "a": "u8", "b": "u16", "c": "u32" }');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":257,"c":258}

model = struct('{ "a": { "b": "u8", "c": "u16" }, "d": "u32" }');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"b":1,"c":257},"d":258}

model = struct('{ "a": "u8", "b": ["u16", "u32"] }');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":[257,258]}

model = struct('{ "a": [{ "b": "u8" }, { "c": "u16" }, { "d": "u32" }] }');
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[{"b":1},{"c":257},{"d":258}]}

/**
 * String based
 * Type struct parser/reader
 * readBE(BASE, TYPES)
 */
buffer = Buffer.from("01 0101 00000102 02 0103 00000104".replace(/[ ,\n]+/g, ''), 'hex');
model = struct('["TestType", "TestType"]', `{
  TestType: ["u8", "u16", "u32"]
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[1,257,258],[2,259,260]]

model = struct('{ a: "TestType", b: { c: "TestType" } }', `{
  TestType: ["u8", "u16", "u32"]
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[1,257,258],"b":{"c":[2,259,260]}}

model = struct(`{ a: "TestType" }`, `{
  TestType: { x: "u8", y: "u16", z: "u32" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"x":1,"y":257,"z":258}}

model = struct(`["Xyz", "Abc"]`, `{
  Xyz: { x: "u8", y: "u16", z: "u32" },
  Abc: { a: "u8", b: "u16", c: "u32" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"x":1,"y":257,"z":258},{"a":2,"b":259,"c":260}]

/**
 * JSON based
 * Type struct parser/reader
 * readBE(BASE, TYPES)
 */
buffer = Buffer.from("01 0101 00000102 02 0103 00000104".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["TestType", "TestType"]`, `{
  "TestType": ["u8", "u16", "u32"]
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[1,257,258],[2,259,260]]

model = struct(`{ "a": "TestType", "b": { "c": "TestType" } }`, `{
  "TestType": ["u8", "u16", "u32"]
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[1,257,258],"b":{"c":[2,259,260]}}

model = struct(`{ "a": "TestType" }`, `{
  "TestType": { "x": "u8", "y": "u16", "z": "u32" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"x":1,"y":257,"z":258}}

model = struct(`["Xyz", "Abc"]`, `{
  "Xyz": { "x": "u8", "y": "u16", "z": "u32" },
  "Abc": { "a": "u8", "b": "u16", "c": "u32" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"x":1,"y":257,"z":258},{"a":2,"b":259,"c":260}]

/**
 * String based
 * Floating points section
 * f - float32, float
 * d - float64, double
 */
buffer = Buffer.from("01 02 03 04 05 06 07 08".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["RGBA", "RGBA"]`, `{
  RGBA: { r: "u8", g: "u8", b: "u8", a: "u8" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"r":1,"g":2,"b":3,"a":4},{"r":5,"g":6,"b":7,"a":8}]

buffer = Buffer.from(`
41300000
41b00000
42040000
42300000
425c0000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct(`[["Point3Df32"], { "2D": "Point2Df32" }]`, `{
  Point2Df32: { x: "f", y: "f" },
  Point3Df32: { x: "f", y: "f", z: "f" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

buffer = Buffer.from(`
4026000000000000
4036000000000000
4040800000000000
4046000000000000
404B800000000000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct(`[["Point3Df64"], { "2D": "Point2Df64" }]`, `{
  Point2Df64: { x: "d", y: "d" },
  Point3Df64: { x: "d", y: "d", z: "d" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

/**
 * JSON based
 * Floating points section
 * f - float32, float
 * d - float64, double
 */
buffer = Buffer.from("01 02 03 04 05 06 07 08".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["RGBA", "RGBA"]`, `{
  "RGBA": { "r": "u8", "g": "u8", "b": "u8", "a": "u8" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"r":1,"g":2,"b":3,"a":4},{"r":5,"g":6,"b":7,"a":8}]

buffer = Buffer.from(`
41300000
41b00000
42040000
42300000
425c0000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct(`[["Point3Df32"], { "2D": "Point2Df32" }]`, `{
  "Point2Df32": { "x": "f", "y": "f" },
  "Point3Df32": { "x": "f", "y": "f", "z": "f" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

buffer = Buffer.from(`
4026000000000000
4036000000000000
4040800000000000
4046000000000000
404B800000000000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct(`[["Point3Df64"], { "2D": "Point2Df64" }]`, `{
  "Point2Df64": { "x": "d", "y": "d" },
  "Point3Df64": { "x": "d", "y": "d", "z": "d" }
}`);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

/**
 * String based
 * Cursor/offset auto increments
 * You can use the same model every time but you need to reset offset
 *
 * Most examples are BE - BigEndian
 * Here are some LE - LittleEndian as well
 */
buffer = Buffer.from(`
0102
0304
0506
0708
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["u16", "u16"]`);

readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer);        // model remember offset, witch is now 4= 2 * 2B
console.log(JSON.stringify(readBE));
// BE: [1286,1800]

readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]

readLE = model.readLE(buffer, 0);     // reset offset
console.log(JSON.stringify(readLE));
// LE: [513,1027]
readLE = model.readLE(buffer);        // continue offset
console.log(JSON.stringify(readLE));
// LE: [1541,2055]

/**
 * JSON based
 * Cursor/offset auto increments
 * You can use the same model every time but you need to reset offset
 *
 * Most examples are BE - BigEndian
 * Here are some LE - LittleEndian as well
 */
buffer = Buffer.from(`
0102
0304
0506
0708
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["u16", "u16"]`);

readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer);        // model remember offset, witch is now 4= 2 * 2B
console.log(JSON.stringify(readBE));
// BE: [1286,1800]

readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]

readLE = model.readLE(buffer, 0);     // reset offset
console.log(JSON.stringify(readLE));
// LE: [513,1027]
readLE = model.readLE(buffer);        // continue offset
console.log(JSON.stringify(readLE));
// LE: [1541,2055]

/**
 * Writing... - write to existing buffer
 * Making... - make buffer, write data there and trim it to the minimum
 *
 * Write examples below are so similar to `read` that you can make them by similarity
 */

/** Write, String based */
buffer = Buffer.from(`
00 00 00 00
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`[u8, u8]`);
offset = model.writeBE(buffer, [2, 3]);
console.log(buffer.toString('hex'));
// 02030000
/**
 * This can be use to write data by different models one by one
 */
offset = model.writeBE(buffer, [5, 6]); // continue offset
console.log(buffer.toString('hex'));
// 02030506

model = struct(`{ f32: "f" }`);
offset = model.writeBE(buffer, { f32: 55 }, 0); // reset offset, BE
console.log(buffer.toString('hex'));
// 425c0000
offset = model.writeLE(buffer, { f32: 55 }, 0); // reset offset, LE
console.log(buffer.toString('hex'));
// 00005c42


/** Write, JSON based */
buffer = Buffer.from(`
00 00 00 00
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(`["u8", "u8"]`);
offset = model.writeBE(buffer, [2, 3]);
console.log(buffer.toString('hex'));
// 02030000
/**
 * This can be use to write data by different models one by one
 */
offset = model.writeBE(buffer, [5, 6]); // continue offset
console.log(buffer.toString('hex'));
// 02030506

model = struct(`{ "f32": "f" }`);
offset = model.writeBE(buffer, { f32: 55 }, 0); // reset offset, BE
console.log(buffer.toString('hex'));
// 425c0000
offset = model.writeLE(buffer, { f32: 55 }, 0); // reset offset, LE
console.log(buffer.toString('hex'));
// 00005c42


/** Make, String based */
buffer = null;
model = struct(`{ points: ['2D', '2D', '2D'] }`, `{ "2D": { x: 'f', y: 'f' } }`);
buffer = model.makeBE({
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 41300000 41b00000 42040000 42300000 429a0000 42840000
buffer = model.makeLE({
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 00003041 0000b041 00000442 00003042 00009a42 00008442

/** Make, JSON based */
buffer = null;
model = struct(`{ "points": ["2D", "2D", "2D"] }`, `{ "2D": { "x": "f", "y": "f" } }`);
buffer = model.makeBE({
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 41300000 41b00000 42040000 42300000 429a0000 42840000
buffer = model.makeLE({
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 00003041 0000b041 00000442 00003042 00009a42 00008442

const { struct } = require('../index');

let model, buffer, read, write;

buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/[ \n]/g, ''), 'hex'); // buffer= 0000aabbcc0000

model = struct(
    `{u8 a, b, c;}`
); // C_Struct {_offset: 0, _struct: "{"a":"u8","b":"u8","c":"u8"}"}
read = model.readBE(buffer, 2); // offset= 2, read= {a: 170, b: 187, c: 204}= {a: 0xaa, b: 0xbb, c:0xcc}
console.log(read); // Object {a: 170, b: 187, c: 204}
console.log(model.offset); // 5

buffer = Buffer.alloc(7); // Buffer(7) 00000000000000
write = model.writeBE(buffer, { a: 170, b: 187, c: 204 }, 3);
console.log(write); // 6
console.log(buffer.toString('hex')); // String 000000aabbcc00

buffer = Buffer.concat([Buffer.from([2,65,66,67]), Buffer.alloc(20, 0xcc)]);
console.log(buffer.toString('hex')); // String 02414243cccccccccccccccccccccccccccccccccccccccc

model = struct(
    `[3/u8];`
); // C_Struct {_offset: 0, _struct: "["u8","u8","u8"]"}
read = model.readBE(buffer);
console.log(read); // Array(3) [2, 65, 66]

model = struct(
    `u8 [3];`
); // C_Struct {_offset: 0, _struct: "["u8","u8","u8"]"}
read = model.readBE(buffer);
console.log(read); // Array(3) [2, 65, 66]

model = struct(
    `{u8 a[3];}`
); // C_Struct {_offset: 0, _struct: "{"a":["u8","u8","u8"]}"}
read = model.readBE(buffer);
console.log(read); // Object {a: Array(3) [2, 65, 66]}

model = struct(
    `{a[3/u8];}`
); // C_Struct {_offset: 0, _struct: "{"a":["u8","u8","u8"]}"}
read = model.readBE(buffer);
console.log(read); // Object {a: Array(3) [2, 65, 66]}

model = struct(
    `{a[u8/u8];}`
); // C_Struct {_offset: 3, _struct: "{"a.array":"u8","a":"u8"}"}
read = model.readBE(buffer);
console.log(read); //Object {a: Array(2) [65, 66]}

model = struct(
    `{u8 a[u8];}`
); // C_Struct {_offset: 3, _struct: "{"a.array":"u8","a":"u8"}"}
read = model.readBE(buffer);
console.log(read); //Object {a: Array(2) [65, 66]}

model = struct(
    `{string s[u8];}`
); // C_Struct {_offset: 3, _struct: "{"s.string":"u8","s":"string"}"}
read = model.readBE(buffer);
console.log(read); // Object {s: "AB"}

model = struct(
    `{s[u8/string];}`
); // C_Struct {_offset: 3, _struct: "{"s.string":"u8","s":"string"}"}
read = model.readBE(buffer);
console.log(read); // Object {s: "AB"}

buffer = Buffer.concat([Buffer.from([1,0]), Buffer.from([66]), Buffer.from([64,80,128,0,0,0,0,0]), Buffer.alloc(20, 0xcc)]);
console.log(buffer.toString('hex')); // String 0100424050800000000000cccccccccccccccccccccccccccccccccccccccc

model = struct(`{
    u16 a;
    u8 b;
    d c;
}`); // C_Struct {_offset: 0, _struct: "{"a":"u16","b":"u8","c":"d"}"}
read = model.readBE(buffer);
console.log(read); // Object {a: 577, b: 66, c: 4150517416584648700}
buffer = model.makeBE({a: 256, b: 66, c: 66});

model = struct(`{
    ABC a;
    u8 b;
}`,`{
    ABC { u8 a,b,c; };
}`); // C_Struct {_offset: 0, _struct: "{"a":{"a":"u8","b":"u8","c":"u8"},"b":"u8"}"}
read = model.readBE(buffer);
console.log(read); // Object {a: {a: 1, b: 0, c: 66}, b: 64}

buffer = Buffer.from(`
42f60000 43e40000
42f70000 43e50000
42f80000 43e60000
`.replace(/[ \n]/g, ''), 'hex');
console.log(buffer.toString('hex')); // 42f6000043e4000042f7000043e5000042f8000043e60000

model = struct(`{
    Pair first;
    Pair table[2];
}`,`{
    Pair { f X, Y; };
}`); // C_Struct {_offset: 24, _struct: "{"first":{"X":"f","Y":"f"},"table":[{"X":"f","Y":"f"},{"X":"f","Y":"f"}]}"}
read = model.readBE(buffer);
console.log(read); // Object {first: {X: 123, Y: 456}, table: [{X: 123.5, Y: 458}, {X: 124, Y: 460}]}
console.log(read.first); // Object {X: 123, Y: 456}
console.log(read.table); // Array(2) [{X: 123.5, Y: 458}, {X: 124, Y: 460}]

buffer = Buffer.from(`
01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e
`.replace(/[ \n]/g, ''), 'hex');
console.log(buffer.toString('hex')); // 0102030405060708090a0b0c0d0e

model = struct(`u8 [2];`);
for (let i = 0; i < 3; i++) {
    read = model.readBE(buffer);
    console.log(i, read);
    // 0, Array(2) [1, 2]
    // 1, Array(2) [3, 4]
    // 2, Array(2) [5, 6]
}

// model = struct(`
//     Xyz path[5];`,
//     `Xyz {
//         f x, y, z;
//     };`);
// model = struct(
//     { path : ['Xyz','Xyz','Xyz','Xyz','Xyz'] },
//     { Xyz: { x:'f', y:'f', z:'f' } });
// model = struct(`
//     Xyz[5];`,
//     `Xyz {
//         f x, y, z;
//     };`);
// model = struct(
//     ['Xyz','Xyz','Xyz','Xyz','Xyz'],
//     { Xyz: { x:'f', y:'f', z:'f' } });

// // let obj1 = model.readLE(buffer);
// let obj1 = model.readLE(buffer, offset);
// model.offset = 16;
// let offset = model.offset;



import {
    // CStructBE,
    CStructLE,
} from '../src/index';

let model, struct, structLE, buf, res;

model = {
    static: 's3',
    code: 'u8',
    num: 'u16',
    "dynamic.string": "u8",
    "dynamic": "string",
};
struct = {
    static: "abc",
    code: 0xAA,
    num: 0x1234,
    dynamic: "cba",
};
buf = Buffer.alloc(13);
structLE = new CStructLE(
    model,
);
res = structLE.write(buf, struct, 2,);
res;//?
res.buffer.toString('utf8');//?
res.buffer.toString('hex');//?
res = structLE.read(res.buffer, 2);
res;//?
res.struct;//?
res.size;//?
res.offset;//?


//
// let model, buffer, read, write;
//
// buffer = Buffer.from("abcABC");
// console.log(buffer.toString('hex'));
// // 616263414243
//
//
//
// model = struct(
//     `[u8,u16,u32]` //ok
// );
// model = struct(`
//     T4 ttt;
//     A4 aaa;
// `,`
//
//     //T1 {   u8 [3]; };//ok
//     //T2 {u8[3]; };//ok
//     //T3 u8[3];//ok
//     T4 [u8,u32];//ok
//     A3 [u8,u8,u8];//ok
//     A4 u8[3];//ok
// `);
//
// model = struct(`
//     s3 lower;
//     s3 upper;
// `,`
//     T1 { u8 [3]; };
//     A3 [u8,u8,u8];
// `);
// model = struct(`
//     s3 lower;
//     s3 upper;
// `,`
//     A3 [u8,u8,u8];
// `);
// model = struct(`
//     s3 lower;
//     s3 upper;
// `,`
//     Abc {
//         u8 a;
//         u16 b ;
//         u32 c,d  ;
//     }  ;
// `);
//
// model = struct(`
//     s3 lower;
//     s3 upper;
// `);
// read = model.readBE(buffer);
// console.log(read);
// // { lower: "abc", upper: "ABC" }
//
// model = struct(
//     `u8 a[u8];`
// );
// model = struct(`
//     A a
//     S s;
// `,`
//     A { u8 x[u8], y; };
//     S { string x[u8], y; };
// `);
//
//
// model = struct(`
//     s3 lower;
//     s3 upper;
// `,`
//     Pair { f X, Y; }; // comment 6
//     // comment 1
//     Error { // comment 5
//         s3 err1, err2; // comment 2
//     }; // comment 3
//     // comment 4
//     Abc {
//         u8 a;
//         u16 b ;
//         u32 c,d  ;
//     }  ;
// `); // C_Struct {_offset: 0, _struct: "{"lower":"s3","upper":"s3"}"}
// read = model.readBE(buffer);
// console.log(read);
// // { lower: "abc", upper: "ABC" }
//
//
//
// model = struct(`
//     string lower[3];
//     string upper[3];
// `);
// read = model.readBE(buffer);
// console.log(read);
// // { lower: [ '', '', '' ], upper: [ '', '', '' ] }
//
//
// // buffer = Buffer.concat([Buffer.from([12]), Buffer.from("Hello World!")]);
// // console.log(buffer.toString('hex')); // 0c48656c6c6f20576f726c6421
//
// // model = struct(`
// //     string msg[u8];
// // `); // C_Struct {_offset: 0, _struct: "{"msg.string":"u8","msg":"string"}"}
// // read = model.readBE(buffer);
// // console.log(read); // Object {msg: "Hello World!"}
//
//
// buffer = Buffer.concat([Buffer.from([0, 12]), Buffer.from("Hello World!")]);
// console.log(buffer.toString('hex'));
// // 000c48656c6c6f20576f726c6421
//
// model = struct(`
//     // comments will be removed
//     string msg[u16]; // [u16] means u16 just before string contains the string length
//     // another comment
// `); // C_Struct {_offset: 0, _struct: "{"msg.string":"u16","msg":"string"}"}
// read = model.readBE(buffer);
// console.log(read);
// // { msg: 'Hello World!' }