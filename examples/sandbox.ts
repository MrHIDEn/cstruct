import {
    CStructBE, CStructClass,
    CStructDecoratorProperties,
    CStructLE, CStructProperty,
    CStructReadResult,
    CStructWriteResult,
    Model,
    Types
} from "../src";
//
// export type Constructor<T = unknown> = new (...args: any[]) => T;
// export type Dictionary<T = any> = { [k: string]: T };
// export type CStructCOptions = {
//     types?: Types,
//     model?: Model
// }
// export type CStructPOptions = {
//     type: string,
// }
//
// // export class InstanceFactory {
// //     constructor() { }
// //
// //     proxyFactory<T>(newable: new() => T) {
// //         const instance = new newable();
// //         return new InstanceFactory<T>(instance);
// //     }
// // }
// function getInstance<T>(newable: new() => T, properties = {}) {
//     const instance = new newable();
//     return Object.assign(instance, properties);
// }
// class B {
//     k: number;
//     m: number;
//     constructor() {
//         console.log(`B`);
//     }
//     foo() {
//         console.log(`B.foo`);
//         return `B.foo`;
//     }
// }
// const b = getInstance(B, {a:1,k:2,m:2});//?
// b;//?
// b.foo();//?
//
// export class CStructMetadata {
//     model: Model;
//     types: Types;
//     cStruct: CStructBE<any> | CStructLE<any>;
//     class: Constructor<any>;
//     className: string;
//     static CStructSymbol = Symbol('CStruct');
//
//     constructor() {
//         this.model = {};
//         this.types = {};
//         this.cStruct = null;
//     }
//
//     static getMetadata(target: any) {
//         let metadata = target.prototype?.[this.CStructSymbol] ?? target[this.CStructSymbol];
//         if (!metadata) {
//             metadata = target[this.CStructSymbol] = new CStructMetadata();
//         }
//         return metadata;
//     }
//
//     static addProperty<T>(target: T & Dictionary, propertyName: string, options: CStructPOptions) {
//         const metadata = CStructMetadata.getMetadata(target);
//         metadata.model[propertyName] = options.type;
//     }
//
//     static addClass<T>(target: T & Dictionary, options: CStructCOptions) {
//         const metadata = CStructMetadata.getMetadata(target);
//         metadata.types = options.types;
//         metadata.model = options.model;
//         metadata.class = target as unknown as Constructor<T>;
//         metadata.className = target.name;
//     }
//
//     static getCStructBE<T>(struct: T): CStructBE<T> {
//         const metadata = CStructMetadata.getMetadata(struct);
//         if (!metadata.cStruct) {
//             if (!metadata.model) {
//                 throw Error(`Provided struct is not decorated.`);
//             }
//             metadata.cStruct = new CStructBE(metadata.model, metadata.types);
//         }
//         return metadata.cStruct as CStructBE<T>;
//     }
//
//     static getCStructLE<T>(struct: T): CStructLE<T> {
//         const metadata = CStructMetadata.getMetadata(struct);
//         if (!metadata.cStruct) {
//             if (!metadata.model) {
//                 throw Error(`Provided struct is not decorated.`);
//             }
//             metadata.cStruct = new CStructLE(metadata.model, metadata.types);
//         }
//         return metadata.cStruct as CStructLE<T>;
//     }
//
//     // static getInstance<T>(struct: any): T {
//     //     // const instance = new (myClass[CStructMetadata.CStructSymbol].class)();
//     //     // const instance = new this.class();
//     //
//     //     const metadata = CStructMetadata.getMetadata(struct);
//     //     const instance = new metadata.class();
//     //     return Object.assign(instance, struct);
//     // }
//     // static getInstance<T>(NewableT: new() => T) {
//     //     const instance = new NewableT();
//     //     const metadata = CStructMetadata.getMetadata(instance);
//     //     return instance;
//     // }
//     //
//     // static getInstance2<T>(newable: new() => T, properties = {}) {
//     //     const instance = new newable();
//     //     return Object.assign(instance, properties);
//     //     // const b = getInstance(B, {a:1,k:2,m:2});
//     // }
// }
//
// export function CStructProperty(options: CStructPOptions) {
//     return function <T>(target: T & Dictionary, propertyName: string) {
//         CStructMetadata.addProperty(target, propertyName, options);
//     }
// }
//
// export function CStructClass(options: CStructCOptions = {}) {
//     return function <T>(target: T & Dictionary) {
//         CStructMetadata.addClass(target, options);
//         return target;
//     };
// }
//
// @CStructClass({
//     model: {
//         myProperty1: 'U8',
//         myProperty2: 'I8',
//     },
//     types: {I8: 'i8', U8: 'u8'}
// })
// class MyClass {
//     // @CStructModelProperty('uint8')
//     @CStructProperty({type: 'uint8'})
//     public myProperty1: number;
//
//     @CStructProperty({type: 'int8'})
//     public myProperty2: number;
// }
//
// const myClass = new MyClass();
// myClass.myProperty1 = 10;
// myClass.myProperty2 = -10;
// console.log(myClass);
// console.log(myClass[CStructMetadata.CStructSymbol]);
// console.log(myClass[CStructMetadata.CStructSymbol].types);
// console.log(myClass[CStructMetadata.CStructSymbol].model);
// console.log(myClass[CStructMetadata.CStructSymbol].cStruct);
// console.log(myClass[CStructMetadata.CStructSymbol].className);
// console.log(myClass[CStructMetadata.CStructSymbol].class);
// const cStruct = CStructMetadata.getCStructBE(myClass);
// cStruct;//?
//
// function make<T>(struct: T): CStructWriteResult {
//     const cStruct = CStructMetadata.getCStructBE(myClass);
//     return cStruct.make(struct);
// }
//
// function read<T>(newableClass: new() => T, buffer: Buffer, offset?: number): CStructReadResult<T> {
//     const instance = new newableClass();
//     const cStruct = CStructMetadata.getCStructBE(instance);
//     const result = cStruct.read(buffer, offset);
//     result.struct = Object.assign(instance, result.struct);
//     return result;
// }
//
// const a = new (myClass[CStructMetadata.CStructSymbol].class)();
// a;//?
//
// const make1 = make<MyClass>(myClass);
// make1;//?
//
// const buf = Buffer.from([0x0B, 0xF5]);
// const read1 = read(MyClass,buf);
// read1;//?
// read1.struct;//?

@CStructClass({
    model: {
        myProperty1: 'U8',
        myProperty2: 'I8',
    },
    types: {I8: 'i8', U8: 'u8'}
})
class MyClass {
    // @CStructModelProperty('uint8')
    @CStructProperty({type: 'uint8'})
    public myProperty1: number;

    @CStructProperty({type: 'int8'})
    public myProperty2: number;
}

const myClass = new MyClass();
myClass.myProperty1 = 10;
myClass.myProperty2 = -10;
console.log(myClass);

const make1 = CStructBE.make(myClass);
make1;//?
make1.buffer.toString('hex');//?

const buf1 = Buffer.from([0x0B, 0xF5]);
const read1 = CStructBE.read(MyClass,buf1);
read1;//?
read1.struct;//?
read1.struct instanceof MyClass;//?


const buf2 = Buffer.from([0x00, 0x00,0x00, 0x00]);
const write1 = CStructBE.write(myClass,buf2, 2);
write1;//?
write1.buffer.toString('hex');//?
