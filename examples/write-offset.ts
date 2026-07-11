import { CStructBE, hexToBuffer } from "../src";

{
    // make — allocates a new buffer
    const cStruct = CStructBE.fromModelTypes({ error: { code: 'u16', message: 's20' } });
    const { buffer } = cStruct.make({ error: { code: 10, message: 'xyz' } });
    console.log(buffer.toString('hex'));
    // 000a78797a0000000000000000000000000000000000
}

{
    // write — patch an existing buffer at a chosen offset
    const frame = hexToBuffer('111111 22222222222222222222222222222222222222222222 333333');
    const cStruct = CStructBE.fromModelTypes({ error: { code: 'u16', message: 's20' } });

    const { buffer, offset, size } = cStruct.write(
        frame,
        { error: { code: 0x44, message: 'xyz' } },
        3
    );

    console.log(buffer.toString('hex'));
    // 111111004478797a00000000000000000000000000000000333333
    console.log(offset); // 25
    console.log(size);   // 22
}
