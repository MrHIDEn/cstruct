// import { CStructBE } from '@mrhiden/cstruct';
import {
    CStructBE,
    CStructBEClass,
    CStructLE,
    CStructModelProperty,
    CStructReadResult,
    CStructWriteResult,
    Model
} from "../src";

{
    @CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
    class SomeExchangeBinary {
        @CStructModelProperty({type: 'u8'})
        public protocol: number = 0x11;

        @CStructModelProperty({type: 'u8[i16]'})
        public data: number[] = [0x55, 0x66, 0x77, 0x88];

        @CStructModelProperty({type: 's[i8]'})
        public name: string = 'abc';
    }

    const someExchangeBinary = new SomeExchangeBinary();
    someExchangeBinary.protocol = 22;
    someExchangeBinary.data = [33, 44, 55, 66];
    someExchangeBinary.name = 'xyz';
    console.log({exchangeBinary: someExchangeBinary});

// const { buffer } = someExchangeBinary.make?.();
// buffer;//?
// //  Ufw�abc
// buffer.toString('hex')//?
// // 1100045566778803616263
// // 11 0004_55667788 03_616263
//
// const struct = someExchangeBinary.read?.(buffer);
// struct;//?

    const make2 = CStructBE.make(someExchangeBinary);
    make2;//?
    make2.buffer.toString('hex')//?
    make2.size;//?
    make2.offset;//?

    const someExchangeBinary2 = new SomeExchangeBinary();
    someExchangeBinary2;//?
    someExchangeBinary2.protocol;//?
    someExchangeBinary2.data;//?
    someExchangeBinary2.name;//?
    const read2 = CStructBE.read(someExchangeBinary2, make2.buffer);
    read2;//?
    read2.struct;//?
    read2.size;//?
    read2.offset;//?
    someExchangeBinary2;//?
    someExchangeBinary2.protocol;//?
    someExchangeBinary2.data;//?
    someExchangeBinary2.name;//?
}

{
    new Date(Date.now()).toISOString();//?
    new Date().toISOString();//?
}