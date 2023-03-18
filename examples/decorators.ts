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
        @CStructProperty({type: 'u16'})
        public a: number;

        @CStructProperty('i16')
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
        @CStructProperty({type: 'MyClass'})
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
        @CStructProperty({type: 'MyClass'})
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

{
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
    console.log(make.buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    @CStructClass({
        model: `{propertyA: U16, propertyB: I16}`,
        types: '{U16: uint16, I16: int16}',
    })
    class MyClass {
        public propertyA: number;
        public propertyB: number;
    }

    const myClass = new MyClass();
    myClass.propertyA = 10;
    myClass.propertyB = -10;

    const cStruct = CStructBE.from(MyClass);
    const make = cStruct.make(myClass);
    console.log(make.buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    class MyClass {
        public propertyA: number;
        public propertyB: number;
    }

    const myClass = new MyClass();
    myClass.propertyA = 10;
    myClass.propertyB = -10;

    const cStruct = CStructBE.from({
        model: `{propertyA: U16, propertyB: I16}`,
        types: '{U16: uint16, I16: int16}',
    });
    const make = cStruct.make(myClass);
    console.log(make.buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    class MyClass {
        public propertyA: number;
        public propertyB: number;
    }

    const myClass = new MyClass();
    myClass.propertyA = 10;
    myClass.propertyB = -10;

    const model = { propertyA: 'u16', propertyB: 'i16' };
    const cStruct = CStructBE.fromModelTypes(model);
    const make = cStruct.make(myClass);
    console.log(make.buffer.toString('hex'));
    // 000afff6
    // 000a fff6
}

{
    import * as fs from "fs";

    interface GeoAltitude {
        lat: number;
        long: number;
        alt: number;
    }

    @CStructClass({
        types: `{ GeoAltitude: { lat:double, long:double, alt:double }}`
    })
    class GeoAltitudesFile {
        @CStructProperty({type: 'string30'})
        public fileName: string = 'GeoAltitudesFile v1.0';

        @CStructProperty({type: 'GeoAltitude[i32]'})
        public geoAltitudes: GeoAltitude[] = [];
    }

    (async () => {
        // Make random data
        const geoAltitudesFile = new GeoAltitudesFile();
        for (let i = 0; i < 1e6; i++) {
            let randomLat = Math.random() * (90 - -90) + -90;
            let randomLong = Math.random() * (180 - -180) + -180;
            let randomAlt = 6.4e6 * Math.random() * (8e3 - -4e3) + -4e3;
            const geo = {lat: randomLat, long: randomLong, alt: randomAlt};
            geoAltitudesFile.geoAltitudes.push(geo);
        }
        console.log('Write data length,', geoAltitudesFile.geoAltitudes.length);

        // Make buffer
        console.time('make');
        const writeFile = CStructBE.make(geoAltitudesFile).buffer;
        console.timeEnd('make');
        console.log('Write file length,', writeFile.length);

        // Write to file
        await fs.promises.writeFile('geoAltitudesFile.bin', writeFile);

        // Read from file
        const readFile = await fs.promises.readFile('geoAltitudesFile.bin');
        console.log('Read file length,', readFile.length);

        // Read data
        console.time('read');
        const readGeoAltitudesFile = CStructBE.read(GeoAltitudesFile, readFile).struct;
        console.timeEnd('read');

        console.log('Read fileName,', readGeoAltitudesFile.fileName);
        console.log('Read data length,', readGeoAltitudesFile.geoAltitudes.length);
    })();
}