import { CStructBE } from "../src";

{
    // C struct types
    const model = {
        xyzs: "Xyz[2]",
    };
    const types = `{
        typedef struct {
            uint8_t x;
            uint8_t y;
            uint8_t z;
        } Xyz;
    }`;

    const cStruct = new CStructBE(model, types);

    console.log(cStruct.jsonModel);
    // {"xyzs":[{"x":"uint8_t","y":"uint8_t","z":"uint8_t"},{"x":"uint8_t","y":"uint8_t","z":"uint8_t"}]}

    console.log(cStruct.jsonTypes);
    // {"Xyz":{"x":"uint8_t","y":"uint8_t","z":"uint8_t"}}

    console.log(cStruct.modelClone);
    // { xyzs:
    //    [ { x: 'uint8_t', y: 'uint8_t', z: 'uint8_t' },
    //      { x: 'uint8_t', y: 'uint8_t', z: 'uint8_t' } ] }

    const data = {
        xyzs: [
            {x: 1, y: 2, z: 3},
            {x: 4, y: 5, z: 6},
        ]
    };
    const {buffer: makeBuffer} = cStruct.make(data);

    console.log(makeBuffer.toString('hex'));
    // 010203040506

    const {struct: readStruct} = cStruct.read(makeBuffer);
    console.log(readStruct);
    // { xyzs: [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ] }
}