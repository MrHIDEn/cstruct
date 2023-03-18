import { CStructBE } from "../src";

{
    // Value, static array, dynamic array
    const model = `[
        i8,         // 1 byte
        i8[2],      // 2 bytes static array
        i8[i16]     // i16 bytes dynamic array
    ]`;

    const cStruct = CStructBE.fromModelTypes(model);

    console.log(cStruct.jsonModel);
    // ["i8","i8.2","i8.i16"]
    console.log(cStruct.modelClone);
    // [ 'i8', 'i8.2', 'i8.i16' ]

    const data = [
        0x01,
        [0x02, 0x03],
        [0x04, 0x05, 0x06, 0x07],
    ];
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 010203000404050607
    // 01 02_03 0004_04_05_06_07

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // [ 1, [ 2, 3 ], [ 4, 5, 6, 7 ] ]
}

{
    // Dynamic (length) array
    const model = {
        abc: "i8[i16]",
        xyz: "i8[i8]",
    };

    const cStruct = CStructBE.fromModelTypes(model);

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

    const cStruct = CStructBE.fromModelTypes(model, types);

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

{
    // Dynamic (length) string
    const model = {
        txt1: "s[i16]",
        txt2: "string[i16]",
    };

    const cStruct = CStructBE.fromModelTypes(model);

    console.log(cStruct.modelClone);
    // { 'txt1.i16': 's', 'txt2.i16': 's' }

    const data = {
        txt1: "ABCDE",
        txt2: "AB"
    };
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 0005414243444500024142
    // 0005_4142434445 0002_4142

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { txt1: 'ABCDE', txt2: 'AB' }
}

{
    // Dynamic (length) array with dynamic strings
    const model = {
        txt: "S[i8]",
    };

    const types = {
        S: {t: 's[i8]'}
    };

    const cStruct = CStructBE.fromModelTypes(model, types);

    console.log(cStruct.jsonModel);
    // {"txt.i8":{"t.i8":"s"}}
    console.log(cStruct.jsonTypes);
    // {"S":{"t.i8":"s"}}

    console.log(cStruct.modelClone);
    // {"txt.i8":{"t.i8":"s"}}

    const data = {
        txt: [
            {t: "ABCDE"},
            {t: "AB"},
            {t: "A"},
        ]
    };
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 030541424344450241420141
    // 03 05_4142434445 02_4142 01_41
    // 3
    //       ABCDE
    //                     AB
    //                             A

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { txt: [ { t: 'ABCDE' }, { t: 'AB' }, { t: 'A' } ] }
}

{
    // Dynamic and static (length) buffer
    const model = `{
        dynBuffer:    buf[i8],
        staticBuffer: buf[2]
    }`;

    const cStruct = CStructBE.fromModelTypes(model);

    console.log(cStruct.modelClone);
    // { 'dynBuffer.i8': 'buf', staticBuffer: 'buf2' }

    const data = {
        dynBuffer: Buffer.from("ABCDEF"),
        staticBuffer: Buffer.from("abcdef"),
        // Because 'staticBuffer' is only 2 bytes long,
        // the buffer will be truncated to 'ab'
    };
    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 064142434445466162
    // 06_414243444546_6162
    // ^  ^            ^ab
    // ^  ^ABCDEF
    // ^dynamic buffer size, ABCDEF.length = 6

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { staticBuffer: <Buffer 61 62>,
    //   dynBuffer: <Buffer 41 42 43 44 45 46> }
    // { staticBuffer: <Buffer "ab">,
    //   dynBuffer: <Buffer "ABCDEF"> }
}