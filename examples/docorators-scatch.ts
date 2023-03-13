import { CStructBE } from '@mrhiden/cstruct';
import { CStructReadResult, CStructWriteResult, Model } from "@mrhiden/cstruct/lib/types";
import { CStruct } from "@mrhiden/cstruct/lib/cstruct";

type Types = {} | string;

interface CStructClassOptions {
    types?: Types;
}

// can be some class be decorator for other class?
// can static class methods be used as decorators?
// can dynamic class methods be used as decorators?
function CStructBEClass<T>(options: CStructClassOptions = {}) {
    const symbol = Symbol('cStruct');
    let cStruct = null;

    return function <T extends { new(...args: any[]): {} }>(constructor: T) {

        function compile(target: any) {
            cStruct = new CStructBE(target.model, options?.types);
            return cStruct;
        }

        function make() {
            return cStruct.make(this);
        }

        function write(buffer: Buffer, offset?: number) {
            return cStruct.make(buffer, this, offset);
        }

        function read(buffer: Buffer, offset?: number) {
            const result = cStruct.read(buffer, offset);
            const struct = result.struct;
            Object.entries(struct).forEach(([key, value]) => {
                this[key] = value;
            });
            return result;
        }

        const r = class extends constructor {
            [symbol] = compile(this);

            make = make;
            write = write;
            read = read;
        }

        return r;

        // return class extends constructor {
        //     [symbol] = compile(this);
        //
        //     make = make;
        //     write = write;
        //     read = read;
        // };
    }
}

function CStructModelProperty({type}: { type: string }) {
    return function (target: any, propertyKey: string) {
        if (!type) {
            throw Error(`Provide type.`);
        }
        if (!target.model) {
            target.model = {};
        }
        target.model[propertyKey] = type;
    };
}

class CStructClass<T> {
    make(): CStructWriteResult {
        throw Error(`Not implemented.`);
    }

    write(buffer: Buffer, offset?: number): CStructWriteResult {
        throw Error(`Not implemented.`);
    }

    read(buffer: Buffer, offset?: number): CStructReadResult<T> {
        throw Error(`Not implemented.`);
    }
}

class CStructBE2 {
    static make<CStructBEClass>(struct: CStructBEClass): CStructWriteResult {
        return (struct as CStructClass<CStructBEClass>).make();
    }

    static write<CStructBEClass>(struct: CStructBEClass, buffer: Buffer, offset?: number) {
        return (struct as CStructClass<CStructBEClass>).write(buffer, offset);
    }

    static read<CStructBEClass>(struct: CStructBEClass, buffer: Buffer, offset?: number): CStructReadResult<CStructBEClass> {
        return (struct as CStructClass<CStructBEClass>).read(buffer, offset);
    }
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

const make2 = CStructBE2.make(someExchangeBinary);
make2;//?
make2.buffer.toString('hex')//?
make2.size;//?
make2.offset;//?

const someExchangeBinary2 = new SomeExchangeBinary();
someExchangeBinary2;//?
someExchangeBinary2.protocol;//?
someExchangeBinary2.data;//?
someExchangeBinary2.name;//?
const read2 = CStructBE2.read(someExchangeBinary2, make2.buffer);
read2;//?
read2.struct;//?
read2.size;//?
read2.offset;//?
someExchangeBinary2;//?
someExchangeBinary2.protocol;//?
someExchangeBinary2.data;//?
someExchangeBinary2.name;//?

const t = CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}});
// <T extends {new(...args: any[]): {}}>(constructor: T) => ({new(...args: any[]): Anonymous, class, prototype: Anonymous, function, <>(), (Anonymous: any)} & T)
const u = CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})(SomeExchangeBinary);
// {new(...args: any[]): Anonymous, function, (), SomeExchangeBinary, (Anonymous: any), class, prototype: Anonymous, <>(), (Anonymous: any)} & typeof SomeExchangeBinary
t;//?
u;//?

