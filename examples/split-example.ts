// import { CStructBE, printBuffer } from "../src";
import { CStructBE, printBuffer } from '@mrhiden/cstruct';

{
    // NOTE
    // (u8 - propX)(i32 - propY)(i8 - numberOfAbs)(u16 - propZ)(Ab repeated numberOfAbs times).
    // Ab:{ a: 'u8', b: 'u8' }
    // { propX: 'u8', propY: 'i32', numberOfAbs: 'i8', propZ: 'u16', ab: 'Ab[i16]' }
    // Part1 { propX: 'u8', propY: 'i32', numberOfAbs: 'i8', propZ: 'u16'}
    // Part2 { ab: `Ab[${numberOfAbs}]` }

    // Frame part1 --------------------------------------
    const modelPart1 = {
        propX: 'u8',
        propY: 'i32',
        numberOfAbs: 'i8',
        propZ: 'u16'
    };
    const cStructPart1 = CStructBE.fromModelTypes(modelPart1);

    // Frame part2 --------------------------------------
    type Ab = {a: number, b: number};
    const types = {
        Ab: {a: 'u8', b: 'u8'},
    };
    const getAbArrayStructPart2 = (numberOfAbs: number) => CStructBE.fromModelTypes({ab: `Ab[${numberOfAbs}]`}, types);


    // Sender --------------------------------------
    const sendData = {
        propX: 0x01,
        propY: 0x00000002,
        // numberOfAbs: 0x03,
        propZ: 0x0004,
        ab: [ // numberOfAbs = 3
            {a: 0x05, b: 0x06},
            {a: 0x07, b: 0x08},
            {a: 0x09, b: 0x0A},
        ]
    };
    const makeSenderData = (propX: number, propY: number, propZ: number, ab: Ab[]) => {
        const numberOfAbs = ab.length;
        const {buffer: bufferPart1} = cStructPart1.make({propX, propY, numberOfAbs, propZ});
        const {buffer: bufferPart2} = getAbArrayStructPart2(numberOfAbs).make({ab});
        return Buffer.concat([bufferPart1, bufferPart2]);
    }
    const exchangeDataBuffer = makeSenderData(sendData.propX, sendData.propY, sendData.propZ, sendData.ab);
    printBuffer(exchangeDataBuffer);
    // 010000000203000405060708090a
    // 01 00000002 03 0004 05060708090a
    // 01 00000002 03 0004 [0506 0708 090a]
    // propX:01 propY:00000002 numberOfAbs:03 propZ:0004 ab:[{a:05 b:06}, {a:07 b:08}, {a:09 b:0a}]


    // Receiver --------------------------------------
    const readSenderData = (buffer: Buffer) => {
        const {struct: part1, offset: offset1} = cStructPart1.read(buffer);
        const {struct: part2} = getAbArrayStructPart2(part1.numberOfAbs).read(buffer, offset1);
        return {...part1, ...part2};
    }
    const receivedData = readSenderData(exchangeDataBuffer);
    console.log(receivedData);
    // { propX: 1, propY: 2, numberOfAbs: 3, propZ: 4, ab: [ { a: 5, b: 6 }, { a: 7, b: 8 }, { a: 9, b: 10 } ] }
    // So, the receivedData is the same as sendData
    /* {
            propX: 0x01,
            propY: 0x00000002,
            numberOfAbs: 0x03,
            propZ: 0x0004,
            ab: [
                {a: 0x05, b: 0x06},
                {a: 0x07, b: 0x08},
                {a: 0x09, b: 0x0A},
            ]
        }*/
}