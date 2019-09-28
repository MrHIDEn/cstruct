const { struct } = require('../index');
let model, buffer, readBE, readLE, writeBE, writeLE, offset;

/**
 * This is just the bigining
 * Below are some simple and more complex exchangers
 * Models are prepared to be reusable, and there is no need to create them every time.
 * It is better to create them once (parse time) and use them later for all exchanges.
 * Just remember that model holds `offset` and which needs to be reset when reused.
 * As default `offset` is set to 0.
 * Read or write methods allow to set `offset` every time it is needed.
 */

/**
 * Simple struct parser/reader
 * readBE(BASE)
 */

buffer = Buffer.from("01 0101 00000102".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(['u8']);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1]

model = struct(['u8', 'u16', 'u32']);
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [1,257,258]

model = struct({ a: 'u8' });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1}

model = struct({ a: 'u8', b: 'u16', c: 'u32' });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":257,"c":258}

model = struct({ a: { b: 'u8', c: 'u16' }, d: 'u32' });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"b":1,"c":257},"d":258}

model = struct({ a: 'u8', b: ['u16', 'u32'] });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":1,"b":[257,258]}

model = struct({ a: [{ b: 'u8' }, { c: 'u16' }, { d: 'u32' }] });
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[{"b":1},{"c":257},{"d":258}]}

/**
 * Type struct parser/reader
 * readBE(BASE, TYPES)
 */

buffer = Buffer.from("01 0101 00000102 02 0103 00000104".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(['TestType', 'TestType'], {
    TestType: ['u8', 'u16', 'u32']
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[1,257,258],[2,259,260]]

model = struct({ a: 'TestType', b: { c: 'TestType' } }, {
    TestType: ['u8', 'u16', 'u32']
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":[1,257,258],"b":{"c":[2,259,260]}}

model = struct({ a: 'TestType' }, {
    TestType: { x: 'u8', y: 'u16', z: 'u32' }
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// {"a":{"x":1,"y":257,"z":258}}

model = struct(['Xyz', 'Abc'], {
    Xyz: { x: 'u8', y: 'u16', z: 'u32' },
    Abc: { a: 'u8', b: 'u16', c: 'u32' }
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"x":1,"y":257,"z":258},{"a":2,"b":259,"c":260}]

/**
 * Floating points section
 * f - float32, float
 * d - float64, double
 */

buffer = Buffer.from("01 02 03 04 05 06 07 08".replace(/[ ,\n]+/g, ''), 'hex');

model = struct(['RGBA', 'RGBA'], {
    RGBA: { r: 'u8', g: 'u8', b: 'u8', a: 'u8' }
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [{"r":1,"g":2,"b":3,"a":4},{"r":5,"g":6,"b":7,"a":8}]

buffer = Buffer.from(`
41300000
41b00000
42040000
42300000
425c0000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct([['Point3Df32'], { "2D": 'Point2Df32' }], {
    Point2Df32: { x: 'f', y: 'f' },
    Point3Df32: { x: 'f', y: 'f', z: 'f' }
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

buffer = Buffer.from(`
4026000000000000
4036000000000000
4040800000000000
4046000000000000
404B800000000000
`.replace(/[ ,\n]+/g, ''), 'hex');
// 11, 22, 33, 44, 55

model = struct([['Point3Df64'], { "2D": 'Point2Df64' }], {
    Point2Df64: { x: 'd', y: 'd' },
    Point3Df64: { x: 'd', y: 'd', z: 'd' }
});
readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// [[{"x":11,"y":22,"z":33}],{"2D":{"x":44,"y":55}}]

/**
 * Cursor/offset auto increments
 * You can use the same model every time but you need to reset offset
 * 
 * Most examples are BE - BigEndian
 * Here are some LE - LittleEndian as well
 */

buffer = Buffer.from(`
0102
0304
0506
0708
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(['u16', 'u16']);

readBE = model.readBE(buffer);
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer);        // model remember offset, witch is now 4= 2 * 2B
console.log(JSON.stringify(readBE));
// BE: [1286,1800]

readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]
readBE = model.readBE(buffer, 0);     // reset offset
console.log(JSON.stringify(readBE));
// BE: [258,772]

readLE = model.readLE(buffer, 0);     // reset offset
console.log(JSON.stringify(readLE));
// LE: [513,1027]
readLE = model.readLE(buffer);        // continue offset
console.log(JSON.stringify(readLE));
// LE: [1541,2055]

/**
 * Writing... - write to existing buffer
 * Making... - make buffer, write data there and trim it to the minimum
 * 
 * Write examples below are so similar to `read` that you can make them by similarity
 */

/** Write */
buffer = Buffer.from(`
00 00 00 00
`.replace(/[ ,\n]+/g, ''), 'hex');

model = struct(['u8', 'u8']);
offset = model.writeBE(buffer, [2, 3]);
console.log(buffer.toString('hex'));
// 02030000
/**
 * This can be use to write data by different models one by one
 */
offset = model.writeBE(buffer, [5, 6]); // continue offset
console.log(buffer.toString('hex'));
// 02030506

model = struct({ f32: 'f' });
offset = model.writeBE(buffer, { f32: 55 }, 0); // reset offset, BE
console.log(buffer.toString('hex'));
// 425c0000
offset = model.writeLE(buffer, { f32: 55 }, 0); // reset offset, LE
console.log(buffer.toString('hex'));
// 00005c42

/** Make */
buffer = null;
model = struct({ points: ['2D', '2D', '2D'] }, { "2D": { x: 'f', y: 'f' } });
buffer = model.makeBE({ 
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 41300000 41b00000 42040000 42300000 429a0000 42840000
buffer = model.makeLE({ 
    points: [
        { x: 11, y: 22 },
        { x: 33, y: 44 },
        { x: 77, y: 66 },
    ]
});
console.log(buffer.toString('hex').match(/.{2,8}/g).join(' '));
// 00003041 0000b041 00000442 00003042 00009a42 00008442

/**
 * You can make similar to read models and write/make buffors
 */
