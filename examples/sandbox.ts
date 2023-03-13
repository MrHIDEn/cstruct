// import { CStructBE } from '@mrhiden/cstruct';
import {
    CStructBE,
    CStructModelProperty,
    CStructWriteResult,
    CStructClass,
    Model, Types,
    // CStructReadResult,
} from "../src";

// function CStructClass(options: { types?: Types, model?: Model }): <T extends { new(...args: any[]): {} }>(constructor: T) => any {
//     return function <T extends { new(...args: any[]): {} }>(constructor: T) {
//         function prepareModel(target: any) {
//             target._cStructModel = options.model ?? target._cStructModel;
//             target._cStructTypes = options.types ?? target._cStructTypes;
//             return null; // NOTE null because we don't know yet endianness
//         }
//
//         return class extends constructor {
//             _cStruct = prepareModel(this);
//         }
//     }
// }

{

    // @CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
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
    // console.log({exchangeBinary: someExchangeBinary});
    someExchangeBinary;//?
    someExchangeBinary._cStructModel;//?
    someExchangeBinary._cStructTypes;//?
    someExchangeBinary._cStruct;//?
    Object.keys(someExchangeBinary);//?

    const make = CStructBE.make(someExchangeBinary);
    make;//?
    someExchangeBinary._cStruct;//?
    someExchangeBinary._cStructModel;//?
    someExchangeBinary._cStructTypes;//?
    make._cStruct;//?
    Object.keys(make);//?

    function BEmake<T>(struct: T): CStructWriteResult {
        const decoratedStruct = struct as CStructClass<T>;
        decoratedStruct._cStructModel;//?
        decoratedStruct._cStructTypes;//?
        decoratedStruct._cStruct;//?

        if (!decoratedStruct._cStruct) {
            decoratedStruct;//?
            if (!decoratedStruct._cStructModel) {
                throw Error(`Provided struct is not decorated.`);
            }
            decoratedStruct._cStruct = new CStructBE(decoratedStruct._cStructModel, decoratedStruct._cStructTypes);
        }

        const result = decoratedStruct._cStruct.make(struct);
        result;//?
        return result;
        // return (struct as CStructClass<CStructBEClass>).make();
    }

    let m = BEmake(someExchangeBinary);
    // m = BEmake(someExchangeBinary);
    m;//?
    m._cStructModel;//?
    m._cStructTypes;//?
    m._cStruct;//?
    Object.keys(m);//?
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
    //     if (!decoratedStruct._cStruct) {
    //         if (!decoratedStruct._cStructModel) {
    //             throw Error(`Provided struct is not decorated.`);
    //         }
    //         decoratedStruct._cStruct = new CStructBE(decoratedStruct._cStructModel, decoratedStruct._cStructTypes);
    //     }
    //     const result = decoratedStruct._cStruct.read(buffer, offset);
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