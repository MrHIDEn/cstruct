import { CStructBE, CStructLE } from "../src";

{
    // Fixed-size wstring (UTF-16LE), 5 code units = 10 bytes
    const model = { label: 'ws5' };
    const cStruct = CStructLE.fromModelTypes(model);

    const { buffer } = cStruct.make({ label: 'abc' });
    console.log(buffer.toString('hex'));
    // 61006200630000000000

    const { struct } = cStruct.read(buffer);
    console.log(struct);
    // { label: 'abc' }
}

{
    // Trailing zero wstring — read without knowing length up front
    const model = { label: 'ws[0]' }; // or 'wstring[0]'
    const cStruct = CStructBE.fromModelTypes(model);

    const { buffer } = cStruct.make({ label: 'hi' });
    console.log(buffer.toString('hex'));
    // 680069000000

    const { struct } = cStruct.read(buffer);
    console.log(struct);
    // { label: 'hi' }
}
