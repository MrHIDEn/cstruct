import {
    CStructBE,
    CStructClass,
    CStructProperty,
    hexToBuffer,
} from "../src";

/**
 * MUST enable in `tsconfig.json` or `jsconfig.json`
 * {
 *      "compilerOptions": {
 *          "experimentalDecorators": true
 *      }
 * }
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

    const buffer = CStructBE.make(myData).buffer;
    console.log(buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    // Decorators - Serialize any class with CStructModelProperty decorator
    class MyClass {
        @CStructProperty('u16')
        public a: number;

        @CStructProperty( 'i16')
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
        @CStructProperty('MyClass')
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
        @CStructProperty('MyClass')
        public myClass: MyClass;
    }

    const bufferRead = hexToBuffer('000afff6');
    // 000afff6
    // 000a fff6

    // READ
    const myDataRead = CStructBE.read(MyData, bufferRead).struct;
    console.log(myDataRead);
    // MyData { myClass: MyClass { a: 10, b: -10 } }

    console.log(myDataRead instanceof MyData);
    // true
}