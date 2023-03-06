// import { CStructBE } from '@mrhiden/cstruct';
import { CStructBE, CStructReadResult, CStructWriteResult } from "../src";

type Types = {} | string;

interface CStructClassOptions {
    types?: Types;
}

class CStructClassAbstract {
    read(buffer: Buffer, offset?: number): CStructReadResult<{}|[]> {
        throw new Error('Not implemented');
    }

    write(buffer: Buffer, offset?: number): CStructWriteResult {
        throw new Error('Not implemented');
    }

    make(): CStructWriteResult {
        throw new Error('Not implemented');
    }
}

// can be some class be decorator for other class?
// can static class methods be used as decorators?
// can dynamic class methods be used as decorators?
function CStructBEClass(options: CStructClassOptions = {}) {
    const symbol = Symbol('cStruct');
    let cStruct = null;

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        function compile(target: any) {
            cStruct = new CStructBE(target.model, options?.types);
        }

        function make(): CStructWriteResult {
            return cStruct.make(this);
        }

        function read(buffer: Buffer, offset?: number): CStructReadResult<T> {
            return cStruct.read(buffer, offset);
        }

        function write(buffer: Buffer, offset?: number): CStructWriteResult {
            return cStruct.write(buffer, this, offset);
        }

        return class extends constructor {
            [symbol] = compile(this);

            make = make;
            read = read;
            write = write;
        };
    }
}

function CStructModelProperty({type}: { type: string }) {
    return function (target: any, propertyKey: string) {
        // target;//?
        // propertyKey;//?
        // type;//?

        if (!type) {
            throw Error(`Provide type.`);
        }
        if (!target.model) {
            target.model = {};
        }
        target.model[propertyKey] = type;
    };
}

@CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
class SomeExchangeBinary extends CStructClassAbstract {
    constructor() {
        super();
    }

    @CStructModelProperty({type: 'u8'})
    public protocol: number = 0x11;

    @CStructModelProperty({type: 'u8[i16]'})
    public data: number[] = [0x55, 0x66, 0x77, 0x88];

    @CStructModelProperty({type: 's[i8]'})
    public name: string = 'abc';
}

const someExchangeBinary = new SomeExchangeBinary();
console.log({exchangeBinary: someExchangeBinary});
const {buffer, size, toAtoms} = someExchangeBinary.make();
buffer;//?
//  Ufw�abc
buffer.toString('hex');//?
// 1100045566778803616263
// 11 0004_55667788 03_616263
size;//?
toAtoms();//?

const {struct, size:size2, toAtoms:toAtoms2} = someExchangeBinary.read(buffer);
struct;//?
// { protocol: 17, data: [ 85, 102, 119, 136 ], name: 'abc' }
size2;//?
toAtoms2();//?


const buffer1 = Buffer.alloc(20);
const {buffer:buffer2} = someExchangeBinary.write(buffer1, 2);
buffer2;//?
buffer2.toString('hex');//?
const {struct: struct2} = someExchangeBinary.read(buffer2, 2);
struct2;//?
// { protocol: 17, data: [ 85, 102, 119, 136 ], name: 'abc' }