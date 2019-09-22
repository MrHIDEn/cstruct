const { struct } = require('../index');

let model, buffer, read, write;

buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/[ \n]/g, ''), 'hex'); // buffer= 0000aabbcc0000

model = struct(
    `u8 a, b, c;`
); // C_Struct {_offset: 0, _struct: "{"a":"u8","b":"u8","c":"u8"}"}
read = model.readBE(buffer, 2); // offset= 2, read= {a: 170, b: 187, c: 204}= {a: 0xaa, b: 0xbb, c:0xcc}
console.log(read); // Object {a: 170, b: 187, c: 204}
console.log(model.offset); // 5

buffer = Buffer.alloc(7); // Buffer(7) 00000000000000
write = model.writeBE(buffer, { a: 170, b: 187, c: 204 }, 3);
console.log(write); // 6
console.log(buffer.toString('hex')); // String 000000aabbcc00

buffer = model.makeBE({ a: 170, b: 187, c: 204 });
console.log(buffer.toString('hex'), buffer.length); //Buffer(3) aabbcc, 3

model = struct(
    `u8 [3];`
); // C_Struct {_offset: 0, _struct: "["u8","u8","u8"]"}

buffer = Buffer.concat([Buffer.from([2,65,66,67]), Buffer.alloc(20, 0xcc)]);
console.log(buffer.toString('hex')); // String 02414243cccccccccccccccccccccccccccccccccccccccc

read = model.readBE(buffer);
console.log(read); // Array(3) [2, 65, 66]

model = struct(
    `u8 a[3];`
); // C_Struct {_offset: 0, _struct: "{"a":["u8","u8","u8"]}"}
read = model.readBE(buffer);
console.log(read); // Object {a: Array(3) [2, 65, 66]}

model = struct(
    `u8 a[u8];`
); // C_Struct {_offset: 3, _struct: "{"a.array":"u8","a":"u8"}"}
read = model.readBE(buffer);
console.log(read); //Object {a: Array(2) [65, 66]}

model = struct(
    `string s[u8];`
); // C_Struct {_offset: 3, _struct: "{"s.string":"u8","s":"string"}"}
read = model.readBE(buffer);
console.log(read); // Object {s: "AB"}

buffer = Buffer.concat([Buffer.from([1,0]), Buffer.from([66]), Buffer.from([64,80,128,0,0,0,0,0]), Buffer.alloc(20, 0xcc)]);
console.log(buffer.toString('hex')); // String 0100424050800000000000cccccccccccccccccccccccccccccccccccccccc

model = struct(`
    u16 a;
    u8 b;
    d c;`
); // C_Struct {_offset: 0, _struct: "{"a":"u16","b":"u8","c":"d"}"}
read = model.readBE(buffer);
console.log(read); // Object {a: 577, b: 66, c: 4150517416584648700}
buffer = model.makeBE({a: 256, b: 66, c: 66});

model = struct(`
    ABC a;
    u8 b;`,`
    ABC { u8 a,b,c; };`
); // C_Struct {_offset: 0, _struct: "{"a":{"a":"u8","b":"u8","c":"u8"},"b":"u8"}"}
read = model.readBE(buffer);
console.log(read); // Object {a: {a: 1, b: 0, c: 66}, b: 64}

buffer = Buffer.from(`
42f60000 43e40000
42f70000 43e50000
42f80000 43e60000
`.replace(/[ \n]/g, ''), 'hex');
console.log(buffer.toString('hex')); // 42f6000043e4000042f7000043e5000042f8000043e60000

model = struct(`
    Pair first;
    Pair table[2];
    `,`
    Pair { f X, Y; };
    `
); // C_Struct {_offset: 24, _struct: "{"first":{"X":"f","Y":"f"},"table":[{"X":"f","Y":"f"},{"X":"f","Y":"f"}]}"}
read = model.readBE(buffer);
console.log(read); // Object {first: {X: 123, Y: 456}, table: Array(2) [{X: 123.5, Y: 458}, {X: 124, Y: 460}]}
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