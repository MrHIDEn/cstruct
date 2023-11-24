// const {CStructBE,CStructLE, hexToBuffer, AtomTypes} = require('@mrhiden/cstruct');
const {CStructBE, CStructLE, hexToBuffer, AtomTypes} = require('../lib/index.js');
const {U16, I16, STRING} = AtomTypes;

// JavaScript Example 1
{
    // Model with two fields.
    const model = {a: U16, b: I16}; // = {a: 'u16', b: 'i16'};
    // Create CStruct from model. Precompile.
    const cStruct = CStructBE.fromModelTypes(model);
    // Data to transfer. Make buffer from data. Transfer buffer.
    const data = {a: 10, b: -10};
    // Buffer made.
    const buffer = cStruct.make(data).buffer;
    console.log(buffer.toString('hex'));
    // 000afff6
    // {a: 000a, b: fff6}

    // Read buffer. Receive data.
    const result = cStruct.read(buffer);
    console.log(result.struct);
    // { a: 10, b: -10 }
}

// JavaScript Example 2
{
    // Sensor type. ID and value.
    const types = {
        Sensor: {id: U16, value: I16}, // Sensor: {id: 'u16', value: 'i16'},
    }
    // Model with IOT name and two sensors.
    const model = {
        iotName: STRING(0), // iotName: 's0',
        sensors: 'Sensor[2]',
    };
    // Create CStruct from model and types. Precompile.
    const cStruct = CStructBE.fromModelTypes(model, types);
    // Data to transfer. Make buffer from data. Transfer buffer.
    const data = {
        iotName: 'iot-1',
        sensors: [
            {id: 1, value: -10},
            {id: 2, value: -20}
        ]
    };
    // Buffer made.
    const buffer = cStruct.make(data).buffer;
    console.log(buffer.toString('hex'));
    // 696f742d31000001fff60002ffec
    // '696f742d31'00 [{0001, fff6}, {0002, ffec}]

    // Read buffer. Receive data.
    const result = cStruct.read(buffer);
    console.log(result.struct);
    // { iotName: 'iot-1', sensors: [ { id: 1, value: -10 }, { id: 2, value: -20 } ] }
}