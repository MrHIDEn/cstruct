// import { CStructBE } from '@mrhiden/cstruct';


import { CStructBE } from "../src";

type Types = {} | string;

interface CStructClassOptions {
    types?: Types;
}

// can be some class be decorator for other class?
// can static class methods be used as decorators?
// can dynamic class methods be used as decorators?
function CStructBEClass(options: CStructClassOptions = {}) {
    const symbol = Symbol('cStruct');
    let cStruct = null;

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {
        // const params = [...arguments];
        // params;//?
        // params.length;//?

        function compile(target: any) {
            cStruct = new CStructBE(target.model, options?.types);
            cStruct;//?
            return cStruct;
        }

        function make() {
            options;//?
            const { buffer } = cStruct.make(this);
            return buffer;
        }

        function read(buffer: Buffer) {
            options;//?
            const { struct } = cStruct.read(buffer);
            return struct;
        }

        return class extends constructor {
            [symbol] = compile(this);

            make = make;
            read = read;
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
class SomeExchangeBinary {
    @CStructModelProperty({type: 'u8'})
    public protocol: number = 0x11;

    @CStructModelProperty({type: 'u8[i16]'})
    public data: number[] = [0x55, 0x66, 0x77, 0x88];

    @CStructModelProperty({type: 's[i8]'})
    public name: string = 'abc';
}

const someExchangeBinary = new SomeExchangeBinary();
console.log({exchangeBinary: someExchangeBinary});
const buffer = someExchangeBinary.make?.();
buffer;//?
//  Ufw�abc
buffer.toString('hex')//?
// 1100045566778803616263
// 11 0004_55667788 03_616263

const struct = someExchangeBinary.read?.(buffer);
struct;//?
// { protocol: 17, data: [ 85, 102, 119, 136 ], name: 'abc' }
