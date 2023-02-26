import { hexToBuffer, CStructBE, CStructLE } from "../src/index";

{
    // Dynamic (length) array
    const model = {
        "abc.array": "i16", abc: "i8",
        "xyz.array": "i8", xyz: "i8",
    };
    const cStruct = new CStructBE(model);
    console.log(cStruct.modelClone);
    // { 'abc.array': 'i16', abc: 'i8', 'xyz.array': 'i8', xyz: 'i8' }
    const data = {
        abc: [-1, 0, +1],
        xyz: [-1, 0, +1],
    };
    const { buffer, offset, size, toAtoms } = cStruct.make(data);
    console.log(buffer.toString('hex'));


    // const buffer = hexToBuffer('01 0002 00000003');
    // console.log(buffer.toString('hex'));
    // // 01000200000003
    //
    // // BE - Big endian
    // // Read a struct from a buffer
    // // where the struct and data types are defined in a model
    // const cStruct = new CStructBE({abc: 'Abc'}, {Abc: {a: 'u8', b: 'u16', c: 'u32'}});
    //
    // const {struct} = cStruct.read(buffer);
    //
    // console.log(struct);
    // // { abc: { a: 1, b: 2, c: 3 } }
}