# @mrhiden/cstruct
- *'C like structures'* - TypeScript library

[![npm version](https://badge.fury.io/js/@mrhiden%2Fcstruct.svg)](https://badge.fury.io/js/@mrhiden%2Fcstruct)

### Features
* Read/make/write buffer, **Buffer <=> Object/Array**
* Pack / unpack, compress / decompress data to minimize size.
* Convert buffer of **struct/array** to TypeScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
* Little endian - LE
* Big endian - BE
* TypeScript decorators for classes and properties

### Whats new in 1.2 ?
* Added JSON type to transfer blocks of data as JSON string inside buffer
* Fixed model parser to prevent replace field keys names such as 'string...', 'buffer...', 'json...', 's...', 'buf...', 'j...'
### Whats new in 1.3 ?
* Added trailing zero support for "string" and "json" types ("s", "string", "j", "json", "any")
* When we try to write Buffer or Json into too small space, it will throw an error. String will be trimmed to fit.

### Install
`npm i @mrhiden/cstruct`

### Data types, Atom types and aliases
| Atom | Type               | Size [B] | Aliases                              | Notes |
|------|--------------------|----------|--------------------------------------|-------|
| b8   | boolean            | 1        | bool8                    BOOL        |       |
| b16  | boolean            | 2        | bool16                               |       |
| b32  | boolean            | 4        | bool32                               |       |
| b64  | boolean            | 8        | bool64                               |       |
| u8   | unsigned char      | 1        | uint8  uint8_t           BYTE        |       |
| u16  | unsigned int       | 2        | uint16 uint16_t          WORD        |       |
| u32  | unsigned long      | 4        | uint32 uint32_t          DWORD       |       |
| u64  | unsigned long long | 8        | uint64 uint64_t          LWORD       |       |
| i8   | signed char        | 1        | int8  int8_t             SINT        |       |
| i16  | signed int         | 2        | int16 int16_t            INT         |       |
| i32  | signed long        | 4        | int32 int32_t            DINT        |       |
| i64  | signed long long   | 8        | int64 int64_t            LINT        |       |
| f    | float              | 4        | float  float32 float32_t REAL single |       |
| d    | double             | 4        | double float64 float64_t LREAL       |       |
| sN   | string             | N        | string                               | N= 0+ |
| bufN | buffer             | N        | buffer                               | N= 1+ |
| jN   | json               | N        | json any                             | M= 0+ |

### Usage
The main concept is to first create a model of your data structure and then utilize it to read from and write to a buffer.
1) To achieve this, you can precompile the model and optional types when creating a CStructBE or CStructLE object. 
2) After this step, you can use the object to efficiently access the buffer and perform read/write operations on your data.

For exchanging data between JavaScript and C/C++ you can use the following classes and their methods:
- CStructBE - Big Endian
- CStructLE - Little Endian

Both classes uses the same methods and have the same functionality.

Dynamic methods uses Object/Array/String model/types to exchange data.<br>
Static methods are designed to use decorators to define model/types.<br>

**MAKE**<br>
When using `make` method it returns `{ buffer, offset, size }` object.<br>
`make(struct: T): CStructWriteResult;`<br>

**WRITE**<br>
When using `write` method it returns `{ buffer, offset, size }` object.<br>
`write(buffer: Buffer, struct: T, offset?: number): CStructWriteResult;`<br>
Write is different from make because it uses existing buffer and writes data to it.<br>
Also write allows to pass `offset` to pin start point from any offset in the buffer.<br>

**READ**<br>
When using `read` method it returns `{ struct, offset, size }` object.<br>
`read<T>(buffer: Buffer, offset?: number): CStructReadResult<T>;`<br>
Read uses existing buffer and reads data from it.<br>
And also read allows to pass `offset` to pin start point from any offset in the buffer.

**OFFSET**<br>
Offset can be used in different scenario as we want to read/write from/to buffer from any offset.<br>
Which allows binary parser to split data into different parts and read/write them separately.<br>

**DECORATORS**<br>
Decorators are used to define model/types for static methods.<br>
`@CStructClass` - defines model/types for class.<br>
`@CStructProperty` - defines type for property.<br>

Static `make` creates new instance of provided class and fills it with parsed data.<br>

**NOTE**<br>
When using `@CStructClass` decorator with `{model: ... }` it can override `@CStructProperty` decorators.<br>

