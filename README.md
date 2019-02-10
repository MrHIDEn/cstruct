c_struct - *'C like'* JavaScript library
========
### Features
* Read / write buffer, **Buffer <=> Object/Arra**
* Convert buffer of **struct/array** to JavaScript **object/array** and back
* Able to pin start point from any offset in the buffer (read/write)
* Can return whole buffer from your data Object/Array (make)
### Install
$ npm i c_struct
### Examples - Level 1
```javascript
let buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
let struct = ['u8', 'i8', 'u16', 'u16'];
let [arr, offset] = readBufferLe(buffer, struct);
arr;    // [ 1, -1, 33, 256]
offset; // 6
```
```javascript
let buffer = Buffer.from([1, 255, 33, 0, 0, 1]);
let struct = { u:'u8', i:'i8', a:'u16', b:'u16'};
let [obj, offset] = readBufferLE(buffer, struct);
obj;    // { u: 1, i: -1, a: 33, b: 256 }
offset; // 6
```
```javascript
let buffer = Buffer.from('a4709d3f c3f54840 c3f5c840 48656c6c6f'.replace(/ /g, ''), 'hex'); //{1.23, 3.14, 6.28, 'Hello'}
console.log(buffer.toString('hex'));
let struct = { a: { b: 'f', c: ['f', 'f', 's5'] } };
let [obj, offset] = readBufferLE(buffer, struct);
obj; // {
//     a: {
//         b: 1.2300000190734863,
//         c: [3.140000104904175, 6.28000020980835, 'Hello']
//     }
// }
offset; // 17
```
### Requirements
Node >= 8.14.*



### Examples - Level 1, part 2
### Examples - Level 2
### Examples - Level 3
