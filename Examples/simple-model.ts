import { hexToBuffer, CStructBE, CStructLE } from "../src/index";

let cstruct;
let buffer;

{
    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    cstruct = new CStructBE({a: 'u8', b: 'u16', c: 'u32'});

    // Buffer to read from
    buffer = hexToBuffer('01 0002 00000003');
    console.log(buffer.toString('hex'));
    // 01000200000003

    const { struct } = cstruct.read(buffer);

    console.log(struct);
    // { a: 1, b: 2, c: 3 }
}

{
    // LE - Little endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    cstruct = new CStructLE({a: 'u8', b: 'u16', c: 'u32'});

    // Buffer to read from
    buffer = hexToBuffer('01 0200 03000000');
    console.log(buffer.toString('hex'));
    // 01020003000000

    const { struct } = cstruct.read(buffer);

    console.log(struct);
    // { a: 1, b: 2, c: 3 }
}