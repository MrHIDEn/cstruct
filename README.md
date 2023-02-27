c_struct - *'C like structures'* - TypeScript library
=

### Features
* Read/make/write buffer, **Buffer <=> Object/Array**
* Pack / unpack, compress / decompress data to minimize size.
* Convert buffer of **struct/array** to TypeScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
* Little endian - LE
* Big endian - BE

### Install
`npm i c_struct`

### Data types, Atom types and aliases
| Atom | Type               | Size [B] | Aliases                              |
|------|--------------------|----------|--------------------------------------|
| b8   | boolean            | 1        | bool8                    BOOL        |
| b16  | boolean            | 2        | bool16                               |
| b32  | boolean            | 4        | bool32                               |
| b64  | boolean            | 8        | bool64                               |
| u8   | unsigned char      | 1        | uint8  uint8_t           BYTE        |
| u16  | unsigned int       | 2        | uint16 uint16_t          WORD        |
| u32  | unsigned long      | 4        | uint32 uint32_t          DWORD       |
| u64  | unsigned long long | 8        | uint64 uint64_t          LWORD       |
| i8   | signed char        | 1        | int8  int8_t             SINT        |
| i16  | signed int         | 2        | int16 int16_t            INT         |
| i32  | signed long        | 4        | int32 int32_t            DINT        |
| i64  | signed long long   | 8        | int64 int64_t            LINT        |
| f    | float              | 4        | float  float32 float32_t REAL single |
| d    | double             | 4        | double float64 float64_t LREAL       |
| sN   | string             | N        |                                      |

### Usage
The main concept is to first create a model of your data structure and then utilize it to read from and write to a buffer.
1) To achieve this, you can precompile the model and optional types when creating a CStructBE or CStructLE object. 
2) After this step, you can use the object to efficiently access the buffer and perform read/write operations on your data.

### [Many examples are in this folder '/examples'](./examples/README.md)

### Basic examples
```typescript
    // Make BE buffer from struct based on model
    const cStruct = new CStructBE({ error: {code: 'u16', message: 's20'} });

    const { buffer, offset, size } = cStruct.make({ error: { code: 10, message: 'xyz' } });

    console.log(buffer.toString('hex'));
    // 000a78797a0000000000000000000000000000000000
    console.log(offset);
    // 22
    console.log(size);
    // 22
````

```typescript
    // Read BE buffer to struct based on model
    const buffer = hexToBuffer('000F 6162630000_0000000000_0000000000');
    console.log(buffer.toString('hex'));
    // 000f616263000000000000000000000000
    
    const cStruct = new CStructBE({ error: {code: 'u16', message: 's20'} });
    
    const { struct, offset, size } = cStruct.read(buffer);
    
    console.log(struct);
    // { error: { code: 15, message: 'abc' } }
    console.log(offset);
    // 17
    console.log(size);
    // 17
````

### Examples with types
```typescript
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
    const sender = new CStructBE(iotModel, types);
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
    const receiver = new CStructBE(iotModel, types);
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
    // Make buffer from struct based on model and types
    const cStruct = new CStructBE(`{errors: [Error, Error]}`, `{Error: {code: u16, message: s10}}`);

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
    // Mixed approach for model and types
    const cStruct = new CStructBE({errors: `[Error, Error]`}, {Error: `{code: u16, message: s10}`});

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
    // C-kind fields {u8 a,b;} into {a:u8,b:u8}
    const model = `{u8 a,b;}`;
    const cStruct = new CStructBE(model);

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
    // Dynamic (length) array with types
    const model = {
        ab: "Ab[i16]",
    };

    const types = {
        Ab: {a: 'i8', b: 'i8'}
    };

    const cStruct = new CStructBE(model, types);

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
    // Dynamic (length) string
    const model = {
        txt1: "s[i16]",
        txt2: "string[i16]",
    };

    const cStruct = new CStructBE(model);

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
    const model = {b: 'BYTE', w: 'WORD', f: 'BOOL'};

    const cStruct = new CStructBE(model);

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

    const cStruct = new CStructBE(model, types);

    console.log(cStruct.jsonModel);
    // {"xyzs":[{"x":"uint8_t","y":"uint8_t","z":"uint8_t"},{"x":"uint8_t","y":"uint8_t","z":"uint8_t"}]}

    console.log(cStruct.jsonTypes);
    // {"Xyx":{"x":"uint8_t","y":"uint8_t","z":"uint8_t"}}

    console.log(cStruct.modelClone);
    // { xyzs: 
    //    [ { x: 'uint8_t', y: 'uint8_t', z: 'uint8_t' },
    //      { x: 'uint8_t', y: 'uint8_t', z: 'uint8_t' } ] }

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

### [TODO](./docs/TODO.md)
