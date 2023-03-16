import {
    CStructBE,
    CStructClass,
    CStructModelProperty
} from "../src";

/**
 * MUST: enable
 *      "compilerOptions": {
 *          "experimentalDecorators": true
 *      }
 * in tsconfig.json or jsconfig.json
 */

{
    // Decorators - Serialize any class with CStructClass decorator, model
    @CStructClass({
        model: {a: 'u16', b: 'i16'}
    })
    class MyClass {
        public a: number;
        public b: number;
    }

    const myClass = new MyClass();
    myClass.a = 10;
    myClass.b = -10;

    const buffer = CStructBE.make(myClass).buffer;
    console.log(buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    // Decorators - Serialize any class with CStructClass decorator, model and type
    class MyClass {
        public a: number;
        public b: number;
    }

    @CStructClass({
        model: {myClass: 'MyClass'},
        types: {MyClass: {a: 'u16', b: 'i16'}}
    })
    class MyData {
        public myClass: MyClass;
    }

    const myData = new MyData();
    myData.myClass = new MyClass();
    myData.myClass.a = 10;
    myData.myClass.b = -10;
    myData;//?

    const buffer = CStructBE.make(myData).buffer;
    console.log(buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    // Decorators - Serialize any class with CStructModelProperty decorator
    class MyClass {
        @CStructModelProperty('u16')
        public a: number;

        @CStructModelProperty( 'i16')
        public b: number;
    }

    const myClass = new MyClass();
    myClass.a = 10;
    myClass.b = -10;

    const buffer = CStructBE.make(myClass).buffer;
    console.log(buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    // Decorators - Serialize any class with CStructClass and CStructModelProperty decorator, model and type
    class MyClass {
        public a: number;
        public b: number;
    }

    @CStructClass({
        types: {MyClass: {a: 'u16', b: 'i16'}}
    })
    class MyData {
        @CStructModelProperty('MyClass')
        public myClass: MyClass;
    }

    const myData = new MyData();
    myData.myClass = new MyClass();
    myData.myClass.a = 10;
    myData.myClass.b = -10;

    // MAKE
    const bufferMake = CStructBE.make(myData).buffer;
    console.log(bufferMake.toString('hex'));
    // 000afff6
    // 000a fff6
    bufferMake.length;//?

    // READ
    const myDataRead = new MyData();
    myDataRead.myClass = new MyClass();
    CStructBE.read(myDataRead, bufferMake);
    console.log(myDataRead);
    // MyData { myClass: MyClass { a: 10, b: -10 } }

    // WRITE
    const bufferWrite = Buffer.alloc(4);
    CStructBE.write(myData, bufferWrite);
    console.log(bufferWrite.toString('hex'));
    // 000afff6
    // 000a fff6
}