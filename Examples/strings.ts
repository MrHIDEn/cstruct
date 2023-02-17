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