const { struct } = require('../index');
let model, buffer, read, write;

{
    buffer = Buffer.from("abcdefghijklmoprstuvwz");
    console.log(buffer.toString('hex'));

    model = struct(['u8']);
    read = model.readBE(buffer);
    console.table(read);

    model = struct(['u8', 'u16', 'u32']);
    read = model.readBE(buffer);
    console.table(read);

    model = struct({ a: 'u8' });
    read = model.readBE(buffer);
    console.table(read);

    model = struct({ a: 'u8', b: 'u16', c: 'u32' });
    read = model.readBE(buffer);
    console.table(read);

    model = struct({ a: { b: 'u8', c: 'u16' }, d: 'u32' });
    read = model.readBE(buffer);
    console.table(read);

    model = struct({ a: 'u8', b: ['u16', 'u32'] });
    read = model.readBE(buffer);
    console.table(read);

    model = struct({ a: [{ b: 'u8' }, { c: 'u16' }, { d: 'u32' }] });
    read = model.readBE(buffer);
    console.table(read);
}
// Classic, base cases
{
    buffer = Buffer.from([11, 1, 0]);
    console.log(buffer.toString('hex')); // 0b0c0d0e0f

    // common case, Object
    model = struct({ a: 'u8' });
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // {"a":11}

    // Array
    model = struct(['u8']);
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // [11]

    // string as Object
    model = struct('u8 a;');
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // {"a":11}

    // JSON string as Object
    model = struct('{ "a": "u8" }');
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // {"a":11}

    // string as Array
    model = struct('[u8]');
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // [11]

    // JSON string as Array
    model = struct('["u8"]');
    read = model.readBE(buffer);
    console.log(JSON.stringify(read)); // [11]
}

buffer = Buffer.from([11, 12, 13, 14, 15]);
console.log(buffer.toString('hex')); // 0b0c0d0e0f
console.log(model);
//console.log(buffer.toString('utf8')); // abcABC
model;
read = model.readBE(buffer); // offset= 2, read= {a: 170, b: 187, c: 204}= {a: 0xaa, b: 0xbb, c:0xcc}
console.log(read);

model;