import { CStructBE, CStructClass, CStructProperty } from "../src";

class MyClass {
    @CStructProperty({type: 'u16'})
    public propertyA: number;
    @CStructProperty({type: 'i16'})
    public propertyB: number;
}

const myClass = new MyClass();
myClass.propertyA = 10;
myClass.propertyB = -10;

const cStruct = CStructBE.from(MyClass);
const make = cStruct.make(myClass);
make;//?
console.log(make.buffer.toString('hex'));
// 000afff6
// 000a fff6


