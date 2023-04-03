import { CStructBE } from "../src";

{
    const model = {abc: 'j[0]'};

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = {abc: [1, 2, 3]};
    const buffer = cStruct.make(struct).buffer;

    console.log(buffer.toString('hex'));
    // 5b312c322c335d00
    // 5b312c322c335d 00

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { abc: [ 1, 2, 3 ] }
}

{
    const model = ['j[0]'];

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = [{a:1,b:2}];
    const buffer = cStruct.make(struct).buffer;

    console.log(buffer.toString('hex'));
    // 7b2261223a312c2262223a327d00
    // 7b2261223a312c2262223a327d 00

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // [ { a: 1, b: 2 } ]
}

{
    const model = {abc: 's[0]'};

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = {abc: 'abcde'};
    const buffer = cStruct.make(struct).buffer;

    console.log(buffer.toString('hex'));
    // 616263646500
    // 6162636465 00

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // { abc: 'abcde' }
}

{
    const model = ['s[0]'];

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = ['abcde'];
    const buffer = cStruct.make(struct).buffer;

    console.log(buffer.toString('hex'));
    // 616263646500
    // 6162636465 00

    const {struct: extractedData} = cStruct.read(buffer);
    console.log(extractedData);
    // [ 'abcde' ]
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

{
    const model = {abc: 'buf[0]'};

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = {abc: Buffer.from("01234")};
    const buffer = cStruct.make(struct).buffer;
    // Error: Buffer size can not be 0.
}

{
    const model = ['buf[0]'];

    const cStruct = CStructBE.fromModelTypes(model);

    const struct = [Buffer.from("01234")];
    const buffer = cStruct.make(struct).buffer;
    // Error: Buffer size can not be 0.
}