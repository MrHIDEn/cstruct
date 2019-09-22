c_struct - *'C like structures'* JavaScript library
========
### Features
* Read / write buffer, **Buffer <=> Object/Array**
* Pack / unpack, compress / decompress data to minimize size.
* Convert buffer of **struct/array** to JavaScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
* Little endian - LE
* Big endian - BE
### Simple case - read LE
```javascript
const { readBufferLE } = require('c_struct');

let buffer = Buffer.from([1, 255, 127, 128]);
let struct, arr, obj, offset;

// READ BUFFER - LE - into array
struct = ['i8', 'i8', 'i8', 'i8'];
[arr, offset] = readBufferLE(buffer, struct);

console.log(JSON.stringify(arr)); // [1,-1,127,-128]
console.log(offset); // 4

// READ BUFFER - LE - into object
struct = { a:'i8', b:'i8', c:'i8', d:'i8'};
[obj, offset] = readBufferLE(buffer, struct);

console.log(JSON.stringify(obj)); // {"a":1,"b":-1,"c":127,"d":-128}
console.log(offset); // 4
```
### Install
$ npm i c_struct
### Requirements
Tested only on: Node 8.14.*
### Types
|c_struct|C type|Sizeof [B]|Note
|:-:|:-:|:-:|:-
|'u8'|uint8_t|1
|'u16'|uint16_t|2
|'u32'|uint32_t|4
|'i8'|int8_t|1
|'i16'|int16_t|2
|'i32'|int32_t|4
|'f'|float|4
|'d'|double|8
|'s<SIZE>'|string|<SIZE>|s5 - string size 5B, ect
### Examples - General description
Below examples explain all aviable futures.
Note that examples shows only Little Endian LE, but Big Endian BE functions are similar.
LE - readBufferLE, writeBufferLE, makeBufferLE
BE - readBufferBE, writeBufferBE, makeBufferBE
LE, BE - parseStruct - is commone for LE and BE
### Examples - Level 1 - The base and offset
Simple use. Just define 'struct' and read or write without or with 'offset'.
If 'offset' is not provide 'offset' is 0.
```javascript
const { readBufferLE, makeBufferLE, writeBufferLE, } = require('c_struct');
let buffer, arr, obj, obj2, offset, struct;

// #1 READ - just to array
buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
struct = ['u8', 'i8', 'u16', 'u16'];
[arr, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(arr)); // [1,-1,33,256]
console.log(offset); // 6

// #2 READ - read the same data but into more complex structure
buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
struct = { first: ['u8', 'i8'], second: ['u16', 'u16'] };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"first":[1,-1],"second":[33,256]}
console.log(offset); // 6

// #3 READ - float, string into complex structure
buffer = Buffer.from('a4709d3f c3f54840 c3f5c840 48656c6c6f'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28, 'Hello'}
struct = { a: { b: 'f', c: ['f', 'f', 's5'] } };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.2300000190734863,"c":[3.140000104904175,6.28000020980835,"Hello"]}}
console.log(offset); // 17

// #4 READ - double
buffer = Buffer.from('ae47e17a14aef33f 1f85eb51b81e0940 1f85eb51b81e1940'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28}
struct = {
    a: {
        b: 'd',
        c: ['d', 'd']
    }
};
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.23,"c":[3.14,6.28]}}
console.log(offset); // 24

// #5 READ - strings
buffer = Buffer.from("James\0\0\0\0\0" + "Bond\0\0\0\0\0\0" + "007\0\0\0\0\0\0\0");
console.log(buffer.toString('hex')); // 4a616d65730000000000426f6e6400000000000030303700000000000000
struct = { user: { first: 's10', last: 's10', licence: 's10' } };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"user":{"first":"James","last":"Bond","licence":"007"}}
console.log(offset); //30

// #6 READ - from 'offset'
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
struct = { xyz: ['u8', 'u8', 'u8'] };
[obj, offset] = readBufferLE(buffer, struct, { offset: 2 });
console.log(JSON.stringify(obj)); // {"xyz":[170,187,204]}
console.log(offset); // 5

// #7 READ - from 'offset' into array and deconstruct into 'obj2'
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
struct =  ['u8', 'u8', 'u8'] ;
[obj, offset] = readBufferLE(buffer, struct, { offset: 2 });
console.log(JSON.stringify(obj)); // [170,187,204]
console.log(offset); // 5
obj2 = { a: { b: 0, c: [0, 0] } };
[
    obj2.a.b,
    obj2.a.c[0],
    obj2.a.c[1],
] = obj;
console.log(JSON.stringify(obj2)); // {"a":{"b":170,"c":[187,204]}}

// #8 WRITE
buffer = Buffer.alloc(2 * 8);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // 0000000000000000 0000000000000000
struct = ['d', 'd'];
arr = [1.23, 3.14];
offset = writeBufferLE(buffer, struct, arr);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // ae47e17a14aef33f 1f85eb51b81e0940
console.log(offset); // 16

// #9 WRITE - from 'offset'
buffer = Buffer.alloc(8, 0xFF);
console.log(buffer.toString('hex').match(/\w{1,4}/g).join(' ')); // ffff ffff ffff ffff
struct = ['i16', 'i16'];
arr = [1.23, 3.14];
offset = writeBufferLE(buffer, struct, arr, { offset: 2 });
console.log(buffer.toString('hex').match(/\w{1,4}/g).join(' ')); // ffff 0100 0300 ffff
console.log(offset); // 6
```
### Functions
`result = parseStruct(struct, types = {}, options = {});`.
* struct - base struct [Object, Array].
* types - sub structures [Object] - OPTIONAL.
* options - function options [Object] - OPTIONAL.
  * protect - true/false - default: false - protects struct to be changed by `parseStruct()`.
