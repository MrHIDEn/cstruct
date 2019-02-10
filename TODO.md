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

#### Functions
```javascript
function hex2(buf) {
    return `[${buf.toString('hex').match(/.{2,4}/g)}]`;
}
function hex4(buf) {
    return `[${buf.toString('hex').match(/.{2,8}/g)}]`;
}

let [b4, p4] = makeBufferLe(['f', 'f', 'f', 'f'], [1.1, 2.2, 3.3, 4.4]);
console.log(hex4(b4));
p4;
let [o5, p5] = readBufferLe(b4, ['f', 'f', 'f', 'f'], { protect: true });
o5;
p5;
```
[Dillinger]: <https://dillinger.io>