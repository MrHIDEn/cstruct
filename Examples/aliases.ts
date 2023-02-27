import { CStructBE } from "../src";

{
    const model = {uu: 'UU', b2: '2B', ii: 'II'};

    const aliases = [
        ['u16', 'UU', '2B'],
        ['i16', 'II'],
    ];

    const cStruct = new CStructBE(model, null, aliases);

    console.log(cStruct.modelClone);
    // { uu: 'UU', b2: '2B', ii: 'II' }

    const struct = {uu: 0x1234, b2: 0x5678, ii: -6};
    const {buffer} = cStruct.make(struct);

    console.log(buffer.toString('hex'));
    // 12345678FFFA
    // 1234 5678 FFFA

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { uu: 4660, b2: 22136, ii: -6 }
    // { uu: 0x1234, b2: 0x5678, ii: -6 }
}