**Make example**<br>
```typescript
import { CStructBE, CStructProperty } from '@mrhiden/cstruct';

class MyClass {
    @CStructProperty({type: 'u8'})
    public propertyA: number;

    @CStructProperty({type: 'i8'})
    public propertyB: number;
}

const myClass = new MyClass();
myClass.propertyA = 10;
myClass.propertyB = -10;

const bufferMake = CStructBE.make(myClass).buffer;
console.log(bufferMake.toString('hex'));
// 0af6
// 0a f6
````
**Read example**<br>
```typescript
import { CStructBE, CStructProperty } from '@mrhiden/cstruct';

class MyClass {
    @CStructProperty({type: 'u8'})
    public propertyA: number;

    @CStructProperty({type: 'i8'})
    public propertyB: number;
}

const buffer = Buffer.from('0af6', 'hex');
const myClass = CStructBE.read(MyClass, buffer).struct;

console.log(myClass);
// MyClass { propertyA: 10, propertyB: -10 }
console.log(myClass instanceof MyClass);
// true
````
**CStructClass example**<br>
```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: {
        propertyA: 'u8',
        propertyB: 'i8',
    }
})
class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const buffer = Buffer.from('0af6', 'hex');
const myClass = CStructBE.read(MyClass, buffer).struct;

console.log(myClass);
// MyClass { propertyA: 10, propertyB: -10 }
console.log(myClass instanceof MyClass);
// true
```
**Read example with offset, and model and types described as string in CStructClass decorator**<br>
```typescript
import { CStructBE, CStructClass } from '@mrhiden/cstruct';

@CStructClass({
    model: `{propertyA: U8, propertyB: I8}`,
    types: '{U8: uint8, I8: int8}',
})
class MyClass {
    public propertyA: number;
    public propertyB: number;
}

const buffer = Buffer.from('77770af6', 'hex');
const myClass = CStructBE.read(MyClass, buffer, 2).struct;

console.log(myClass);
// MyClass { propertyA: 10, propertyB: -10 }
console.log(myClass instanceof MyClass);
// true
```
Off course `types: '{U8: uint8, I8: int8}'` shows only some idea how to use types.<br>
Types can be much more complex.<br>

### [Many examples are in this folder '/examples'](https://github.com/MrHIDEn/cstruct/tree/main/examples)

### Basic examples
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Make BE buffer from struct based on model
const model = { a: 'u16', b: 'i16' };
const cStruct = CStructBE.fromModelTypes(model);

const data = { a: 10, b: -10 };
const buffer = cStruct.make(data).buffer;

console.log(buffer.toString('hex'));
// 000afff6
// 000a fff6
````

```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Make BE buffer from struct based on model
const cStruct = CStructBE.fromModelTypes({ error: {code: 'u16', message: 's20'} });

const { buffer, offset, size } = cStruct.make({ error: { code: 10, message: 'xyz' } });

console.log(buffer.toString('hex'));
// 000a78797a0000000000000000000000000000000000
console.log(offset);
// 22
console.log(size);
// 22
````

```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Read BE buffer to struct based on model
const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
console.log(buffer.toString('hex'));
// 000f616263000000000000000000000000

const cStruct = CStructBE.fromModelTypes({ error: {code: 'u16', message: 's20'} });

const struct = cStruct.read(buffer).struct;

console.log(struct);
// { error: { code: 15, message: 'abc' } }
````

