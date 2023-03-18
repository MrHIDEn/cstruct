import { CStructBE } from "../src";

{
    // Buffer example
    const model = `{
        cnt: i16,
        buf: buf10,
    }`;

    const cStruct = CStructBE.fromModelTypes(model);

    console.log(cStruct.modelClone);
    // { cnt: 'i16', buf: 'buf10' }

    const data = {
        cnt: 15,
        buf: Buffer.from('ABCD')
    };
    const {buffer: makeBuffer} = cStruct.make(data);

    console.log(makeBuffer.toString('hex'));
    // 000f41424344000000000000
    // 000f_41424344000000000000

    const {struct: readStruct} = cStruct.read(makeBuffer);
    console.log(readStruct);
    // { cnt: 15, buf: <Buffer 41 42 43 44 00 00 00 00 00 00> }
    // { cnt: 15, buf: Bufer.from('ABCD') }
}