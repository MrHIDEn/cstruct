import { CStructBE, hexToBuffer } from "../src";

{
    const model = {any1: 'j[0]'};
    const cStruct = CStructBE.fromModelTypes(model);
    const buffer = hexToBuffer(  '1111 7b2261223a312c2262223a5b322c335d7d 00');
    const expected = {any1: {a: 1, b: [2, 3]}};

    const result = cStruct.read(buffer, 2);
}

{
    const model =
        // {abc: 'j[i8]'};
        // {abc: 'j[9]'};
        // {abc: 'j[0]'};
        // ['j[i8]'];
        // ['j[15]'];
        // ['j[0]'];
        {bf: 'buf[5]'};
        // {bf: 'buf[i8]'};
        // {bf: 'buf[0]'};
    const data =
        // {abc: [1, 2, 3]};
        // [{a:1,b:2}];
        // [[1, 2, 3]];
        {bf: Buffer.from("01234")};

    const cStruct = CStructBE.fromModelTypes(model);
    const buffer = cStruct.make(data).buffer;

    console.log(buffer.toString('hex'));
    // 12345601
    // 12 3456 01

    const extractedData = cStruct.read(buffer).struct;
    console.log(extractedData);
    // { b: 18, w: 13398, f: true }
    // { b: 0x12, w: 0x3456, f: true }
    console.log(JSON.stringify(data) === JSON.stringify(extractedData));
}

{
    const model = {
        any1: 'j[0]',
        any2: 's[0]'
    };

    const cStruct = CStructBE.fromModelTypes(model);

    const data = {
        any1: [1, 2, 3],
        any2: 'abc'
    };

    const buffer = cStruct.make(data).buffer;
    console.log(buffer.toString('hex'));
    // 5b312c322c335d0061626300
    // 5b_31_2c_32_2c_33_5d_00 616263_00
    // [  1  ,  2  ,  3  ]  \0 a b c  \0

    const extractedData = cStruct.read(buffer).struct;
    console.log(extractedData);
    // { any1: [ 1, 2, 3 ], any2: 'abc' }

    console.log(JSON.stringify(data) === JSON.stringify(extractedData));
    // true
}