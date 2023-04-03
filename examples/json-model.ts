import { CStructBE, CStructClass } from "../src";

{
    @CStructClass({
        model: {
            any1: 'j[i8]',
            any2: 'json[i8]',
            any3: 'any[i8]',
        }
    })
    class MyClass {
        any1: any;
        any2: any;
        any3: any;
    }

    const myClass = new MyClass();
    myClass.any1 = {a: 1};
    myClass.any2 = {b: "B"};
    myClass.any3 = [1, 3, 5];

    const buffer = CStructBE.make(myClass).buffer;
    console.log(buffer.toString('hex'));
    // 077b2261223a317d097b2262223a2242227d075b312c332c355d
    // 07_7b2261223a317d 09_7b2262223a2242227d 07_5b312c332c355d
    const myClass2 = CStructBE.read(MyClass, buffer).struct;
    console.log(myClass2);
    // MyClass {
    //   any1: { a: 1 },
    //   any2: { b: 'B' },
    //   any3: [ 1, 3, 5 ]
    // }
}