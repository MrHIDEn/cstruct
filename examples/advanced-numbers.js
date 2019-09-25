const { struct } = require('../index');

let model, buffer, read, write;

buffer = Buffer.from("abcABC");
console.log(buffer.toString('hex')); // 616263414243
console.log(buffer.toString('hex')); // abcABC

model = struct(
    `[u8,u16,u32]` //ok
);