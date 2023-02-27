import { hexToBuffer, CStructBE, CStructLE } from "../src/index";

{
    // Dynamic (length) array
    const model = {
        abc: "i8[i16]",
        xyz: "i8[i8]",
    };

    const cStruct = new CStructBE(model);

    console.log(cStruct.jsonModel);
    // {"abc.i16":"i8","xyz.i8":"i8"}
    console.log(cStruct.modelClone);
    // { 'abc.i16': 'i8', 'xyz.i8': 'i8' }

    const data = {
        abc: [-1, 0, +1],
        xyz: [-1, 0, +1],
    };
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 0003ff000103ff0001

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { abc: [ -1, 0, 1 ], xyz: [ -1, 0, 1 ] }
}

{
    // Dynamic (length) array with types
    const model = {
        ab: "Ab[i16]",
    };

    const types = {
        Ab: {a: 'i8', b: 'i8'}
    };

    const cStruct = new CStructBE(model, types);

    console.log(cStruct.modelClone);
    // { 'ab.i16': { a: 'i8', b: 'i8' } }

    const data = {
        ab: [
            {a: '-1', b: '+1'},
            {a: '-2', b: '+2'},
        ]
    };
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 0002ff01fe02

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { ab: [ { a: -1, b: 1 }, { a: -2, b: 2 } ] }
}