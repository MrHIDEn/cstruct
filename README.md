c_struct - *'C like'* JavaScript library
========
### Features
* Read / write buffer, **Buffer <=> Object/Array**
* Convert buffer of **struct/array** to JavaScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
### Install
$ npm i c_struct
### Examples - Level 1
```javascript
const { readBufferLE } = require('c_struct');
```
```javascript
let buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
let struct = ['u8', 'i8', 'u16', 'u16'];
let [arr, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(arr)); // [1,-1,33,256]
console.log(offset); // 6
```
```javascript
let buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
let struct = { first: ['u8', 'i8'], second: ['u16', 'u16'] };
let [obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"first":[1,-1],"second":[33,256]}
console.log(offset); // 6
```
```javascript
let buffer = Buffer.from('a4709d3f c3f54840 c3f5c840 48656c6c6f'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28, 'Hello'}
let struct = { a: { b: 'f', c: ['f', 'f', 's5'] } };
let [obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.2300000190734863,"c":[3.140000104904175,6.28000020980835,"Hello"]}}
```
### Requirements
Node >= 8.14.*



### Examples - Level 1, part 2
```javascript
const { readBufferLE, makeBufferLE, writeBufferLE, } = require('c_struct');
```
```javascript
let buffer = Buffer.from('ae47e17a14aef33f 1f85eb51b81e0940 1f85eb51b81e1940'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28}
console.log(buffer.toString('hex'));
let struct = {
    a: {
        b: 'd',
        c: [ 'd', 'd' ]
    }
};
let [obj, offset] = readBufferLE(buffer, struct);
console.log(JSON.stringify(obj)); // {"a":{"b":1.23,"c":[3.14,6.28]}}
console.log(offset); // 17
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