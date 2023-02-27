import { hexToBuffer, CStructBE } from "../src/index";

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003');
    console.log(buffer.toString('hex'));
    // 01000200000003

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = new CStructBE({abc: 'Abc'}, {Abc: {a: 'u8', b: 'u16', c: 'u32'}});

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
    const cStruct = new CStructBE(['Abc', 'Abc'], {Abc: {a: 'u8', b: 'u16', c: 'u32'}});

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ { a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 } ]
}

{
    // Make buffer from struct based on model and types
    const cStruct = new CStructBE({errors: ['Error', 'Error']}, {Error: {code: 'u16', message: 's10'}});

    const {buffer, offset, size, toAtoms} = cStruct.make({
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
    console.log(toAtoms());
    // [
    //   'u16:0012',
    //   's10:6d657373616765310000',
    //   'u16:0034',
    //   's10:6d657373616765320000'
    // ]
}

{
    const writeBuffer = hexToBuffer('111111 000000000000000000000000000000000000000000000000 3333');
    // Write struct to buffer from struct based on model and types
    const cStruct = new CStructBE({errors: ['Error', 'Error']}, {Error: {code: 'u16', message: 's10'}});

    const {buffer, offset, size, toAtoms} = cStruct.write(
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
    console.log(toAtoms());
    // [
    //   'u16:0012',
    //   's10:6d657373616765310000',
    //   'u16:0034',
    //   's10:6d657373616765320000'
    // ]
}

{
    // Buffer to read from
    const buffer = hexToBuffer('01 0002 00000003 04 0005 00000006');
    console.log(buffer.toString('hex'));
    // 0100020000000304000500000006

    // BE - Big endian
    // Read a struct from a buffer
    // where the struct and data types are defined in a model
    const cStruct = new CStructBE({order: 'Cnc'}, {Cnc: {speed: 'f', goTo: 'Xyz'}, Xyz: {x: 'u8', y: 'u8', z: 'u8'}});

    const {struct} = cStruct.read(buffer);

    console.log(struct);
    // [ { a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 } ]
}

{
    // Model and Types for Sender & Receiver
    const types = {
        Sensor: {
            id: 'u32',
            type: 'u8',
            value: 'd',
            timestamp: 'u64',
        }
    };
    const iotModel = {
        iotName: 's20',
        sensor: 'Sensor',
    };

    // IOT Sender
    const sender = new CStructBE(iotModel, types);
    const senderData = {
        iotName: 'IOT-1',
        sensor: {
            id: 123456789,
            type: 0x01,
            value: 123.456,
            timestamp: 1677277903685n,
        }
    };
    const { buffer: senderFrame } = sender.make(senderData);

    // Transmitting frame
    console.log(senderFrame.toString('hex'));

    // IOT Receiver
    const receiver = new CStructBE(iotModel, types);
    const { struct: receiverData } = receiver.read(senderFrame);
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
    const types = {
        U8a: {
            a: 'u8',
        }
    }
    const cStruct = new CStructBE('U8a', types);
    const data = { a: 0x67 };

    const {buffer} = cStruct.make(data);

    console.log(buffer.toString('hex'));
    // 67
}

{
    // Nested types
    const types = {
        A: {
            b: 'B',
        },
        B: {
            c: 'C',
        },
        C: ['u8', 'u8', 'u8'],
    };
    const model = {
        table: [
            'A',
            'A',
        ]
    };
    const cStruct = new CStructBE(model, types);
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