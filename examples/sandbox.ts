// import { CStructBE } from '@mrhiden/cstruct';
import {
    CStructBE,
    CStructModelProperty,
    CStructClass,
} from "../src";

{
    // @CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
    // @CStructClass({
    //     types: {Abc: '{a: i8, b: i8, c: i8}'},
    //     model: {protocol: 'u8', data: 'u8[i16]', name: 's[i8]'}
    // })
    // class SomeExchangeBinary {
    //     // @CStructModelProperty({type: 'u8'})
    //     public protocol: number = 0x11;
    //
    //     // @CStructModelProperty({type: 'u8[i16]'})
    //     public data: number[] = [0x55, 0x66, 0x77, 0x88];
    //
    //     // @CStructModelProperty({type: 's[i8]'})
    //     public name: string = 'abc';
    // }
    // @CStructClass({
    //     model: {protocol: 'u8', data: 'u8[i16]', name: 's[i8]'}
    // })
    // class SomeExchangeBinary {
    //     // @CStructModelProperty({type: 'u8'})
    //     public protocol: number = 0x11;
    //
    //     // @CStructModelProperty({type: 'u8[i16]'})
    //     public data: number[] = [0x55, 0x66, 0x77, 0x88];
    //
    //     // @CStructModelProperty({type: 's[i8]'})
    //     public name: string = 'abc';
    // }
    // @CStructClass({
    //     model: {protocol: 'u8'}
    // })
    // class SomeExchangeBinary {
    //     // @CStructModelProperty({type: 'u8'})
    //     public protocol: number;
    //
    //     // @CStructModelProperty({type: 'u8[i16]'})
    //     public data: number[];
    //
    //     // @CStructModelProperty({type: 's[i8]'})
    //     public name: string;
    // }
    class SomeExchangeBinary {
        @CStructModelProperty({type: 'u8'})
        public protocol: number;

        @CStructModelProperty({type: 'u8[i16]'})
        public data: number[];

        @CStructModelProperty({type: 's[i8]'})
        public name: string;
    }

    const someExchangeBinary = new SomeExchangeBinary();
    someExchangeBinary.protocol = 22;
    someExchangeBinary.data = [33, 44, 55, 66];
    someExchangeBinary.name = 'xyz';
    someExchangeBinary;//?
    someExchangeBinary.__cStructModel;//?
    someExchangeBinary.__cStructTypes;//?
    someExchangeBinary.__cStruct;//?
    Object.keys(someExchangeBinary);//?

    const make = CStructBE.make(someExchangeBinary);
    make;//?
    make.buffer;//?
    make.size;//?
    make.offset;//?
    Object.keys(someExchangeBinary);//?
    someExchangeBinary;//?
    someExchangeBinary.__cStructModel;//?
    someExchangeBinary.__cStructTypes;//?
    someExchangeBinary.__cStruct;//?
    Object.keys(make);//?

    const read = CStructBE.read(someExchangeBinary, make.buffer);
    read;//?
    read.struct;//?
    read.size;//?
    read.offset;//?
    read.struct.protocol;//?
    read.struct.data;//?
    read.struct.name;//?
    someExchangeBinary;//?
    someExchangeBinary.__cStructModel;//?
    someExchangeBinary.__cStructTypes;//?
    someExchangeBinary.__cStruct;//?

}

{
    @CStructClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
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

    // function readBE<T>(struct: T, buffer: Buffer, offset?: number): CStructReadResult<T> {
    //     const decoratedStruct = struct as CStructClass<T>;
    //     if (!decoratedStruct.__cStruct) {
    //         if (!decoratedStruct.__cStructModel) {
    //             throw Error(`Provided struct is not decorated.`);
    //         }
    //         decoratedStruct.__cStruct = new CStructBE(decoratedStruct.__cStructModel, decoratedStruct.__cStructTypes);
    //     }
    //     const result = decoratedStruct.__cStruct.read(buffer, offset);
    //     Object.assign(struct, result.struct);
    //     return result;
    // }

    // const read2 = readBE(someExchangeBinary2, make2.buffer);
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
// {
//     new Date(Date.now()).toISOString();//?
//     new Date().toISOString();//?
// }