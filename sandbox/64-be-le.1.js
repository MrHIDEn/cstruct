/*todo:
d, double, 0x402670A3D70A3D71 = 11.22
http://www.binaryconvert.com/result_double.html?decimal=049049046050050
https://stackoverflow.com/questions/25942516/double-to-byte-array-conversion-in-javascript
*/

buffer = Buffer.from(`
402670A3D70A3D71
713D0AD7A3702640
0000000000000000
`.replace(/\s*/g, ''), 'hex');//?
buffer.toString('hex').match(/.{2,16}/g).join(' ');//?

buffer.readBigUInt64LE(0);//?
buffer.readBigUInt64BE(0);//?
buffer.readBigInt64LE(0);//?
buffer.readBigInt64BE(0);//?
buffer.readDoubleLE(8);//?
buffer.readDoubleBE(0);//?
// writeBigUInt64LE
// writeBigUInt64BE
// writeBigInt64LE
// writeBigInt64BE
// writeDoubleLE
// writeDoubleBE