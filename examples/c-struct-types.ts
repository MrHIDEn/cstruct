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

{
    // C struct types
    const model = `{
        typedef struct {
            uint8_t x;
            uint8_t y;
            uint8_t z;
        } xyzs;
    }`;

    const cStruct = new CStructBE(model);

    console.log(cStruct.jsonModel);
    // {"xyzs":{"x":"uint8_t","y":"uint8_t","z":"uint8_t"}}

    console.log(cStruct.modelClone);
    // { xyzs: { x: 'uint8_t', y: 'uint8_t', z: 'uint8_t' } }

    const data = {
        xyzs: {x: 1, y: 2, z: 3}
    };
    const {buffer: makeBuffer} = cStruct.make(data);

    console.log(makeBuffer.toString('hex'));
    // 010203

    const {struct: readStruct} = cStruct.read(makeBuffer);
    console.log(readStruct);
    // { xyzs: { x: 1, y: 2, z: 3 } }
}

{
    // C struct types
    const types = `{
        // 1st approach
        typedef struct {
            u8 x,y,z;
        } Xyz;
        
        // 2nd approach
        struct Ab {
            i8 x,y;
        };
        
        // As you noticed, comments are allowed
    }`;
    const model = `{
        ab: Ab,
        xyz: Xyz,
        
        // As you noticed, comments are allowed
    }`;

    const cStruct = new CStructBE(model, types);

    console.log(cStruct.jsonTypes);
    // {"Ab":{"x":"i8","y":"i8"},"Xyz":{"x":"u8","y":"u8","z":"u8"}}

    console.log(cStruct.jsonModel);
    // {"ab":{"x":"i8","y":"i8"},"xyz":{"x":"u8","y":"u8","z":"u8"}}

    console.log(cStruct.modelClone);
    // { ab: { x: 'i8', y: 'i8' }, xyz: { x: 'u8', y: 'u8', z: 'u8' } }

    const data = {
        ab: { x: -2, y: -1 },
        xyz: { x: 0, y: 1, z: 2 }
    };
    const {buffer: makeBuffer} = cStruct.make(data);

    console.log(makeBuffer.toString('hex'));
    // feff000102

    const {struct: readStruct} = cStruct.read(makeBuffer);
    console.log(readStruct);
    // { ab: { x: -2, y: -1 }, xyz: { x: 0, y: 1, z: 2 } }
}