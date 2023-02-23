import { CStructBE, hexToBuffer } from "../src";

const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
console.log(buffer.toString('hex'));
const cstruct = new CStructBE({ error: {code: 'u16', message: 's20'} });

const { struct, offset, size, toAtoms } = cstruct.read(buffer);

console.log(struct);
// { error: { code: 15, message: 'abc' } }
console.log(offset);
// 17
console.log(size);
// 17
console.log(toAtoms());
// ["u16:000f", "s20:616263000000000000000000000000"]