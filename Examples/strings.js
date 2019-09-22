const { struct } = require('../index');

let model, buffer, read, write;


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