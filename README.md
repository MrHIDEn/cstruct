c_struct - *'C like'* JavaScript library
========
### Features
* Read / write buffer, **Buffer <=> Object/Array**
* Convert buffer of **struct/array** to JavaScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
* Little endian - LE
* Big endian - BE
### Simple case
```javascript
const { readBufferLE } = require('c_struct');

let buffer = Buffer.from([1, 255, 127, 128]);
let struct = ['i8', 'i8', 'i8', 'i8'];

// READ BUFFER - LE
let [arr, offset] = readBufferLE(buffer, struct);

console.log(JSON.stringify(arr)); // [1,-1,127,-128]
console.log(offset); // 4
```
### Install
$ npm i c_struct
### Examples - Level 1
```javascript
const { readBufferLE } = require('c_struct');
let buffer, arr, obj, offset, struct;

buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
struct = ['u8', 'i8', 'u16', 'u16'];
[arr, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(arr)); // [1,-1,33,256]
console.log(offset); // 6

buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
struct = { first: ['u8', 'i8'], second: ['u16', 'u16'] };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"first":[1,-1],"second":[33,256]}
console.log(offset); // 6

buffer = Buffer.from('a4709d3f c3f54840 c3f5c840 48656c6c6f'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28, 'Hello'}
struct = { a: { b: 'f', c: ['f', 'f', 's5'] } };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.2300000190734863,"c":[3.140000104904175,6.28000020980835,"Hello"]}}
console.log(offset); // 17
```
### Requirements
Tested only on: Node 8.14.*
### Examples - Level 1, part 2
```javascript
const { readBufferLE, makeBufferLE, writeBufferLE, } = require('c_struct');
let buffer, arr, obj, offset, struct;

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

buffer = Buffer.from("James\0\0\0\0\0" + "Bond\0\0\0\0\0\0" + "007\0\0\0\0\0\0\0");
console.log(buffer.toString('hex')); // 4a616d65730000000000426f6e6400000000000030303700000000000000
struct = { user: { first: 's10', last: 's10', licence: 's10' } };
[obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"user":{"first":"James","last":"Bond","licence":"007"}}
console.log(offset); //30

buffer = Buffer.alloc(2 * 8);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // 0000000000000000 0000000000000000
struct = ['d', 'd'];
arr = [1.23, 3.14];
offset = writeBufferLE(buffer, struct, arr);
console.log(buffer.toString('hex').match(/\w{1,16}/g).join(' ')); // ae47e17a14aef33f 1f85eb51b81e0940
console.log(offset); // 16
```
```javascript
```
```javascript
```
```javascript
```
### Examples - Level 2
### Examples - Level 3

  


### End