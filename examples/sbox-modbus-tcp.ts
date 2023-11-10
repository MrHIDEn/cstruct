import { CStructBE, hexToBuffer } from "../src";

// Modbus TCP
// Modbus TCP uses a TCP/IP link to send and receive Modbus messages.
//
// The structure of a Modbus TCP message is:
// | Transaction Id	| Protocol	| Length	| Unit Address	| Message |
// | 2 Bytes	    | 2 Bytes   | 2 Bytes	| 1 Byte	    | N Bytes |
//
// Where:
// The Transaction Id field identifies the transaction.
// The Protocol field is zero to indicate Modbus protocol.
// The Length field is the number of following bytes.
// The Unit Address field is the PLC Address encoded as single byte.
// The Message field is a Modbus PDU. The maximum length of the Message field is is 253 bytes.
// The maximum Modbus TCP message length is 260 bytes.

// Interfaces
interface Frame {
    unitAddress: number;
    message: Buffer;
}

interface Tcp {
    transactionId: number;
    protocol: number;
    length: number;
    frame: Buffer;
}

{
    // const types = `{
    //     Frame.buf: {
    //         unitAddress: u8,
    //         message:     WORD[],
    //         // zapisz do bufora te WORDy, i tak na oncu jest to buffor
    //     }
    // }`;
    // const tcpModel = `{
    //     transactionId: u16,
    //     protocol:      u16,
    //     length:        u16,
    //     frame:         buf[length],
    // }`;
    // const tcpModel = `{transactionId: u16, protocol: u16, length: u16.1B, unitAddress: u8, message: ...WORD}`
    // const tcpModel = `{transactionId: u16, protocol: u16, length: u16.1, unitAddress: u8, message: ...WORD}`
    // const tcpModel = `{transactionId: u16, protocol: u16, length: u16/1, unitAddress: u8, message: ...WORD}`;
    const tcpModel = `{t: u16, p: u16, len: u16, rest: buf[len]}`;
    const tcpStruct = new CStructBE<Tcp>(tcpModel);
    console.log(tcpStruct.modelClone);

    // ...WORD, ...u8, ...u16, ... - spred operator, czytaj do konca ten typ danych
    // `{transactionId: u16, protocol: u16, length: u16.1B, unitAddress: u8, message: ...WORD}`
    // `{transactionId: u16, protocol: u16, length: u16.1B, unitAddress: u8, message: WORD[]}`
    //                                                  ^ length is size of rest fields in bytes
    // Make: osobno zrób (unitAddress: u8, message: WORD[]) i dodaj do bufora a 'lenght' = size of buffer / 1B
    // Read: odczytaj z bufora 'length' * 1B = size i na tej podstawie wylicz reszte skoro unitAddress ma znana dlugosc. hm. trudne
    // np length = 5, odcztytaj 'unitAddress: u8' i size = 5-1 = 4, wytnij bufora o dlugosci 4 i odczytaj 'message: WORD[]'/'message: ...WORD'

    // rozważania
    // {
    //    transactionId: u16,
    //    protocol:      u16,
    //    length:        u16,
    //    frame:         buf[length],
    //  }
    // model = `{transactionId: u16, protocol: u16, length: u16.1B, unitAddress: u8, message: ...WORD}`
    // frame = `{unitAddress: u8, message: ...WORD}`
    // types = `{Frame:{unitAddress: u8, message: ...WORD}}`
    // `{some:s[i8]}`      => `{some.i8: s}`
    // model = `{transactionId: u16, protocol: u16, length: u16.frame, frame: buf}`
    // model = `{transactionId: u16, protocol: u16, length.frame: u16, frame: buf}`
    // model = `{transactionId: u16, protocol: u16, length/frame: u16, frame: buf}`
    // model = `{transactionId: u16, protocol: u16, length: u16, frame: buf.length}`
    // model = `{transactionId: u16, protocol: u16, length: u16, frame: length.buf}`
    // model = `{transactionId: u16, protocol: u16, length: u16, frame: buf[length]}` +
    //   jesli frame jest typu 'buf' to length jest liczba bajtow

    // `{some:s[i8]}` => `{some.i8: s}`
    // types = `{Frame:{unitAddress: u8, message: ...WORD}}`
    // model = `{transactionId: u16, protocol: u16, length.frame: u16, frame: Frame}`
    // model = `{transactionId: u16, protocol: u16, length.frame: u16, frame: {unitAddress: u8, message: ...WORD}}`

    // `{some:s[i8]}` => `{some.i8: s}`
    // types = `{Frame:{unitAddress: u8, message: ...WORD}}`
    // WRONG but I am looking for solution
    // model = `{length: u16, frame: Frame[u16]}` - thinking - Nie
    // model = `{length: u16, frame.u16: Frame}` - thinking - Nie
    // model = `{length: u16, frame.u16: {unitAddress: u8, message: ...WORD}}` - thinking - Nie
    // moze nowe słowo kluczowe 'size', [], ... - nie wiem
    // chciałbym length jawnie podać.
    // jak wskazac frame na
    // najlepiej jakby frame wchodził za length z polami Frame a nie jako frame
    // `{length: u16, frame: Frame[length]}` =>
    // `{length: u16.Frame}` \jako bufer oczywiscie\ =>
    // `{length: u16[Frame]}` \jako bufer oczywiscie\ =>
    // `{length: u16.{unitAddress: u8, message: ...WORD}}` \jako bufer oczywiscie\ =>
    // `{length: u16[{unitAddress: u8, message: ...WORD}]}` \jako bufer oczywiscie\ =>
}
/*
{
    // `tcpModel={transactionId: u16, protocol: u16, length: u16, frame: buf[length]}` ale length w bajtach bufora
    // Prepare
    const frameModel = `{
        unitAddress: u8,
        message:     WORD[],
        // zapisz do bufora te WORDy, i tak na oncu jest to buffor
    }`;
    const tcpModel = `{
        transactionId: u16,
        protocol:      u16,
        length:        u16,
        frame:         buf[length],
    }`;
    const frameStruct = new CStructBE<Frame>(frameModel);
    const tcpStruct = new CStructBE<Tcp>(tcpModel);
    console.log(frameStruct.modelClone);
    // { unitAddress: 'u8', message: 'buf' }
    console.log(tcpStruct.modelClone);
    // { transactionId: 'u16', protocol: 'u16', 'frame.u8': 'buf' }
}

{
    // Sender
    const frameModel = `{
        unitAddress: u8,      // Unit Address
        message:     buf,     // PDU, bufer size will be allocated automatically
    }`;
    const tcpModel = `{
        transactionId: u16,      // tid
        protocol:      u16,      // 0
        // length:        u16,     // length
        frame:         buf[u16], // frame
    }`;
    const frameStruct = new CStructBE<Frame>(frameModel);
    const tcpStruct = new CStructBE<Tcp>(tcpModel);
    console.log(frameStruct.modelClone);
    // { unitAddress: 'u8', message: 'buf' }
    console.log(tcpStruct.modelClone);
    // { transactionId: 'u16', protocol: 'u16', 'frame.u8': 'buf' }

    // Send
    const message = hexToBuffer('01030507');
    const frame = {
        unitAddress: 0x77,
        message: message,
    };
    const {buffer: frameBuffer} = frameStruct.make(frame);
    console.log(frameBuffer.length);
    // 5
    console.log(frameBuffer.toString('hex'));
    // 7701030507

    const tcp = {
        transactionId: 0x1234,
        protocol: 0,
        // length: frameBuffer.length,
        frame: frameBuffer,
    };
    const {buffer: tcpBuffer} = tcpStruct.make(tcp);
    console.log(tcpBuffer.toString('hex'));
    // 1234000000057701030507
    // 1234 0000 0005 77 01030507

    // TODO moze wprowadzic inny zapis dla dynamicznych tablic
    // uwzgledniajacy pole someLength i someBuffer/someArray
    // `{length.frame: u16, frame: buf[length.frame]}`
    // `{length: u16, frame: buf[length]}` store last value and use it as size for the next read
    // `{length: u16, frame: buf[length]}` store last key and use it as size for the next write
    // `{length: u16, frame: buf[length]}` => `{length: u16, frame.length: buf}`
    // `{size: i8, dyn: Abc[length]}` => `{size: i8, dyn.size: Abc}`
    // `frameModelWords={unitAddress: u8, message: WORD[2]}` // how to write array without writing size?
    // `frameModelWords={unitAddress: u8, message: WORD[]}`  // this way?
    // `tcpModel={transactionId: u16, protocol: u16, length: u16, frame: buf[length]}`
    // `{WordsFrame:{unitAddress: u8, message: WORD[]}}`
    // `tcpModel={transactionId: u16, protocol: u16, length: u16, frame: WordsFrame[length]}` ale length w bajtach bufora
    // `tcpModel={transactionId: u16, protocol: u16, length: u16, frame: buf[length]}` ale length w bajtach bufora

    // Receiver
    const tcpModel2 = `{
        transactionId: u16,      // tid
        protocol:      u16,      // 0
        // length:        u16,     // length
        frame:         buf[u16], // frame
    }`;
    const tcpStruct2 = new CStructBE<Tcp>(tcpModel2);
    const {struct: readTcp} = tcpStruct2.read(tcpBuffer);
    console.log(readTcp);
    // { transactionId: 4660, protocol: 0, frame: <Buffer 77 01 03 05 07> }

    const frameModel2 = `{
        unitAddress: u8,      // Unit Address
        message:     buf[${readTcp.length-1}],     // PDU, bufer size will be allocated automatically
    }`;
    const frameStruct2 = new CStructBE<Frame>(frameModel2);
    const {struct: readFrame} = frameStruct2.read(readTcp.frame);
    console.log(readFrame);
    // { unitAddress: 119, message: <Buffer 01 03 05 07> }
}

{
    // Prepare
    const frameModel = `{
        unitAddress: u8,      // Unit Address
        message:     WORD[2], // PDU
    }`;
    const tcpModel = `{
        transactionId: u16,     // tid
        protocol:      u16,     // 0
        length:        u16,     // length
        frame:         buf[u8], // frame
    }`;
    const frameStruct = new CStructBE<Frame>(frameModel);
    const tcpStruct = new CStructBE<Tcp>(tcpModel);
    console.log(frameStruct.modelClone);
    // { unitAddress: 'u8', message: [ 'WORD', 'WORD' ] }
    console.log(tcpStruct.modelClone);
    // { transactionId: 'u16', protocol: 'u16', 'frame.u8': 'buf' }

    // Send
    const message = hexToBuffer('01030507');
    const frame = {
        unitAddress: 0x77,
        message: message,
    };
    const {buffer: frameBuffer} = frameStruct.make(frame);
    console.log(frameBuffer.length);
    // 5
    console.log(frameBuffer.toString('hex'));
    // 7701030507

    const tcp = {
        transactionId: 0x1234,
        protocol: 0,
        length: frameBuffer.length,
        frame: frameBuffer,
    };
    const {buffer: tcpBuffer} = tcpStruct.make(tcp);
    console.log(tcpBuffer.toString('hex'));
    // 1234000000077701030507
    // 1234_0000_0007 77_01030507


    // Receive
    const {struct: readTcp} = tcpStruct.read(tcpBuffer);
    console.log(readTcp);
    // { transactionId: 4660, protocol: 0, frame: <Buffer 77 01 03 05 07> }

    const frameModel2 = `{
        unitAddress: u8,
        message:     buf[${readTcp.length-1}],
    }`;
    const frameStruct2 = new CStructBE<Frame>(frameModel2);
    const {struct: readFrame} = frameStruct2.read(readTcp.frame);
    console.log(readFrame);
    // { unitAddress: 119, message: <Buffer 01 03 05 07> }
}
*/