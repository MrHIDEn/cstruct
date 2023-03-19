import { hexToBuffer, CStructBE } from "../src";

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003');
    console.log(buffer.toString('hex'));
    // 01000200000003

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = CStructBE.fromModelTypes(`{abc: Abc}`, `{Abc: {a: u8, b: u16, c: u32}}`);

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // { abc: { a: 1, b: 2, c: 3 } }
}

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003 04 0005 00000006');
    console.log(buffer.toString('hex'));
    // 0100020000000304000500000006

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = CStructBE.fromModelTypes(`[Abc, Abc]`, `{Abc: {a: u8, b: u16, c: u32}}`);

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ { a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 } ]
}

{
    // Make buffer from struct based on model and types
    const cStruct = CStructBE.fromModelTypes(`{errors: [Error, Error]}`, `{Error: {code: u16, message: s10}}`);

    const {buffer, offset, size} = cStruct.make({
        errors: [
            {code: 0x12, message: 'message1'},
            {code: 0x34, message: 'message2'},
        ]
    });

    console.log(buffer.toString('hex'));
    // 00126d65737361676531000000346d657373616765320000
    console.log(offset);
    // 24
    console.log(size);
    // 24
}

{
    const writeBuffer = hexToBuffer('111111 000000000000000000000000000000000000000000000000 3333');
    // Write struct to buffer from struct based on model and types
    const cStruct = CStructBE.fromModelTypes(`{errors: [Error, Error]}`, `{Error: {code: u16, message: s10}}`);

    const {buffer, offset, size} = cStruct.write(
        writeBuffer,
        {
            errors: [
                {code: 0x12, message: 'message1'},
                {code: 0x34, message: 'message2'},
            ]
        },
        3
    );

    console.log(buffer.toString('hex'));
    // 11111100126d65737361676531000000346d6573736167653200003333
    console.log(offset);
    // 27
    console.log(size);
    // 24
}

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003 04 0005 00000006');
    console.log(buffer.toString('hex'));
    // 0100020000000304000500000006

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = CStructBE.fromModelTypes(`{order: Cnc}`, `{Cnc: {speed: f, goTo: Xyz}, Xyz: {x: u8, y: u8, z: u8}}`);

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ { a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 } ]
}

{
    // Model and Types for Sender & Receiver
    const types = `{
        Sensor: {
            id: u32,
            type: u8,
            value: d,
            timestamp: u64,
        }
    }`;
    const iotModel = `{
        iotName: s20,
        sensor: Sensor,
    }`;

    // IOT Sender
    const sender = CStructBE.fromModelTypes(iotModel, types);
    const senderData = {
        iotName: 'IOT-1',
        sensor: {
            id: 123456789,
            type: 0x01,
            value: 123.456,
            timestamp: 1677277903685n,
        }
    };
    const {buffer: senderFrame} = sender.make(senderData);

    // Transmitting frame
    console.log(senderFrame.toString('hex'));

    // IOT Receiver
    const receiver = CStructBE.fromModelTypes(iotModel, types);
    const {struct: receiverData} = receiver.read(senderFrame);
    console.log(receiverData);
    // {
    //   iotName: 'IOT-1',
    //   sensor: {
    //      id: 123456789,
    //      type: 1,
    //      value: 123.456,
    //      timestamp: 1677277903685
    //    }
    //  }
}

{
    // Model and Types for Sender & Receiver
    const types = `{
        Sensor: {
            id: u32,
            type: u8,
            value: d,
            timestamp: u64,
        }
    }`;
    const iotModel = `{
        iotName: s20,
        sensor: Sensor,
    }`;

    // IOT Sender
    const sender = CStructBE.fromModelTypes(iotModel, types);
    const senderData = {
        iotName: 'IOT-1',
        sensor: {
            id: 123456789,
            type: 0x01,
            value: 123.456,
            timestamp: 1677277903685n,
        }
    };
    const {buffer: senderFrame} = sender.make(senderData);

    // Transmitting frame
    console.log(senderFrame.toString('hex'));

    // IOT Receiver
    const receiver = CStructBE.fromModelTypes(iotModel, types);
    const {struct: receiverData} = receiver.read(senderFrame);
    console.log(receiverData);
    // {
    //   iotName: 'IOT-1',
    //   sensor: {
    //      id: 123456789,
    //      type: 1,
    //      value: 123.456,
    //      timestamp: 1677277903685
    //    }
    //  }
}

{
    const types = `{
        U8a: {
            a: u8,
        }
    }`;
    const cStruct = CStructBE.fromModelTypes('U8a', types);
    const data = {a: 0x67};

    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 67
}

{
    // Nested types
    const types = `{
        A: {
            b: B,
        },
        B: {
            c: C,
        },
        C: [u8, u8, u8],
    }`;
    const model = `{
        table: [
            A,
            A,
        ]
    }`;
    const cStruct = CStructBE.fromModelTypes(model, types);
    console.log(cStruct.modelClone);
    // { table:
    //    [ { b: { c: [ 'u8', 'u8', 'u8' ] } },
    //      { b: { c: [ 'u8', 'u8', 'u8' ] } } ] }
    const data = {
        table: [
            {b: {c: [0x01, 0x02, 0x03]}},
            {b: {c: [0xF1, 0xF2, 0xF3]}},
        ]
    };

    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 010203f1f2f3
}

{
    // C-kind fields {Xyz x,y,z;} into JSON
    const model = `{Xyz m,n;}`;
    const types = `{Xyz: i16}`; // This helps to change the type of the fields called Xyz at once
    const cStruct = CStructBE.fromModelTypes(model, types);

    const makeStruct = {m: 0x0102, n: 0x0103};
    // { m: 258, n: 259 }
    const {buffer: structBuffer} = cStruct.make(
        makeStruct
    );
    console.log(structBuffer.toString('hex'));
    // 01020103

    const {struct: readStruct} = cStruct.read(structBuffer);
    console.log(readStruct);
    // { m: 258, n: 259 }
}

{
    // Mixed model and types
    // Make buffer from struct based on model and types
    const cStruct = CStructBE.fromModelTypes({errors: `[Error, Error]`}, {Error: `{code: u16, message: s10}`});

    const {buffer, offset, size} = cStruct.make({
        errors: [
            {code: 0x12, message: 'message1'},
            {code: 0x34, message: 'message2'},
        ]
    });

    console.log(buffer.toString('hex'));
    // 00126d65737361676531000000346d657373616765320000
    console.log(offset);
    // 24
    console.log(size);
    // 24
}

{
    // Mixed model and types
    // Make buffer from struct based on model and types
    const cStruct = CStructBE.fromModelTypes(
        {e: 'Error'},
        {Error: '{msg: s30, code: i16}'}
    );

    const {buffer: structBuffer} = cStruct.make({
        e: {msg: 'Temperature is to high', code: 12}
    });

    console.log(structBuffer.toString('hex'));
    // 54656d706572617475726520697320746f20686967680000000000000000000c

    const {struct: readStruct} = cStruct.read(structBuffer);
    console.log(readStruct);
    // { e: { msg: 'Temperature is to high', code: 12 } }
}