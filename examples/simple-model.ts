import { hexToBuffer, CStructBE, CStructLE } from "../src";

{
    // Make BE buffer from struct based on model
    const model = {a: 'u16', b: 'i16'};
    const cStruct = new CStructBE(model);

    const data = {a: 10, b: -10};
    const buffer = cStruct.make(data).buffer;

    console.log(buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003');
    console.log(buffer.toString('hex'));
    // 01000200000003

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = new CStructBE({a: 'u8', b: 'u16', c: 'u32'});

    const { struct } = cStruct.read(buffer);

    console.log(struct);
    // { a: 1, b: 2, c: 3 }
}

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0200 03000000');
    console.log(buffer.toString('hex'));
    // 01020003000000

    // LE - Little endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = new CStructLE({a: 'u8', b: 'u16', c: 'u32'});
    const { struct } = cStruct.read(buffer);

    console.log(struct);
    // { a: 1, b: 2, c: 3 }
}

{
    // Buffer to read from
    const buffer = hexToBuffer('00 0000 00000000 0000000000000000 01 0001 00000001 0000000000000001');
    console.log(buffer.toString('hex'));
    // 000000000000000000000000000000010001000000010000000000000001

    // Boolean data
    const cStruct = new CStructBE([
        {a: 'b8', b: 'b16', c: 'b32', d: 'b64'},
        {a: 'b8', b: 'b16', c: 'b32', d: 'b64'}
    ]);

    const { struct } = cStruct.read(buffer);

    console.log(struct);
    // [
    //     { a: false, b: false, c: false, d: false },
    //     { a: true, b: true, c: true, d: true }
    // ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('0001 0002 0003');
    console.log(buffer.toString('hex'));
    // 000100020003

    const cStruct = new CStructBE(['u16', 'u16', 'u16']);

    const { struct } = cStruct.read(buffer);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('0100 0200 0300');
    console.log(buffer.toString('hex'));
    // 010002000300

    const cStruct = new CStructLE(['u16', 'u16', 'u16']);

    const { struct } = cStruct.read(buffer);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
    console.log(buffer.toString('hex'));
    // 000f616263000000000000000000000000

    const cStruct = new CStructBE({ error: {code: 'u16', message: 's20'} });

    const { struct, offset, size, toAtoms } = cStruct.read(buffer);

    console.log(struct);
    // { error: { code: 15, message: 'abc' } }
    console.log(offset);
    // 17
    console.log(size);
    // 17
    console.log(toAtoms());
    // ["u16:000f", "s20:616263000000000000000000000000"]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('000000 0100 0200 0300');
    console.log(buffer.toString('hex'));
    // 010002000300

    const cStruct = new CStructLE(['u16', 'u16', 'u16']);

    // Read with offset 3
    const { struct } = cStruct.read(buffer, 3);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Make buffer from struct based on model
    const cStruct = new CStructBE({ error: {code: 'u16', message: 's20'} });

    const { buffer, offset, size, toAtoms } = cStruct.make({ error: { code: 10, message: 'xyz' } });

    console.log(buffer.toString('hex'));
    // 000a78797a0000000000000000000000000000000000
    console.log(offset);
    // 22
    console.log(size);
    // 22
    console.log(toAtoms());
    // [ 'u16:000a', 's20:78797a0000000000000000000000000000000000' ]
}

{
    // Write to buffer from struct based on model with offset
    const buffer = hexToBuffer('111111 22222222222222222222222222222222222222222222 333333');
    console.log(buffer.toString('hex'));

    const cStruct = new CStructBE({ error: {code: 'u16', message: 's20'} });

    const { buffer: b, offset, size, toAtoms } = cStruct.write(
        buffer,
        { error: { code: 0x44, message: 'xyz' } },
        3
    );

    console.log(b.toString('hex'));
    // 1111110044_78797a0000000000000000000000000000000000333333
    console.log(offset);
    // 25
    console.log(size);
    // 22
    console.log(toAtoms());
    // [ 'u16:0044', 's20:78797a0000000000000000000000000000000000' ]
}