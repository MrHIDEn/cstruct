const { struct } = require('../index');
let model, buffer, readBE, readLE, writeBE, writeLE, offset;

/**
 * Read/try `examples\simple-numbers.js` first to get general idea of using this library
 * This section is based on `string` or `JSON` models for BASE and TYPES
 * You can mix Object/String models for BASE=Object/String and TYPES=Object/String
 */

 /**
  * Read
  */

/**
 * Write
 */

 /**
  * Make
  */
buffer = Buffer.from("abcABC");
console.log(buffer.toString('hex')); // 616263414243
console.log(buffer.toString('hex')); // abcABC


console.clear();
model = struct(
    `[u8,u16,u32]` //ok
);