* result - simplified by types, base structure [Object, Array].

`result = readBufferLE(buffer, struct, options = {});`
`result = readBufferBE(buffer, struct, options = {});`
* buffer - read buffer [Buffer].
* struct - struct [Object, Array] with simple types like u8,i8,ect or simplified by `parseStruct()`.
* options - function options [Object] - OPTIONAL.
  * protect - true/false - default: false - protects struct to be changed by `readBufferLE(), readBufferBE()`.
  * offset - integer >= 0 - default: 0 - reading buffer offset, begin offset.
* result - `return [object, offset];` - returns read object and offset in an array.
  * Example: [{ a: 21 }, 1]

`result = writeBufferLE = (buffer, struct, object, options = {});`
`result = writeBufferBE = (buffer, struct, object, options = {});`
* buffer - write buffer [Buffer]
* struct - struct [Object, Array] with simple types like u8,i8,ect or simplified by `parseStruct()`
* options - function options [Object] - OPTIONAL
  * offset - integer >= 0 - default: 0 - writting buffer offset, begin offset.
* result - just offset [Number] after write

`PRE_ALLOC_SIZE = 200;`
* default 200B to alloc buffer in `makeBufferLE, makeBufferBE` functions.
* `let { PRE_ALLOC_SIZE } = require('c_struct'); PRE_ALLOC_SIZE = 500;`

`result = makeBufferLE(struct, object, options = {});`
`result = makeBufferBE(struct, object, options = {});`
* struct - struct [Object, Array] with simple types like u8,i8,ect or simplified by `parseStruct()`.
* options - function options [Object] - OPTIONAL.
  * protect - true/false - default: false - protects struct to be changed by `makeBufferLE(), makeBufferBE()`.
  * trim - true/false - default: false - trims returned buffer to offset (whole data size) just before return.
* result - `return [buffer, offset]` - returns made buffer and offset in an array.
  * Example: [<Buffer 0a 0b 0c>, 3]

### Examples - Level 2 - User types, protect option
This section explains how to provide own sub structures.
Structures can not be imbedded in case of circular dependency.
Imbedding just does not work on purpouse.

> To prepare structure which contains own structures we need to use structure parser - `parseStruct(...)`.
```javascript
const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('../index');
let buffer, arr, obj, offset, struct, types, base;

/* C STRUCTS
typedef struct {
    uint8_t x;
    uint8_t y;
    uint8_t z;
} Xyx;
*/


// #1a - PARSE (base is unprotected), READ+OFFSET
base = { xyz: 'Xyz' };
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // {"xyz":"Xyz"}
// PARSE
struct = parseStruct(base, types);

console.log(JSON.stringify(base)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}  <== Changed
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}

// #2 READ + OFFSET (struct is unprotected)
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}
[obj, offset] = readBufferLE(buffer, struct, { offset: 2 });
console.log(JSON.stringify(obj)); // {"xyz":{"a":170,"b":187,"c":204}}
console.log(offset); // 5
console.log(JSON.stringify(struct)); // {"xyz":{"a":170,"b":187,"c":204}}  <== Changed


// #3 - PARSE (struct is protected)
base = { xyz: 'Xyz' };
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // {"xyz":"Xyz"}
// PARSE
struct = parseStruct(base, types, { protect: true });

console.log(JSON.stringify(base)); // {"xyz":"Xyz"}  <== Unchanged
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}


// #4 READ + OFFSET (struct is protected)
buffer = Buffer.from('00 00 aa bb cc 00 00'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 0000aabbcc0000
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}
[obj, offset] = readBufferLE(buffer, struct, { offset: 2, protect: true });
console.log(JSON.stringify(obj)); // {"xyz":{"a":170,"b":187,"c":204}}
console.log(offset); // 5
console.log(JSON.stringify(struct)); // {"xyz":{"a":"u8","b":"u8","c":"u8"}}  <== Unchanged


// #5 - PARSE (struct is protected)
base = [ 'Xyz', 'Xyz', 'Xyz' ];
types = { Xyz: { x: 'u8', y: 'u8', z: 'u8' } };
console.log(JSON.stringify(base)); // ["Xyz","Xyz","Xyz"]
// PARSE
struct = parseStruct(base, types, { protect: true });

console.log(JSON.stringify(base)); // ["Xyz","Xyz","Xyz"]  <== Unchanged
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]


// #6 READ (struct is protected)
buffer = Buffer.from('01 02 03  04 05 06  07 08 09'.replace(/ /g, ''), 'hex');
console.log(buffer.toString('hex')); // 010203040506070809
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]
[obj, offset] = readBufferLE(buffer, struct, { protect: true });
console.log(JSON.stringify(obj)); // [{"x":1,"y":2,"z":3},{"x":4,"y":5,"z":6},{"x":7,"y":8,"z":9}]
console.log(offset); // 9
console.log(JSON.stringify(struct)); // [{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"},{"x":"u8","y":"u8","z":"u8"}]  <== Unchanged

```
### Examples - Level 3 - Dynamic arrays, Dynamic strings
Structs allow to define dynamic array and dynamic string.
Dynamic means unknown size/length

TODO:
'<KEY>.size': 'u8 / u16 / u32', '<KEY>': <ARRAY TYPE, base types u8,ect or complex type>
'<KEY>.length': 'u8 / u16 / u32', '<KEY>': 'string'
```javascript
const { parseStruct, readBufferLE, makeBufferLE, writeBufferLE, } = require('../index');
let buffer, arr, obj, offset, struct, types, base;

//TODO ... :)

```
### End