```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Read BE buffer to struct based on model
const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
console.log(buffer.toString('hex'));
// 000f616263000000000000000000000000

const cStruct = CStructBE.fromModelTypes({ error: {code: 'u16', message: 's20'} });

const { struct, offset, size } = cStruct.read(buffer);

console.log(struct);
// { error: { code: 15, message: 'abc' } }
console.log(offset);
// 17
console.log(size);
// 17
````

### Examples with classes
```typescript
import { CStructBE } from '@mrhiden/cstruct';

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
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

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
```

### Examples with types
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Model and Types for Sender & Receiver
const types = {
  Sensor: {
    id: 'u32',
    type: 'u8',
    value: 'd',
    timestamp: 'u64',
  }
};
const iotModel = {
  iotName: 's20',
  sensor: 'Sensor',
};

// IOT Sender
const sender = CStructBE.fromModelTypes(iotModel, types);
const senderData = {
  iotName: 'IOT-1',
  sensor: {
    id: 123456789,
    type: 0x01,
    value: 123.456,
    timestamp: 1677277903685n,
  }
};
const { buffer: senderFrame } = sender.make(senderData);

// Transmitting frame
console.log(senderFrame.toString('hex'));

// IOT Receiver
const receiver = CStructBE.fromModelTypes(iotModel, types);
const { struct: receiverData } = receiver.read(senderFrame);
console.log(receiverData);
// {
//   iotName: 'IOT-1',
//   sensor: {
//      id: 123456789,
//      type: 1,
//      value: 123.456,
//      timestamp: 1677277903685
//    }
//  }
````

### String based examples. Model and Types are strings but you can mix approach
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Make buffer from struct based on model and types
const cStruct = CStructBE.fromModelTypes(`{errors: [Error, Error]}`, `{Error: {code: u16, message: s10}}`);

const {buffer, offset, size} = cStruct.make({
    errors: [
        {code: 0x12, message: 'message1'},
        {code: 0x34, message: 'message2'},
    ]
});

console.log(buffer.toString('hex'));
// 00126d65737361676531000000346d657373616765320000
console.log(offset);
// 24
console.log(size);
// 24
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Mixed approach for model and types
const cStruct = CStructBE.fromModelTypes({errors: `[Error, Error]`}, {Error: `{code: u16, message: s10}`});

const {buffer, offset, size} = cStruct.make({
    errors: [
        {code: 0x12, message: 'message1'},
        {code: 0x34, message: 'message2'},
    ]
});

console.log(buffer.toString('hex'));
// 00126d65737361676531000000346d657373616765320000
console.log(offset);
// 24
console.log(size);
// 24
```

### C-kind data fields
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// C-kind fields {u8 a,b;} into {a:u8,b:u8}
const model = `{u8 a,b;}`;
const cStruct = CStructBE.fromModelTypes(model);

const makeStruct = { a: 1, b: 2 };
const { buffer: structBuffer } = cStruct.make(
    makeStruct
);
console.log(structBuffer.toString('hex'));
// 0102

const { struct: readStruct } = cStruct.read(structBuffer);
console.log(readStruct);
// { a: 1, b: 2 }
```

### Dynamic length
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Dynamic (length) array with types
const model = {
    ab: "Ab[i16]",
};

const types = {
    Ab: {a: 'i8', b: 'i8'}
};

const cStruct = CStructBE.fromModelTypes(model, types);

console.log(cStruct.modelClone);
// { 'ab.i16': { a: 'i8', b: 'i8' } }

const data = {
    ab: [
        {a: '-1', b: '+1'},
        {a: '-2', b: '+2'},
    ]
};
const {buffer} = cStruct.make(data);

console.log(buffer.toString('hex'));
// 0002ff01fe02

const {struct: extractedData} = cStruct.read(buffer);
console.log(extractedData);
// { ab: [ { a: -1, b: 1 }, { a: -2, b: 2 } ] }
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Dynamic (length) string
const model = {
    txt1: "s[i16]",
    txt2: "string[i16]",
};

const cStruct = CStructBE.fromModelTypes(model);

console.log(cStruct.modelClone);
// { 'txt1.i16': 's', 'txt2.i16': 's' }

const data = {
    txt1: "ABCDE",
    txt2: "AB"
};
const {buffer} = cStruct.make(data);

console.log(buffer.toString('hex'));
// 0005414243444500024142
// 0005_4142434445 0002_4142

const {struct: extractedData} = cStruct.read(buffer);
console.log(extractedData);
// { txt1: 'ABCDE', txt2: 'AB' }
```

### PLC example
```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};

const cStruct = CStructBE.fromModelTypes(model);

console.log(cStruct.modelClone);
// { b: 'BYTE', w: 'WORD', f: 'BOOL' }

const struct = {b: 0x12, w: 0x3456, f: true};
const {buffer} = cStruct.make(struct);

console.log(buffer.toString('hex'));
// 12345601
// 12 3456 01

const {struct: extractedData} = cStruct.read(buffer);
console.log(extractedData);
// { b: 18, w: 13398, f: true }
// { b: 0x12, w: 0x3456, f: true }
```

### C-kind struct
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// C struct types
const model = {
    xyzs: "Xyx[2]",
};
const types = `{
    typedef struct {
        uint8_t x;
        uint8_t y;
        uint8_t z;
    } Xyx;
}`;

const cStruct = CStructBE.fromModelTypes(model, types);

const data = {
    xyzs: [
        {x: 1, y: 2, z: 3},
        {x: 4, y: 5, z: 6},
    ]
};
const {buffer: makeBuffer} = cStruct.make(data);

console.log(makeBuffer.toString('hex'));
// 010203040506

