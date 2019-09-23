const { struct } = require('../index');

let model, buffer, read, write;

buffer = Buffer.from("abcABC");
console.log(buffer.toString('hex')); // 616263414243
console.log(buffer.toString('hex')); // abcABC


model = struct(`
    s3 lower;
    s3 upper;
`,`

    //T1 {   u8 [3]; };//ok
    //T2 {u8[3]; };//ok
    //T3 u8[3];//ok
    T4 [u8,u16];
`);

model = struct(`
    s3 lower;
    s3 upper;
`,`
    T1 { u8 [3]; };
    A3 [u8,u8,u8];
`);
model = struct(`
    s3 lower;
    s3 upper;
`,`
    A3 [u8,u8,u8];
`);
model = struct(`
    s3 lower;
    s3 upper;
`,`
    Abc {
        u8 a;
        u16 b ;
        u32 c,d  ;
    }  ;
`);

model = struct(`
    s3 lower;
    s3 upper;
`); // C_Struct {_offset: 0, _struct: "{"lower":"s3","upper":"s3"}"}
read = model.readBE(buffer);
console.log(read); // Object {lower: "abc", upper: "ABC"}

model = struct(
    `u8 a[u8];`
);
model = struct(`
    A a
    S s;
`,`
    A { u8 x[u8], y; };
    S { string x[u8], y; };
`);


model = struct(`
    s3 lower;
    s3 upper;
`,`
    Pair { f X, Y; }; // comment 6
    // comment 1
    Error { // comment 5
        s3 err1, err2; // comment 2
    }; // comment 3
    // comment 4
    Abc {
        u8 a;
        u16 b ;
        u32 c,d  ;
    }  ;
`); // C_Struct {_offset: 0, _struct: "{"lower":"s3","upper":"s3"}"}
read = model.readBE(buffer);
console.log(read); // Object {lower: "abc", upper: "ABC"}



model = struct(`
    string lower[3];
    string upper[3];
`); // C_Struct {_offset: 0, _struct: "{"lower":["string","string","string"],"upper":["string","string","string"]}"}
read = model.readBE(buffer);
console.log(read); // Object {msg: "Hello World!"}


// buffer = Buffer.concat([Buffer.from([12]), Buffer.from("Hello World!")]);
// console.log(buffer.toString('hex')); // 0c48656c6c6f20576f726c6421

// model = struct(`
//     string msg[u8];
// `); // C_Struct {_offset: 0, _struct: "{"msg.string":"u8","msg":"string"}"}
// read = model.readBE(buffer);
// console.log(read); // Object {msg: "Hello World!"}


buffer = Buffer.concat([Buffer.from([0, 12]), Buffer.from("Hello World!")]);
console.log(buffer.toString('hex')); // 000c48656c6c6f20576f726c6421

model = struct(`
    // comments will be removed
    string msg[u16]; // [u16] means u16 just before string contains the string length
    // another comment
`); // C_Struct {_offset: 0, _struct: "{"msg.string":"u16","msg":"string"}"}
read = model.readBE(buffer);
console.log(read); // Object {msg: "Hello World!"}
console.log(read); // 