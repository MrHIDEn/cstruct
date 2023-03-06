// import { CStructBE } from '@mrhiden/cstruct';
import { CStructBE, CStructLE, CStructReadResult, CStructWriteResult, Model } from "../src";

// {
//     const types = '{Ab: {a: i8, b: i8}}';
//     const model = '{data: Ab[i8]}';
//
//     const cStruct = new CStructBE(model, types);
//
//     console.log(cStruct.modelClone);
//     // { b: 'BYTE', w: 'WORD', f: 'BOOL' }
//
//     const struct = {data: [{a: -1, b: -2}, {a: -3, b: -4}]};
//     const {buffer} = cStruct.make(struct);
//
//     console.log(buffer.toString('hex'));
//     // 12345601
//     // 12 3456 01
//
//     const {struct: extractedData} = cStruct.read(buffer);
//     console.log(extractedData);
//     // { b: 18, w: 13398, f: true }
//     // { b: 0x12, w: 0x3456, f: true }
// }

{
// https://stackoverflow.com/questions/54813329/adding-properties-to-a-class-via-decorators-in-typescript
    type Types = {} | string;

    interface CStructClassOptions {
        types?: Types;
    }

    class CStructClassAbstract {
        read(buffer: Buffer, offset?: number): CStructReadResult<{} | []> {
            throw new Error('Not implemented');
        }

        write(buffer: Buffer, offset?: number): CStructWriteResult {
            throw new Error('Not implemented');
        }

        make(): CStructWriteResult {
            throw new Error('Not implemented');
        }
    }

    interface CStructClassInterface {
        read(buffer: Buffer, offset?: number): CStructReadResult<{} | []>;

        write(buffer: Buffer, offset?: number): CStructWriteResult;

        make(): CStructWriteResult;
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

    class CStructDecorators {
        static BEClass(types?: Types) {
            types;//?
            const symbol = Symbol();
            let cStruct = null;

            function compile(target: any) {
                cStruct = new CStructBE(target.model, types);
                cStruct;//?
                cStruct._jsonModel;//?
                cStruct._jsonTypes;//?
            }

            return function <T extends { new(...args: any[]): {} }>(constructor: T) {
                return class extends constructor {
                    [symbol] = compile(this);

                    read(buffer: Buffer, offset?: number): CStructReadResult<T> {
                        return cStruct.read(buffer, offset);
                    }

                    write(buffer: Buffer, offset?: number): CStructWriteResult {
                        return cStruct.write(buffer, this, offset);
                    }

                    make(): CStructWriteResult {
                        return cStruct.make(this);
                    }
                };
            }
        }

        static LEClass(types?: Types) {
            const symbol = Symbol();
            let cStruct = null;

            function compile(target: any) {
                cStruct = new CStructLE(target.model, types);
            }

            return function <T extends { new(...args: any[]): {} }>(constructor: T) {
                return class extends constructor {
                    [symbol] = compile(this);

                    read(buffer: Buffer, offset?: number): CStructReadResult<T> {
                        return cStruct.read(buffer, offset);
                    }

                    write(buffer: Buffer, offset?: number): CStructWriteResult {
                        return cStruct.write(buffer, this, offset);
                    }

                    make(): CStructWriteResult {
                        return cStruct.make(this);
                    }
                };
            }
        }

        static ModelProperty(type: string) {
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
    }

// @CStructBEClass({types: {Abc: '{a: i8, b: i8, c: i8}'}})
// class SomeExchangeBinary extends CStructClassAbstract {
//     @CStructModelProperty({type: 'u8'})
//     public protocol: number = 0x11;
//
//     @CStructModelProperty({type: 'u8[i16]'})
//     public data: number[] = [0x55, 0x66, 0x77, 0x88];
//
//     @CStructModelProperty({type: 's[i8]'})
//     public name: string = 'abc';
// }

    interface Ab {
        a: number;
        b: number;
    }

    @CStructDecorators.BEClass('{Ab: {a: i8, b: i8}}')
    class SomeExchangeBinary extends CStructClassAbstract {
        // @CStructDecorators.ModelProperty('u8')
        // public protocol: number = 0x11;
        //
        // @CStructDecorators.ModelProperty('u8[i16]')
        // public data: number[] = [0x55, 0x66, 0x77, 0x88];
        //
        // @CStructDecorators.ModelProperty('s[i8]')
        // public name: string = 'abc';

        @CStructDecorators.ModelProperty('Ab[i8]')
        public data: Ab[] = [{a: -1, b: -2}, {a: -3, b: -4}];
    }

// const cs = new CStructBE({data: 'Ab[i8]'}, {Ab: '{a: i8, b: i8}'});
// const cs = new CStructBE({data: 'Ab[i8]'}, '{Ab: {a: i8, b: i8}}');
// cs._jsonModel;//?

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

    const {struct, size: size2, toAtoms: toAtoms2} = someExchangeBinary.read(buffer);
    struct;//?
// { protocol: 17, data: [ 85, 102, 119, 136 ], name: 'abc' }
    size2;//?
    toAtoms2();//?


    const buffer1 = Buffer.alloc(20);
    const {buffer: buffer2} = someExchangeBinary.write(buffer1, 2);
    buffer2;//?
    buffer2.toString('hex');//?
    const {struct: struct2} = someExchangeBinary.read(buffer2, 2);
    struct2;//?
// { protocol: 17, data: [ 85, 102, 119, 136 ], name: 'abc' }

}