const {struct: readStruct} = cStruct.read(makeBuffer);
console.log(readStruct);
// { xyzs: [ { x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 } ] }
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// C struct types
const types = `{
    // 1st approach
    typedef struct {
        u8 x,y,z;
    } Xyz;
    
    // 2nd approach
    struct Ab {
        i8 x,y;
    };
    
    // As you noticed, comments are allowed
}`;
const model = `{
    ab: Ab,
    xyz: Xyz,
    
    // As you noticed, comments are allowed
}`;

const cStruct = CStructBE.fromModelTypes(model, types);

const data = {
    ab: { x: -2, y: -1 },
    xyz: { x: 0, y: 1, z: 2 }
};
const {buffer: makeBuffer} = cStruct.make(data);

console.log(makeBuffer.toString('hex'));
// feff000102

const {struct: readStruct} = cStruct.read(makeBuffer);
console.log(readStruct);
// { ab: { x: -2, y: -1 }, xyz: { x: 0, y: 1, z: 2 } }
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

// Value, static array, dynamic array
const model = `[
    i8,         // 1 byte
    i8[2],      // 2 bytes static array
    i8[i16]     // i16 bytes dynamic array
]`;

const cStruct = CStructBE.fromModelTypes(model);

console.log(cStruct.jsonModel);
// ["i8","i8.2","i8.i16"]
console.log(cStruct.modelClone);
// [ 'i8', 'i8.2', 'i8.i16' ]

const data = [
    0x01,
    [0x02, 0x03],
    [0x04, 0x05, 0x06, 0x07],
];
const {buffer} = cStruct.make(data);

console.log(buffer.toString('hex'));
// 010203000404050607
// 01 02_03 0004_04_05_06_07

const {struct: extractedData} = cStruct.read(buffer);
console.log(extractedData);
// [ 1, [ 2, 3 ], [ 4, 5, 6, 7 ] ]
```
```typescript
import { CStructBE } from '@mrhiden/cstruct';

class Undecorated {
    a: number;
    b: number;
}
const undecorated = new Undecorated();
undecorated.a = -1;
undecorated.b = -2;

const undecoratedStruct = CStructBE.from({
    model: '{a:float,b:double}',
});
const undecoratedBuffer = undecoratedStruct.make(undecorated).buffer;
console.log(undecoratedBuffer.toString('hex'));
// bf800000c000000000000000
// bf800000 c000000000000000
```

### Decorators
TypeScript's decorators to serialize/deserialize class object to/from binary

**NOTE** Take a look on ['/examples/decorators.ts'](https://github.com/MrHIDEn/cstruct/tree/main/examples/decorators.ts)

**MUST enable in `tsconfig.json` or `jsconfig.json`**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

```typescript
import { CStructBE, CStructClass, CStructModelProperty } from '@mrhiden/cstruct';

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
```

### Some more realistic example
```typescript
import { CStructBE } from '@mrhiden/cstruct';
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
    
    // Write to file
    console.log('Write file length,', writeFile.length);
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
```

### JSON mode
```typescript
import { CStructBE } from '@mrhiden/cstruct';

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
```

### Trailing zero support for "string" and "json" types ("s", "string", "j", "json", "any")
This library has support for trailing zero for "string" and "json" types.<br>
When you use it "json" and "string" will be written as full unknown length and '\0' will be added at the end.<br>
That ending zero helps to read data from binary file without knowing the length of the string / json.<br>
We can not use that trick with buffer as it may contain zeros at any place.<br>

```typescript
import { CStructBE } from '@mrhiden/cstruct';

const model = {
    any1: 'j[0]', // or 'json[0]' or 'any[0]'
    any2: 's[0]', // or 'string[0]'
};

const cStruct = CStructBE.fromModelTypes(model);

const data = {
    any1: [1, 2, 3],
    any2: 'abc',
};

const buffer = cStruct.make(data).buffer;
console.log(buffer.toString('hex'));
// 5b312c322c335d0061626300
// 5b_31_2c_32_2c_33_5d_00 616263_00
// [  1  ,  2  ,  3  ]  \0 a b c  \0

const extractedData = cStruct.read(buffer).struct;
console.log(extractedData);
// { any1: [ 1, 2, 3 ], any2: 'abc' }

console.log(JSON.stringify(data) === JSON.stringify(extractedData));
// true
```

### [TODO](https://github.com/MrHIDEn/cstruct/blob/main/doc/TODO.md)

### Contact
If you have any questions or suggestions, please contact me at<br>
[mrhiden@outlook.com](mailto:mrhiden@outlook.com)