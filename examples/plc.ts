import { CStructBE } from "../src";

{
    const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};

    const cStruct = new CStructBE(model);

    console.log(cStruct.modelClone);
    // { b: 'BYTE', w: 'WORD', f: 'BOOL' }

    const struct = {b: 0x12, w: 0x3456, f: true};
    const {buffer} = cStruct.make(struct);

    console.log(buffer.toString('hex'));
    // 12345601
    // 12 3456 01

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { b: 18, w: 13398, f: true }
    // { b: 0x12, w: 0x3456, f: true }
}