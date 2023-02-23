# c_struct
`$ npm install c_struct`

#### DILLINGER
[Dillinger][Dillinger]

#### TODO
|Status|Subject|
|------|-------|
|**done**|assign .string for dynamic strings|
|**done**|string pre-length `s={"a.string":'u8', a:"string"}, o={a:"012345"}`|
|todo|simple proxy pbuffer.readx('u16le'[, offset]) pbuffer.writex('u16le', val[, offset])|
|todo|simple proxy pbuffer.readLE('u16'[, offset]) pbuffer.writeBE('u16le', val[, offset])|
|todo|simple proxy pbuffer.le.read('u16'[, offset]) pbuffer.be.write('u16', val[, offset])|
|todo|simple proxy pbuffer.le.read('s16'[, offset]) pbuffer.be.write('s16', val[, offset])|

Add aliases for read/write
Note: Aliases can be added by Types `{bool: 'b', int8: 'i8', uint8: 'u8', int16: 'i16', uint16: 'u16', int32: 'i32', uint32: 'u32', float: 'f', double: 'd', string: 's'}`

Check Types against predefined types:
['u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64', 'f', 'd', 's', type.match(/^s(\d+)$/), 'b']
rise error if not match

read/erite bits/flags inside atom type

default values? '=123'

#### Functions
```javascript
function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}
function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}

let [b4, p4] = makeBufferLE(['f', 'f', 'f', 'f'], [1.1, 2.2, 3.3, 4.4]);
console.log(hex4(b4));
p4;
let [o5, p5] = readBufferLE(b4, ['f', 'f', 'f', 'f'], { protect: true });
o5;
p5;
```
[Dillinger]: <https://dillinger.io>