import { hexToBuffer, CStructBE, CStructLE } from "../src";

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003');
    console.log(buffer.toString('hex'));
    // 01000200000003

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = CStructBE.fromModelTypes(`{a:u8, b:u16, c:u32}`);

    const {struct} = cStruct.read(buffer);

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
    const cStruct = CStructLE.fromModelTypes(`{a: u8, b: u16, c: u32}`);
    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // { a: 1, b: 2, c: 3 }
}

{
    // Buffer to read from
    const buffer = hexToBuffer('00 0000 00000000 0000000000000000 01 0001 00000001 0000000000000001');
    console.log(buffer.toString('hex'));
    // 000000000000000000000000000000010001000000010000000000000001

    // Boolean data
    const cStruct = CStructBE.fromModelTypes(`[
        {a: b8, b: b16, c: b32, d: b64},
        {a: b8, b: b16, c: b32, d: b64}
    ]`);

    const {struct} = cStruct.read(buffer);

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

    const cStruct = CStructBE.fromModelTypes(`[u16, u16, u16]`);

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('0100 0200 0300');
    console.log(buffer.toString('hex'));
    // 010002000300

    const cStruct = CStructLE.fromModelTypes(`[u16, u16, u16]`);

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
    console.log(buffer.toString('hex'));
    // 000f616263000000000000000000000000

    const cStruct = CStructBE.fromModelTypes(`{ error: {code: u16, message: s20} }`);

    const {struct, offset, size} = cStruct.read(buffer);

    console.log(struct);
    // { error: { code: 15, message: 'abc' } }
    console.log(offset);
    // 17
    console.log(size);
    // 17
}

{
    // Buffer to read from
    const buffer = hexToBuffer('000000 0100 0200 0300');
    console.log(buffer.toString('hex'));
    // 010002000300

    const cStruct = CStructLE.fromModelTypes(`[u16, u16, u16]`);

    // Read with offset 3
    const {struct} = cStruct.read(buffer, 3);

    console.log(struct);
    // [ 1, 2, 3 ]
}

{
    // Make buffer from struct based on model
    const cStruct = CStructBE.fromModelTypes(`{ error: {code: u16, message: s20} }`);

    const {buffer, offset, size} = cStruct.make({error: {code: 10, message: 'xyz'}});

    console.log(buffer.toString('hex'));
    // 000a78797a0000000000000000000000000000000000
    console.log(offset);
    // 22
    console.log(size);
    // 22
}

{
    // Write to buffer from struct based on model with offset
    const buffer = hexToBuffer('111111 22222222222222222222222222222222222222222222 333333');
    console.log(buffer.toString('hex'));

    const cStruct = CStructBE.fromModelTypes(`{ error: {code: u16, message: s20} }`);

    const {buffer: b, offset, size} = cStruct.write(
        buffer,
        {error: {code: 0x44, message: 'xyz'}},
        3
    );

    console.log(b.toString('hex'));
    // 111111004478797a0000000000000000000000000000000000333333
    // 111111 0044_78797a0000000000000000000000000000000000 333333
    console.log(offset);
    // 25
    console.log(size);
    // 22
}

{
    // C-kind fields {u8 a,b;} into {a:u8,b:u8}
    const model = `{u8 a,b;}`;
    const cStruct = CStructBE.fromModelTypes(model);

    const makeStruct = {a: 1, b: 2};
    const {buffer: structBuffer} = cStruct.make(
        makeStruct
    );
    console.log(structBuffer.toString('hex'));
    // 0102

    const {struct: readStruct} = cStruct.read(structBuffer);
    console.log(readStruct);
    // { a: 1, b: 2 }
}